type GeminiTool = {
  name: string;
  description?: string;
  inputSchema?: unknown;
};

export type RouterDecision =
  | { kind: "tool"; tool: string; args: unknown }
  | { kind: "none"; reason: string };

function getApiKey() {
  const key = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? "";
  return key.trim();
}

function stripCodeFences(s: string) {
  return s.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function resolveModelId(model: string) {
  return model === "gemini-3.1-flash-lite"
    ? "gemini-3.1-flash-lite-preview"
    : model;
}

async function callGeminiGenerateContent({
  apiKey,
  model,
  body,
}: {
  apiKey: string;
  model: string;
  body: unknown;
}): Promise<Response> {
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      resolveModelId(model),
    )}:generateContent`,
  );
  url.searchParams.set("key", apiKey);

  return await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function decideNextAction({
  prompt,
  tools,
  model = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ??
    "gemini-3.1-flash-lite-preview",
}: {
  prompt: string;
  tools: GeminiTool[];
  model?: string;
}): Promise<RouterDecision> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { kind: "none", reason: "Missing VITE_GEMINI_API_KEY" };
  }

  const toolText = tools
    .map((t) => {
      const schemaHint =
        t.name === "search_web"
          ? " (args: { q: string })"
          : t.inputSchema
            ? ` (args follow inputSchema)`
            : "";
      return `- ${t.name}${schemaHint}: ${t.description ?? ""}`.trim();
    })
    .join("\n");

  const system = [
    "You are a tool router for Chart Studio.",
    "You must respond with JSON ONLY (no markdown).",
    "If a tool is needed, respond with: {\"tool\":\"<name>\",\"args\":{...}}",
    "If no tool is needed, respond with: {\"tool\":null,\"reason\":\"...\"}",
    "Prefer using tools when factual data is required.",
    "Use exact argument keys as specified by tools. For search_web you MUST use args.q (not args.query).",
    "",
    "Available tools:",
    toolText || "(none)",
  ].join("\n");

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${system}\n\nUser prompt:\n${prompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  // Prefer the configured model, but fall back to other free-tier models if
  // the chosen model is temporarily overloaded (503 UNAVAILABLE).
  const fallbackModels = [
    model,
    "gemini-2.5-flash",
    "gemini-3-flash",
    "gemini-2.5-flash-lite",
  ].map(resolveModelId);
  const uniqueModels = Array.from(new Set(fallbackModels));

  let lastNonOk: { status: number; detail: string } | null = null;
  for (const m of uniqueModels) {
    // Small backoff loop for transient overloads.
    for (let attempt = 0; attempt < 3; attempt++) {
      const resp = await callGeminiGenerateContent({ apiKey, model: m, body });
      if (resp.ok) {
        const json = (await resp.json()) as any;
        const text: string | undefined =
          json?.candidates?.[0]?.content?.parts?.[0]?.text ??
          json?.candidates?.[0]?.content?.parts?.find?.((p: any) => p?.text)
            ?.text;

        if (!text) return { kind: "none", reason: "Gemini returned no text" };

        let parsed: any;
        try {
          parsed = JSON.parse(stripCodeFences(String(text)));
        } catch {
          return { kind: "none", reason: "Failed to parse Gemini JSON" };
        }

        if (parsed?.tool && typeof parsed.tool === "string") {
          const rawArgs = parsed.args ?? {};
          // Compatibility: some models may return {query:"..."}; normalize to {q:"..."}.
          const normalizedArgs =
            parsed.tool === "search_web" &&
            rawArgs &&
            typeof rawArgs === "object" &&
            "query" in (rawArgs as Record<string, unknown>) &&
            !("q" in (rawArgs as Record<string, unknown>))
              ? {
                  ...(rawArgs as Record<string, unknown>),
                  q: (rawArgs as Record<string, unknown>).query,
                }
              : rawArgs;

          return { kind: "tool", tool: parsed.tool, args: normalizedArgs };
        }

        return {
          kind: "none",
          reason: String(parsed?.reason ?? "No tool selected"),
        };
      }

      let detail = "";
      try {
        detail = await resp.text();
      } catch {
        // ignore
      }

      // Retry on transient overload only.
      if (resp.status === 503) {
        lastNonOk = { status: resp.status, detail };
        await sleep(250 * Math.pow(2, attempt)); // 250ms, 500ms, 1000ms
        continue;
      }

      // For non-503 errors, stop immediately (quota/auth/etc.).
      return {
        kind: "none",
        reason: `Gemini HTTP ${resp.status}${detail ? `: ${detail}` : ""}`,
      };
    }
  }

  return {
    kind: "none",
    reason: `Gemini unavailable (503). Tried models: ${uniqueModels.join(", ")}${lastNonOk?.detail ? `. Last response: ${lastNonOk.detail}` : ""}`,
  };
}

