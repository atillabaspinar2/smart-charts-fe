import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

type Cached = {
  client: Client;
  tools: Awaited<ReturnType<Client["listTools"]>>;
};

let cached: Promise<Cached> | null = null;

function getBaseUrl() {
  const raw = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
  return raw.trim() || "http://localhost:3000";
}

export async function getMcpClient(): Promise<Cached> {
  if (!cached) {
    cached = (async () => {
      const baseUrl = getBaseUrl();
      const transport = new StreamableHTTPClientTransport(
        new URL("/mcp", baseUrl),
      );

      const client = new Client({
        name: "chartstudio-fe",
        version: "0.0.0",
      });

      await client.connect(transport);
      const tools = await client.listTools();
      return { client, tools };
    })();
  }

  return cached;
}

export async function refreshMcpTools() {
  const { client } = await getMcpClient();
  const tools = await client.listTools();
  cached = Promise.resolve({ client, tools });
  return tools;
}

export async function callMcpTool(name: string, args: unknown) {
  const { client } = await getMcpClient();
  return await client.callTool({ name, arguments: args as any });
}

