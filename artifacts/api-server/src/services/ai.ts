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

const SYSTEM_PROMPT = `You are an MCP skill analyst. Given the raw content of a skill definition file, extract structured metadata for a skill marketplace listing.

Return ONLY valid JSON with exactly these fields:
{
  "description":  "One clear sentence describing what this skill does and for whom",
  "capabilities": ["tool_name_1", "tool_name_2"],
  "tags":         ["tag1", "tag2", "tag3"],
  "instructions": "A concise system-prompt-style guide for AI agents on how to use this skill"
}

Rules:
- description: max 1 sentence, plain language, no marketing fluff
- capabilities: actual MCP tool / function names this skill exposes; use snake_case; infer from context if not explicit (e.g. "get_weather", "search_web")
- tags: 3–6 lowercase tags, specific (e.g. "python", "finance", "data-analysis"); avoid generic terms like "tool" or "ai"
- instructions: 2–4 sentences, agent-facing, action-oriented; describe when to invoke this skill and any required parameters`;

export async function analyzeSkillContent(
  rawContent: string,
  fileType: string,
  repoUrl: string
): Promise<SkillAnalysis> {
  const client = buildClient();
  const model  = process.env.ZEROG_AI_MODEL ?? DEFAULT_MODEL;
  const truncated = rawContent.slice(0, 8_000);

  logger.info({ repoUrl, fileType, chars: truncated.length, model }, "ai: analyzing skill content via 0G Router");

  // 0gm-1.0-35b-a3b is a reasoning model: it spends tokens on internal "thinking"
  // before producing output. 1024 is exhausted by reasoning alone → content: null.
  // Use a large budget so the JSON output actually gets generated.
  const completion = await client.chat.completions.create({
    model,
    max_tokens: 8192,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role:    "user",
        content: `Analyze this skill file (${fileType}) from the repo "${repoUrl}":\n\n${truncated}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";

  // Extract JSON — may be wrapped in ```json``` fences
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    logger.warn({ text }, "ai: failed to extract JSON from response");
    throw new Error(`AI returned unparseable response: ${text.slice(0, 200)}`);
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    description:  typeof parsed.description  === "string" ? parsed.description.trim()  : "",
    capabilities: Array.isArray(parsed.capabilities) ? (parsed.capabilities as string[]).filter(Boolean) : [],
    tags:         Array.isArray(parsed.tags)          ? (parsed.tags          as string[]).filter(Boolean) : [],
    instructions: typeof parsed.instructions === "string" ? parsed.instructions.trim() : "",
  };
}
