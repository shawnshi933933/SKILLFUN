/**
 * AI analysis service — uses Replit-managed Anthropic integration.
 * Analyzes raw skill.md / README.md content and returns structured metadata.
 */
import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../lib/logger.js";

const anthropic = new Anthropic({
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  apiKey:  process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "placeholder",
});

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
- instructions: 2–4 sentences, agent-facing, action-oriented; describe when to invoke this skill and any required parameters
`;

export async function analyzeSkillContent(
  rawContent: string,
  fileType: string,
  repoUrl: string
): Promise<SkillAnalysis> {
  const truncated = rawContent.slice(0, 8_000);

  logger.info({ repoUrl, fileType, chars: truncated.length }, "ai: analyzing skill content");

  const msg = await anthropic.messages.create({
    model:      "claude-haiku-4-5",
    max_tokens: 8192,
    system:     SYSTEM_PROMPT,
    messages: [{
      role:    "user",
      content: `Analyze this skill file (${fileType}) from the repo "${repoUrl}":\n\n${truncated}`,
    }],
  });

  const text = msg.content[0]?.type === "text" ? msg.content[0].text : "";

  // Extract JSON — may be wrapped in ```json``` fences
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    logger.warn({ text }, "ai: failed to extract JSON from response");
    throw new Error("AI returned unparseable response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    description:  typeof parsed.description  === "string" ? parsed.description.trim()  : "",
    capabilities: Array.isArray(parsed.capabilities) ? (parsed.capabilities as string[]).filter(Boolean) : [],
    tags:         Array.isArray(parsed.tags)          ? (parsed.tags          as string[]).filter(Boolean) : [],
    instructions: typeof parsed.instructions === "string" ? parsed.instructions.trim() : "",
  };
}
