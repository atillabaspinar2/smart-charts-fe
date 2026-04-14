import { cacheGet, cacheSet, stableKey } from "@/assistant/cache";
import { decideNextActionLLM, type RouterDecision } from "@/llm/llm";
import { callMcpTool } from "@/mcp/mcpClient";

const ROUTER_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const TOOL_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export async function decideNextActionCached(
  args: Parameters<typeof decideNextActionLLM>[0],
) {
  const g = args.runtime?.gemini;
  if (!g?.apiKey?.trim() || !g?.model?.trim()) {
    throw new Error("Gemini API key and model are required");
  }

  const toolNames = args.tools.map((t) => t.name).sort().join(",");
  const key = stableKey([
    "assistant:router",
    "gemini",
    g.model.trim(),
    toolNames,
    args.prompt.trim(),
  ]);

  const cached = cacheGet<RouterDecision>(key);
  if (cached) return { decision: cached, fromCache: true };

  const decision = await decideNextActionLLM(args);
  cacheSet(key, decision, ROUTER_TTL_MS);
  return { decision, fromCache: false };
}

export async function callMcpToolCached(name: string, args: unknown) {
  const key = stableKey([
    "assistant:tool",
    name,
    JSON.stringify(args ?? null),
  ]);

  const cached = cacheGet<unknown>(key);
  if (cached) return { result: cached, fromCache: true };

  const result = await callMcpTool(name, args);
  cacheSet(key, result, TOOL_TTL_MS);
  return { result, fromCache: false };
}
