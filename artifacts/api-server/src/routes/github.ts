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

const router = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchRaw(
  owner: string,
  repo: string,
  branch: string,
  filename: string
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (res.status === 200) return await res.text();
    return null;
  } catch {
    return null;
  }
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
// Route
// ---------------------------------------------------------------------------

router.get("/github/skill-manifest", async (req, res) => {
  const { repo } = req.query as { repo?: string };

  if (!repo || !repo.includes("/")) {
    apiError(res, ErrorCode.INVALID_INPUT, "repo must be in 'owner/repo' format");
    return;
  }

  const clean    = repo.replace(/^(https?:\/\/)?(www\.)?github\.com\//, "");
  const parts    = clean.split("/");
  const owner    = parts[0];
  const repoName = parts[1];

  if (!owner || !repoName) {
    apiError(res, ErrorCode.INVALID_INPUT, "Could not parse owner/repo");
    return;
  }

  logger.debug({ owner, repo: repoName }, "fetching skill manifest from GitHub");

  // 1. skillfun.json
  let hit = await fetchFile(owner, repoName, "skillfun.json");
  if (hit) {
    const parsed = parseSkillFunJson(hit.content);
    if (parsed) {
      res.json({
        found:      true,
        fileType:   "skillfun.json",
        rawContent: hit.content,
        parsed:     normalise(parsed),
        githubUrl:  `https://github.com/${owner}/${repoName}/blob/${hit.branch}/skillfun.json`,
      });
      return;
    }
  }

  // 2. skill.md
  hit = await fetchFile(owner, repoName, "skill.md");
  if (hit) {
    res.json({
      found:      true,
      fileType:   "skill.md",
      rawContent: hit.content,
      parsed:     normalise(parseSkillMd(hit.content)),
      githubUrl:  `https://github.com/${owner}/${repoName}/blob/${hit.branch}/skill.md`,
    });
    return;
  }

  // 3. README.md (partial)
  hit = await fetchFile(owner, repoName, "README.md");
  if (hit) {
    const snippet = hit.content.slice(0, 3000);
    res.json({
      found:      true,
      fileType:   "README.md",
      rawContent: snippet,
      parsed:     normalise(parseSkillMd(snippet)),
      githubUrl:  `https://github.com/${owner}/${repoName}/blob/${hit.branch}/README.md`,
      warning:    "No skillfun.json or skill.md found — using README.md. Add a skillfun.json for best results.",
    });
    return;
  }

  // 4. Not found
  res.json({
    found:      false,
    fileType:   null,
    rawContent: null,
    parsed:     {},
    githubUrl:  `https://github.com/${owner}/${repoName}`,
    warning:    "No skill manifest found. Fill in the form manually and add a skillfun.json to your repo.",
  });
});

export default router;
