export type GeminiModelOption = {
  /** Model id for `generateContent` (no `models/` prefix). */
  id: string;
  displayName: string;
};

/**
 * Lists models available to the API key that support `generateContent`.
 * https://ai.google.dev/api/rest/v1beta/models/list
 */
export async function listGeminiModels(apiKey: string): Promise<GeminiModelOption[]> {
  const key = apiKey.trim();
  if (!key) return [];

  const url = new URL("https://generativelanguage.googleapis.com/v1beta/models");
  url.searchParams.set("key", key);
  url.searchParams.set("pageSize", "100");

  const resp = await fetch(url.toString());
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(`Could not list models (${resp.status})${detail ? `: ${detail}` : ""}`);
  }

  const data = (await resp.json()) as {
    models?: Array<{
      name?: string;
      displayName?: string;
      supportedGenerationMethods?: string[];
    }>;
  };

  const raw = data.models ?? [];
  return raw
    .filter((m) => {
      const methods = m.supportedGenerationMethods ?? [];
      return methods.some((x) => String(x).toLowerCase() === "generatecontent");
    })
    .map((m) => {
      const name = m.name ?? "";
      const id = name.startsWith("models/") ? name.slice("models/".length) : name;
      return {
        id,
        displayName: (m.displayName ?? "").trim() || id,
      };
    })
    .filter((m) => m.id.length > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}
