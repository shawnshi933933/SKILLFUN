/**
 * GET /api/github/skill-manifest?repo=owner/repo
 *
 * Fetches the skill definition file from a public GitHub repo.
 * Priority: skillfun.json → skill.md → README.md (first 3000 chars)
 *
 * Returns:
 *   { found, fileType, rawContent, parsed, githubUrl, warning? }
 */
import { Router } from "express";
import { apiError, ErrorCode } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { analyzeSkillContent } from "../services/ai.js";

const router = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchRaw(
  owner: string,
  repo: string,
  branch: string,
  filename: string,
  token?: string
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8_000),
      headers: { "Cache-Control": "no-cache" },
    });
    if (res.status === 200) return await res.text();
  } catch { /* try API fallback */ }

  // Private-repo fallback: use GitHub Contents API with OAuth token
  if (token) {
    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}?ref=${branch}`;
      const apiRes = await fetch(apiUrl, {
        signal: AbortSignal.timeout(8_000),
        headers: {
          Authorization: `Bearer ${token}`,
          Accept:         "application/vnd.github.v3+json",
          "User-Agent":   "SkillFun/1.0",
          "Cache-Control": "no-cache",
        },
      });
      if (apiRes.status === 200) {
        const data = await apiRes.json() as { content?: string; encoding?: string };
        if (data.encoding === "base64" && data.content) {
          return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
        }
      }
    } catch { /* ignore */ }
  }

  return null;
}

async function fetchFile(
  owner: string,
  repo: string,
  filename: string
): Promise<{ content: string; branch: string } | null> {
  for (const branch of ["main", "master"]) {
    const content = await fetchRaw(owner, repo, branch, filename);
    if (content !== null) return { content, branch };
  }
  return null;
}

function parseSkillFunJson(raw: string): Record<string, unknown> | null {
  try { return JSON.parse(raw); } catch { return null; }
}

function parseSkillMd(raw: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  // YAML front-matter ---\n...\n---
  const fm = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const m = line.match(/^([\w_-]+):\s*(.+)$/);
      if (!m) continue;
      const [, key, val] = m;
      if (val.startsWith("[") && val.endsWith("]")) {
        out[key] = val.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
      } else {
        out[key] = val.trim();
      }
    }
  }

  // Fallback: H1 as name
  if (!out.name) {
    const h1 = raw.match(/^#\s+(.+)$/m);
    if (h1) out.name = h1[1].trim();
  }
  // First non-heading paragraph as description
  if (!out.description) {
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (t && !t.startsWith("#") && !t.startsWith("---") && !t.startsWith("```") && !t.startsWith(">")) {
        out.description = t;
        break;
      }
    }
  }
  // Capabilities section
  if (!out.capabilities) {
    const sec = raw.match(/##\s+(?:capabilities?|tools?|functions?)[^\n]*\n([\s\S]*?)(?:\n##|$)/i);
    if (sec) {
      const caps = sec[1]
        .split("\n")
        .map((l) => l.replace(/^[-*•]\s*`?/, "").replace(/`.*/, "").trim())
        .filter((l) => l && !l.startsWith("#"));
      if (caps.length) out.capabilities = caps;
    }
  }
  return out;
}

