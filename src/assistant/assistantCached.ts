import { cacheGet, cacheSet, stableKey } from "@/assistant/cache";
import { decideNextAction, type RouterDecision } from "@/llm/geminiRouter";
import { callMcpTool } from "@/mcp/mcpClient";

const ROUTER_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const TOOL_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export async function decideNextActionCached(args: Parameters<typeof decideNextAction>[0]) {
  const model = (args.model ?? (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? "").trim();
  const toolNames = args.tools.map((t) => t.name).sort().join(",");
  const key = stableKey(["assistant:router", model, toolNames, args.prompt.trim()]);

  const cached = cacheGet<RouterDecision>(key);
  if (cached) return { decision: cached, fromCache: true };

  const decision = await decideNextAction(args);
  cacheSet(key, decision, ROUTER_TTL_MS);
  return { decision, fromCache: false };
}

export async function callMcpToolCached(name: string, args: unknown) {
  const key = stableKey([
    "assistant:tool",
    name,
    // args can be large; stringify is OK for dev caching.
    JSON.stringify(args ?? null),
  ]);

  const cached = cacheGet<unknown>(key);
  if (cached) return { result: cached, fromCache: true };

  const result = await callMcpTool(name, args);
  cacheSet(key, result, TOOL_TTL_MS);
  return { result, fromCache: false };
}

