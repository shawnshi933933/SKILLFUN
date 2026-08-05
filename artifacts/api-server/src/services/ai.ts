/**
 * AI analysis service — uses 0G Router API (OpenAI-compatible).
 * Analyzes raw skill.md / README.md content and returns structured metadata.
 *
 * Base URL : ZEROG_AI_BASE_URL   (default: https://router-api.0g.ai/v1)
 * API key  : ZEROG_AI_API_KEY
 * Model    : ZEROG_AI_MODEL      (default: 0gm-1.0-35b-a3b)
 *
 * Docs: https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/quickstart
 */
import OpenAI from "openai";
import { logger } from "../lib/logger.js";

function buildClient(): OpenAI {
  // Normalise: strip trailing slash, then ensure the path ends with /v1
  const raw     = (process.env.ZEROG_AI_BASE_URL ?? "https://router-api.0g.ai/v1").replace(/\/+$/, "");
  const baseURL = raw.endsWith("/v1") ? raw : `${raw}/v1`;
  const apiKey  = process.env.ZEROG_AI_API_KEY  ?? "missing";
  return new OpenAI({ baseURL, apiKey });
}

const DEFAULT_MODEL = "0gm-1.0-35b-a3b-sia";

export interface SkillAnalysis {
  description:  string;
  capabilities: string[];
  tags:         string[];
  instructions: string;
}

// Canonical tag vocabulary — fallback when no existing marketplace tag fits.
// Prefer tags already used in the marketplace DB over these.
const CANONICAL_TAGS = [
  // Languages & runtimes
  "python", "javascript", "typescript", "rust", "go", "java", "bash", "sql",
  // AI / ML
  "llm", "nlp", "computer-vision", "embeddings", "rag", "fine-tuning", "image-gen",
  // Data
  "data-analysis", "data-extraction", "web-scraping", "csv", "json", "database",
  // Web & APIs
  "api-integration", "rest", "graphql", "webhook", "browser-automation",
  // Finance & trading
  "finance", "trading", "defi", "crypto", "blockchain", "web3", "nft",
  // Creative & media
  "creative-coding", "generative-art", "image-processing", "audio", "video",
  "writing", "summarization", "translation",
  // Dev tools
  "code-generation", "code-review", "testing", "devops", "git",
  // Productivity & knowledge
  "research", "search", "document-processing", "calendar", "email", "crm",
  // Platforms / ecosystems
  "openai", "anthropic", "huggingface", "github", "slack", "notion",
  "p5js", "threejs", "react", "nodejs",
  // 0G ecosystem
  "0g-storage", "0g-chain", "mcp",
] as const;

function buildSystemPrompt(existingDbTags: string[]): string {
  const dbSection = existingDbTags.length > 0
    ? `
PRIORITY 1 — Tags already in use in our marketplace (reuse these first, they are the preferred vocabulary):
  ${existingDbTags.join(", ")}

PRIORITY 2 — Canonical fallback tags (use only when no marketplace tag fits):
  ${CANONICAL_TAGS.join(", ")}`
    : `
Canonical tag vocabulary (prefer these):
  ${CANONICAL_TAGS.join(", ")}`;

  return `You are an MCP skill analyst. Given the raw content of a skill definition file, extract structured metadata for a skill marketplace listing.

Return ONLY valid JSON with exactly these fields:
{
  "description":  "One clear sentence describing what this skill does and for whom",
  "capabilities": ["tool_name_1", "tool_name_2"],
  "tags":         ["tag1", "tag2"],
  "instructions": "A concise system-prompt-style guide for AI agents on how to use this skill"
}

Rules:
- description: max 1 sentence, plain language, no marketing fluff
- capabilities: actual MCP tool / function names this skill exposes; use snake_case; infer from context if not explicit (e.g. "get_weather", "search_web"). Max 8.
- tags: pick EXACTLY 2–5 tags. Never more than 5. Tag selection priority:
${dbSection}
  PRIORITY 3 — Invent a new tag ONLY if nothing in Priority 1 or 2 fits. Keep it lowercase, hyphenated, and highly specific.
  IMPORTANT: reuse marketplace tags over inventing new ones. Keep the total tag set small and precise — do not add broad or redundant tags.
- instructions: 2–4 sentences, agent-facing, action-oriented; describe when to invoke this skill and any required parameters`;
}

/**
 * Extract the first syntactically complete JSON object from a string.
 * More robust than a greedy regex when the model appends prose after the JSON block.
 */
function extractFirstJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape)              { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true;  continue; }
    if (ch === '"')          { inString = !inString; continue; }
    if (inString)            continue;
    if (ch === "{")          depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)) as Record<string, unknown>; }
        catch { return null; }
      }
    }
  }
  return null;
}

export async function analyzeSkillContent(
  rawContent: string,
  fileType: string,
  repoUrl: string,
  /** Tags already in use across all marketplace skills — AI prefers reusing these. */
  existingDbTags: string[] = []
): Promise<SkillAnalysis> {
  const client = buildClient();
  const model  = process.env.ZEROG_AI_MODEL ?? DEFAULT_MODEL;
  const truncated = rawContent.slice(0, 8_000);

  logger.info({ repoUrl, fileType, chars: truncated.length, model, existingTagCount: existingDbTags.length }, "ai: analyzing skill content via 0G Router");

  const completion = await client.chat.completions.create({
    model,
    max_tokens: 8192,
    messages: [
      { role: "system", content: buildSystemPrompt(existingDbTags) },
      {
        role:    "user",
        content: `Analyze this skill file (${fileType}) from the repo "${repoUrl}":\n\n${truncated}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";

  const parsed = extractFirstJson(text);
  if (!parsed) {
    logger.warn({ text: text.slice(0, 500) }, "ai: failed to extract JSON from response");
    throw new Error(`AI returned unparseable response: ${text.slice(0, 200)}`);
  }

  // Enforce max 5 tags
  const rawTags: string[] = Array.isArray(parsed.tags) ? (parsed.tags as string[]).filter(Boolean) : [];
  const tags = rawTags.slice(0, 5);

  return {
    description:  typeof parsed.description  === "string" ? parsed.description.trim()  : "",
    capabilities: Array.isArray(parsed.capabilities) ? (parsed.capabilities as string[]).filter(Boolean).slice(0, 8) : [],
    tags,
    instructions: typeof parsed.instructions === "string" ? parsed.instructions.trim() : "",
  };
}
