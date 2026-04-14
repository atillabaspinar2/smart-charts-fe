/**
 * Backend origin for fetch (auth, MCP, etc.). Set `VITE_API_URL` at build time for production.
 * Browsers block public HTTPS pages from calling `localhost` (loopback / private network).
 */
export function getApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (trimmed) return trimmed;

  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      return "http://localhost:3000";
    }
  }

  throw new Error(
    "VITE_API_URL is not set. For production, set it to your deployed backend origin (e.g. https://api.example.com) and rebuild the frontend.",
  );
}
