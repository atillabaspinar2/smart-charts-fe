import { chartDataSchema } from "@/assistant/chartDataZod";
import { z } from "zod";

export type RouterDecision =
  | { kind: "tool"; tool: string; args: unknown }
  | { kind: "none"; reason: string };

type ToolForPrompt = {
  name: string;
  description?: string;
  inputSchema?: unknown;
};

export type LlmRuntime = {
  gemini: {
    apiKey: string;
    model: string;
  };
};

function stripCodeFences(s: string) {
  return s.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
}

async function geminiGenerateJson({
  apiKey,
  model,
  userText,
}: {
  apiKey: string;
  model: string;
  userText: string;
}): Promise<unknown> {
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent`,
  );
  url.searchParams.set("key", apiKey);

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: userText }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const resp = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(`Gemini HTTP ${resp.status}${detail ? `: ${detail}` : ""}`);
  }

  const json = (await resp.json()) as Record<string, unknown>;
  const candidates = json["candidates"] as unknown;
  const first =
    Array.isArray(candidates) && candidates[0] && typeof candidates[0] === "object"
      ? (candidates[0] as Record<string, unknown>)
      : null;
  const parts = first?.["content"] && typeof first["content"] === "object"
    ? ((first["content"] as Record<string, unknown>)["parts"] as unknown)
    : undefined;
  const partArr = Array.isArray(parts) ? parts : [];
  const text: string | undefined =
    typeof partArr[0] === "object" && partArr[0] !== null && "text" in partArr[0]
      ? String((partArr[0] as { text?: unknown }).text ?? "")
      : partArr
          .map((p) =>
            p && typeof p === "object" && "text" in p
              ? String((p as { text?: unknown }).text ?? "")
              : "",
          )
          .find((t) => t.length > 0);
  if (!text) throw new Error("Gemini returned no text");

  return JSON.parse(stripCodeFences(String(text)));
}

function cleanEntity(s: string) {
  return s
    .trim()
    .replace(/^["'`(]+/, "")
    .replace(/^\[+/, "")
    .replace(/["'`)\]]+$/, "")
    .replace(/\s+/g, " ");
}

function extractCompareEntities(prompt: string): string[] {
  const p = prompt.trim();
  const lower = p.toLowerCase();

  const vsMatch = /\b(.+?)\b(?:\s+vs\.?\s+|\s+versus\s+)\b(.+?)\b/i.exec(p);
  if (vsMatch) {
    const a = cleanEntity(vsMatch[1]);
    const b = cleanEntity(vsMatch[2]);
    if (a && b) return [a, b];
  }

  if (lower.includes("compare")) {
    const after = p.slice(lower.indexOf("compare") + "compare".length);
    const cut = after.split(/\b(from|to|between|since|over)\b/i)[0] ?? after;
    const parts = cut.split(/\s+(?:and|&)\s+/i).map(cleanEntity).filter(Boolean);
    if (parts.length >= 2) return [parts[0], parts[1]];
  }

  const named: string[] = [];
  if (lower.includes("istanbul")) named.push("Istanbul");
  if (lower.includes("ankara")) named.push("Ankara");
  if (named.length >= 2) return named.slice(0, 2);

  return [];
}

type ChartType = "line" | "bar" | "pie" | "map";

function detectRequestedChartType(prompt: string): {
  type: ChartType;
  explicitlyRequested: boolean;
} {
  const p = prompt.toLowerCase();

  // Explicit mentions first.
  if (/\b(map|choropleth)\b/.test(p)) return { type: "map", explicitlyRequested: true };
  if (/\b(pie|donut|doughnut)\b/.test(p)) return { type: "pie", explicitlyRequested: true };
  if (/\b(bar|bar chart|histogram|column chart)\b/.test(p))
    return { type: "bar", explicitlyRequested: true };
  if (/\b(line|line chart|time series)\b/.test(p))
    return { type: "line", explicitlyRequested: true };

  // No explicit request → default line.
  return { type: "line", explicitlyRequested: false };
}

function hasSeriesNamed(
  data: unknown,
  expectedNames: string[],
): data is {
  type: "line" | "bar";
  series: { name: string }[];
} {
  if (!expectedNames.length) return true;
  if (!data || typeof data !== "object") return false;
  const rec = data as Record<string, unknown>;
  const t = rec["type"];
  if (t !== "line" && t !== "bar") return false;
  const series = rec["series"];
  if (!Array.isArray(series)) return false;

  const got = new Set(
    series
      .map((s) =>
        s && typeof s === "object" && "name" in s && typeof (s as { name?: unknown }).name === "string"
          ? (s as { name: string }).name.toLowerCase()
          : "",
      )
      .filter(Boolean),
  );

  return expectedNames.every((n) => got.has(n.toLowerCase()));
}

export async function decideNextActionLLM({
  prompt,
  tools,
  runtime,
}: {
  prompt: string;
  tools: ToolForPrompt[];
  runtime: LlmRuntime;
}): Promise<RouterDecision> {
  const { apiKey, model } = runtime.gemini;
  if (!apiKey.trim() || !model.trim()) {
    return { kind: "none", reason: "Add your Gemini API key and model." };
  }

  const toolText = tools
    .map((t) => {
      const schemaHint =
        t.name === "search_web"
          ? " (args: { q: string })"
          : t.inputSchema
            ? " (args follow inputSchema)"
            : "";
      return `- ${t.name}${schemaHint}: ${t.description ?? ""}`.trim();
    })
    .join("\n");

  const system = [
    "You are a tool router for Chart Studio.",
    "Respond with JSON ONLY (no markdown).",
    'If a tool is needed: {"tool":"<name>","args":{...}}',
    'If no tool is needed: {"tool":null,"reason":"..."}',
    "Use exact argument keys. For search_web you MUST use args.q (not args.query).",
  ].join("\n");

  const userText = `Available tools:\n${toolText || "(none)"}\n\nUser prompt:\n${prompt}`;
  const parsedUnknown = await geminiGenerateJson({
    apiKey: apiKey.trim(),
    model: model.trim(),
    userText: `${system}\n\n${userText}`,
  });
  const parsed =
    parsedUnknown && typeof parsedUnknown === "object"
      ? (parsedUnknown as Record<string, unknown>)
      : {};

  if (typeof parsed["tool"] === "string") {
    const rawArgs = parsed["args"] ?? {};
    const normalizedArgs =
      parsed["tool"] === "search_web" &&
      rawArgs &&
      typeof rawArgs === "object" &&
      "query" in (rawArgs as Record<string, unknown>) &&
      !("q" in (rawArgs as Record<string, unknown>))
        ? {
            ...(rawArgs as Record<string, unknown>),
            q: (rawArgs as Record<string, unknown>).query,
          }
        : rawArgs;

    return { kind: "tool", tool: parsed["tool"], args: normalizedArgs };
  }

  return {
    kind: "none",
    reason: String(
      typeof parsed["reason"] === "string" ? parsed["reason"] : "No tool selected",
    ),
  };
}

export async function synthesizeChartDataLLM({
  prompt,
  toolName,
  toolResult,
  runtime,
}: {
  prompt: string;
  toolName: string;
  toolResult: unknown;
  runtime: LlmRuntime;
}): Promise<{ chartData: z.infer<typeof chartDataSchema>; title?: string }> {
  const { apiKey, model } = runtime.gemini;
  if (!apiKey.trim() || !model.trim()) {
    throw new Error("Gemini API key and model are required");
  }

  const expectedSeriesNames = extractCompareEntities(prompt);
  const requested = detectRequestedChartType(prompt);

  const baseSystem = [
    "You are Chart Studio chart generator.",
    "Return JSON only (no markdown). Output MUST be a single JSON object.",
    "Your output MUST be either:",
    '- ChartData (one of the shapes below), OR { "title": string, "chartData": ChartData }.',
    "The title should be short and reflect the user's prompt (e.g. 'Istanbul vs Ankara population (1960–2026)').",
    "",
    "ChartData shapes:",
    "- Line: { type:'line', categories:string[], series:{id,name,color,values:number[]}[] }",
    "- Bar: { type:'bar', categories:string[], series:{id,name,color,values:number[]}[] }",
    "- Pie: { type:'pie', data:{id,name,value:number}[] }",
    "- Map: { type:'map', mapName:string, series:{ data:{name,value:number}[] } }",
    "Rules: categories length must equal series.values length; values must be numbers; prefer line for time series.",
    "If the user asks to compare multiple entities, you MUST include one series per entity (line/bar) or one slice per entity (pie).",
    "",
    requested.explicitlyRequested
      ? `The user explicitly requested a ${requested.type} chart. You MUST output ChartData with type='${requested.type}'.`
      : "If the user did not explicitly request a chart type, you MUST output a line chart (type='line').",
    "",
    "Example output (line):",
    "{\"type\":\"line\",\"categories\":[\"1960\",\"1970\"],\"series\":[{\"id\":\"s1\",\"name\":\"Istanbul\",\"color\":\"#3b82f6\",\"values\":[1453000,2132000]}]}",
    "",
    "Example output (with title):",
    "{\"title\":\"Istanbul vs Ankara population (1960–2026)\",\"chartData\":{\"type\":\"line\",\"categories\":[\"1960\",\"1970\"],\"series\":[{\"id\":\"s1\",\"name\":\"Istanbul\",\"color\":\"#3b82f6\",\"values\":[1453000,2132000]},{\"id\":\"s2\",\"name\":\"Ankara\",\"color\":\"#f97316\",\"values\":[650000,960000]}]}}",
  ];

  const system =
    expectedSeriesNames.length >= 2
      ? baseSystem
          .concat([
            "",
            `For this request you MUST include line/bar series for EACH of: ${expectedSeriesNames.join(
              ", ",
            )}.`,
            "The series.name values MUST be exactly those names.",
          ])
          .join("\n")
      : baseSystem.join("\n");

  const user =
    `User prompt:\n${prompt}\n\nTool used: ${toolName}\nTool result:\n` +
    JSON.stringify(toolResult);

  const synthesisSchema = z.union([
    chartDataSchema,
    z.object({
      title: z.string().min(1).max(120),
      chartData: chartDataSchema,
    }),
  ]);

  const tryOnce = async (systemPrompt: string) => {
    const raw = await geminiGenerateJson({
      apiKey: apiKey.trim(),
      model: model.trim(),
      userText: `${systemPrompt}\n\n${user}`,
    });
    console.log("[assistant] synthesis raw", raw);
    const parsed = synthesisSchema.parse(raw);
    return "chartData" in parsed
      ? { chartData: parsed.chartData, title: parsed.title }
      : { chartData: parsed };
  };

  const first = await tryOnce(system);
  const expectedType: ChartType = requested.explicitlyRequested ? requested.type : "line";
  if (first.chartData.type !== expectedType) {
    const retrySystem = [
      system,
      "",
      `Your previous answer used the wrong chart type. Output type MUST be '${expectedType}'.`,
      "Return JSON only.",
    ].join("\n");
    return await tryOnce(retrySystem);
  }
  if (
    expectedSeriesNames.length >= 2 &&
    !hasSeriesNamed(first.chartData, expectedSeriesNames)
  ) {
    const retrySystem = [
      system,
      "",
      "Your previous answer was invalid because it did not include ALL required series.",
      `Return a line chart with TWO series named exactly: ${expectedSeriesNames.join(", ")}.`,
      "Do not include any other series.",
    ].join("\n");
    return await tryOnce(retrySystem);
  }

  return first;
}