function normalise(raw: Record<string, unknown>) {
  return {
    name:         typeof raw.name        === "string" ? raw.name        : undefined,
    description:  typeof raw.description === "string" ? raw.description : undefined,
    version:      typeof raw.version     === "string" ? raw.version     : undefined,
    category:     typeof raw.category    === "string" ? raw.category    : undefined,
    basePrice:    typeof raw.basePrice   === "number" ? raw.basePrice
                : typeof raw.base_price  === "number" ? raw.base_price
                : typeof raw.basePrice   === "string" ? (parseFloat(raw.basePrice) || undefined) : undefined,
    capabilities: Array.isArray(raw.capabilities) ? (raw.capabilities as string[]) : undefined,
    tags:         Array.isArray(raw.tags)          ? (raw.tags          as string[]) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Parse a GitHub URL / slug into { owner, repo, branch, subpath }
//
// Handles all common formats:
//   owner/repo
//   owner/repo/tree/branch/path/to/dir
//   https://github.com/owner/repo/tree/branch/path/to/dir
// ---------------------------------------------------------------------------

interface ParsedRepo {
  owner:    string;
  repo:     string;
  branch:   string | null;   // explicit branch from URL, null = try main/master
  subpath:  string | null;   // subdirectory path within the repo
}

function parseRepoInput(raw: string): ParsedRepo | null {
  // Strip protocol + domain
  const clean = raw
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//, "")
    .replace(/\/$/, "");

  const parts = clean.split("/");
  if (parts.length < 2) return null;

  const owner    = parts[0];
  const repoName = parts[1];
  if (!owner || !repoName) return null;

  // /tree/<branch>[/<subpath>]
  if (parts[2] === "tree" && parts[3]) {
    const branch  = parts[3];
    const subpath = parts.slice(4).join("/") || null;
    return { owner, repo: repoName, branch, subpath };
  }

  // /blob/<branch>[/<file>]  — strip file, keep directory
  if (parts[2] === "blob" && parts[3]) {
    const branch  = parts[3];
    const fileParts = parts.slice(4);
    // Drop last segment if it looks like a file (has an extension)
    const dirParts = fileParts.length > 0 && fileParts[fileParts.length - 1].includes(".")
      ? fileParts.slice(0, -1)
      : fileParts;
    const subpath = dirParts.join("/") || null;
    return { owner, repo: repoName, branch, subpath };
  }

  return { owner, repo: repoName, branch: null, subpath: null };
}

// Fetch from a specific branch (no auto-fallback), with optional OAuth token for private repos
async function fetchRawBranch(
  owner: string, repo: string, branch: string, filepath: string, token?: string
): Promise<string | null> {
  return fetchRaw(owner, repo, branch, filepath, token);
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

router.get("/github/skill-manifest", async (req, res) => {
  const { repo } = req.query as { repo?: string };

  if (!repo || !repo.includes("/")) {
    apiError(res, ErrorCode.INVALID_INPUT, "repo must be in 'owner/repo' format");
    return;
  }

  const parsed = parseRepoInput(repo);
  if (!parsed) {
    apiError(res, ErrorCode.INVALID_INPUT, "Could not parse owner/repo from input");
    return;
  }

  const { owner, repo: repoName, branch: explicitBranch, subpath } = parsed;

  // Optional GitHub OAuth token from session — enables private-repo access
  const token: string | undefined = req.session?.githubToken;

  logger.debug({ owner, repo: repoName, subpath, hasToken: !!token }, "fetching skill manifest from GitHub");

  // Branches to try (explicit branch takes priority)
  const branches = explicitBranch ? [explicitBranch] : ["main", "master"];

  // Build search paths: subdir first, then root
  // Case variants — GitHub raw is case-sensitive
  const skillFiles = ["skillfun.json", "skill.md", "SKILL.md", "Skill.md"] as const;
  const readmeFiles = ["README.md", "readme.md"] as const;

  // Helper: try a filename across all candidate branches, optionally with subpath prefix
  async function tryFile(
    filename: string,
    dirs: string[]
  ): Promise<{ content: string; branch: string; dir: string } | null> {
    for (const branch of branches) {
      for (const dir of dirs) {
        const filepath = dir ? `${dir}/${filename}` : filename;
        const content = await fetchRawBranch(owner, repoName, branch, filepath, token);
        if (content !== null) return { content, branch, dir };
      }
    }
    return null;
  }

  const dirs = subpath ? [subpath, ""] : [""];

  // 1. skillfun.json
  let hit = await tryFile("skillfun.json", dirs);
  if (hit) {
    const parsedJson = parseSkillFunJson(hit.content);
    if (parsedJson) {
      const filepath = hit.dir ? `${hit.dir}/skillfun.json` : "skillfun.json";
      res.json({
        found:      true,
        fileType:   "skillfun.json",
        rawContent: hit.content,
        parsed:     normalise(parsedJson),
        githubUrl:  `https://github.com/${owner}/${repoName}/blob/${hit.branch}/${filepath}`,
      });
      return;
    }
  }

  // 2. skill.md / SKILL.md (case variants)
  for (const fname of ["skill.md", "SKILL.md", "Skill.md"] as const) {
    hit = await tryFile(fname, dirs);
    if (hit) {
      const filepath = hit.dir ? `${hit.dir}/${fname}` : fname;
      res.json({
        found:      true,
        fileType:   fname,
        rawContent: hit.content,
        parsed:     normalise(parseSkillMd(hit.content)),
        githubUrl:  `https://github.com/${owner}/${repoName}/blob/${hit.branch}/${filepath}`,
      });
      return;
    }
  }

  // 3. README.md (subdir first, then root)
  hit = await tryFile("README.md", dirs);
  if (hit) {
    const snippet  = hit.content.slice(0, 3000);
    const filepath = hit.dir ? `${hit.dir}/README.md` : "README.md";
    res.json({
      found:      true,
      fileType:   "README.md",
      rawContent: snippet,
      parsed:     normalise(parseSkillMd(snippet)),
      githubUrl:  `https://github.com/${owner}/${repoName}/blob/${hit.branch}/${filepath}`,
      warning:    "No skillfun.json or skill.md found — using README.md. Add a skillfun.json for best results.",
    });
    return;
  }

  // 4. Not found — detect whether repo might be private (no token, or token missing repo scope)
  const hasRepoScope = req.session?.githubTokenHasRepoScope ?? false;
  const possiblyPrivate = !token || !hasRepoScope;
  res.json({
    found:           false,
    fileType:        null,
    rawContent:      null,
    parsed:          {},
    githubUrl:       `https://github.com/${owner}/${repoName}`,
    warning:         "No skill manifest found. Fill in the form manually and add a skillfun.json to your repo.",
    possiblyPrivate,
  });
});

// ---------------------------------------------------------------------------
// Simple per-IP rate limiter for the AI analyze endpoint
// 10 requests per 10-minute window per IP
// ---------------------------------------------------------------------------

interface RateBucket { count: number; resetAt: number }
const _rateBuckets = new Map<string, RateBucket>();
const AI_RATE_LIMIT  = 10;
const AI_RATE_WINDOW = 10 * 60 * 1_000; // 10 min in ms

/** Returns true if the request should be allowed, false if rate-limited. */
function allowAiRequest(ip: string): boolean {
  const now = Date.now();
  const bucket = _rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    _rateBuckets.set(ip, { count: 1, resetAt: now + AI_RATE_WINDOW });
    // Periodically prune expired buckets to prevent memory growth
    if (_rateBuckets.size > 10_000) {
      for (const [k, v] of _rateBuckets) {
        if (now > v.resetAt) _rateBuckets.delete(k);
      }
    }
    return true;
  }
  if (bucket.count >= AI_RATE_LIMIT) return false;
  bucket.count++;
  return true;
}

// ---------------------------------------------------------------------------
// POST /api/github/ai-analyze
// Body: { rawContent: string; fileType: string; repoUrl: string }
// Returns: { description, capabilities, tags, instructions }
//
// Protected by:
//   • Per-IP rate limit (10 req / 10 min)
//   • rawContent capped at 50 KB before forwarding to AI
// ---------------------------------------------------------------------------

const MAX_RAW_BYTES = 50_000; // 50 KB hard cap

router.post("/github/ai-analyze", async (req, res) => {
  // ── Rate limit ────────────────────────────────────────────────────────────
  const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim()
    ?? req.socket.remoteAddress
    ?? "unknown";

  if (!allowAiRequest(ip)) {
    res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many AI analysis requests — please wait a few minutes." } });
    return;
  }

  // ── Input validation ──────────────────────────────────────────────────────
  const { rawContent, fileType, repoUrl } = req.body as {
    rawContent?: string;
    fileType?:   string;
    repoUrl?:    string;
  };

  if (!rawContent || typeof rawContent !== "string") {
    apiError(res, ErrorCode.INVALID_INPUT, "rawContent is required");
    return;
  }
  if (!fileType || typeof fileType !== "string") {
    apiError(res, ErrorCode.INVALID_INPUT, "fileType is required");
    return;
  }

  // ── Call AI service ───────────────────────────────────────────────────────
  try {
    const result = await analyzeSkillContent(
      rawContent.slice(0, MAX_RAW_BYTES), // enforce cap server-side too
      fileType,
      typeof repoUrl === "string" ? repoUrl : "unknown"
    );
    res.json(result);
  } catch (err) {
    // Log full error server-side; return a generic message to the client
    logger.error({ err, ip, fileType }, "ai-analyze: upstream AI call failed");
    apiError(res, ErrorCode.INTERNAL, "AI analysis failed — please try again later");
  }
});

export default router;
