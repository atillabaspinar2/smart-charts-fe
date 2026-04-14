import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getMcpClient } from "@/mcp/mcpClient";
import { callMcpToolCached, decideNextActionCached } from "@/assistant/assistantCached";
import { synthesizeChartDataLLM } from "@/llm/llm";
import type { LlmRuntime } from "@/llm/llm";
import { listGeminiModels } from "@/llm/geminiModels";
import { useWorkspaceLayoutStore } from "@/store/workspaceLayoutStore";
import { useWorkspaceChartsStore } from "@/store/workspaceChartsStore";
import type { ChartData, ChartSettingsUnion } from "@/components/chartTypes";
import {
  defaultBarChartSettings,
  defaultLineChartSettings,
  defaultMapChartSettings,
  defaultPieChartSettings,
} from "@/components/chartTypes";

function defaultChartSettingsForData(data: ChartData): ChartSettingsUnion {
  switch (data.type) {
    case "line":
      return { ...defaultLineChartSettings };
    case "bar":
      return { ...defaultBarChartSettings };
    case "pie":
      return { ...defaultPieChartSettings };
    case "map":
      return { ...defaultMapChartSettings, mapName: data.mapName };
    default:
      return { ...defaultLineChartSettings };
  }
}

type AssistantPromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const LS_GEMINI_KEY = "assistant:geminiApiKey";
const LS_GEMINI_MODEL = "assistant:geminiModel";

export function AssistantPromptDialog({
  open,
  onOpenChange,
}: AssistantPromptDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [progressLines, setProgressLines] = useState<string[]>([]);
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("");
  const [modelOptions, setModelOptions] = useState<{ id: string; displayName: string }[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(
    () =>
      prompt.trim().length > 0 &&
      geminiKey.trim().length > 0 &&
      geminiModel.trim().length > 0 &&
      !isWorking,
    [prompt, geminiKey, geminiModel, isWorking],
  );

  const appendProgress = (line: string) => {
    setProgressLines((prev) => [...prev, line]);
  };

  useEffect(() => {
    if (open) return;
    setPrompt("");
    setIsWorking(false);
    setProgressLines([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    try {
      setGeminiKey(localStorage.getItem(LS_GEMINI_KEY) ?? "");
      setGeminiModel(localStorage.getItem(LS_GEMINI_MODEL) ?? "");
    } catch {
      // ignore
    }
  }, [open]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_GEMINI_KEY, geminiKey);
      localStorage.setItem(LS_GEMINI_MODEL, geminiModel);
    } catch {
      // ignore
    }
  }, [geminiKey, geminiModel]);

  useEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [prompt, open]);

  const loadGeminiModels = useCallback(async () => {
    if (!geminiKey.trim()) {
      setModelsError("Enter an API key first.");
      return;
    }
    setModelsLoading(true);
    setModelsError(null);
    try {
      const list = await listGeminiModels(geminiKey.trim());
      setModelOptions(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setModelsError(msg);
      setModelOptions([]);
    } finally {
      setModelsLoading(false);
    }
  }, [geminiKey]);

  const onCancel = () => {
    onOpenChange(false);
  };

  const onSend = async () => {
    if (!canSend) return;

    setIsWorking(true);
    appendProgress("Queued request…");

    try {
      if (!geminiKey.trim() || !geminiModel.trim()) {
        appendProgress("Enter your Gemini API key and model id.");
        return;
      }

      const runtime: LlmRuntime = {
        gemini: { apiKey: geminiKey.trim(), model: geminiModel.trim() },
      };

      appendProgress("Connecting to MCP…");
      const { tools } = await getMcpClient();
      appendProgress(`Discovered ${tools.tools.length} tools.`);

      appendProgress("Asking Gemini API what to do…");
      const toolInputs = tools.tools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      }));

      const { decision, fromCache: routerFromCache } = await decideNextActionCached({
        prompt,
        tools: toolInputs,
        runtime,
      });
      if (routerFromCache) appendProgress("Router cache hit.");

      if (decision.kind === "none") {
        appendProgress(`No tool call: ${decision.reason}`);
        return;
      }

      appendProgress(`Calling tool: ${decision.tool}`);
      const { result, fromCache: toolFromCache } = await callMcpToolCached(
        decision.tool,
        decision.args,
      );
      if (toolFromCache) appendProgress("Tool cache hit.");
      appendProgress("Tool call done.");
      console.log("[assistant] tool result", result);

      appendProgress("Generating ChartData with Gemini API…");
      const synthesized = await synthesizeChartDataLLM({
        prompt,
        toolName: decision.tool,
        toolResult: result,
        runtime,
      });
      const chartData = synthesized.chartData;

      appendProgress("Applying chart to workspace…");
      const layoutState = useWorkspaceLayoutStore.getState();
      const workspaceId = layoutState.activeWorkspaceId;
      // Always create a new chart for each assistant result.
      const targetInstanceId = useWorkspaceChartsStore
        .getState()
        .addChart(workspaceId, chartData.type).instanceId;

      useWorkspaceChartsStore.getState().upsertChartData(workspaceId, targetInstanceId, chartData);
      const titleFromLlm = synthesized.title?.trim();
      const titleFromPrompt = prompt.trim().replace(/\s+/g, " ").slice(0, 120);
      const nextTitle = titleFromLlm || titleFromPrompt;
      if (nextTitle) {
        const charts = useWorkspaceChartsStore.getState().chartsByWorkspaceId[workspaceId] ?? {};
        const entity = charts[targetInstanceId];
        // New charts start with chartSettings: null until ChartWorkspace hydrates them — merge title
        // into defaults so the chart shows the LLM title immediately.
        const base: ChartSettingsUnion =
          entity?.chartSettings ?? defaultChartSettingsForData(chartData);
        useWorkspaceChartsStore.getState().upsertChartSettings(workspaceId, targetInstanceId, {
          ...base,
          title: nextTitle,
        });
      }
      appendProgress("Done.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assistant</DialogTitle>
          <DialogDescription>
            Ask a question and we’ll fetch data + generate a chart. You need a Gemini API key and
            model (bring your own credentials).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="assistant-prompt">Prompt</Label>
          <textarea
            id="assistant-prompt"
            ref={promptRef}
            value={prompt}
            placeholder='e.g. "ankara population over time"'
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isWorking}
            rows={2}
            className={cn(
              "min-h-[calc(2lh+0.5rem)] w-full resize-none overflow-hidden rounded-md border border-input bg-input/20 px-2 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xs/relaxed dark:bg-input/30",
            )}
          />
        </div>

        <div className="grid gap-2">
          <div className="text-xs font-medium text-foreground/80">Gemini API</div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-1 md:col-span-2">
              <Label htmlFor="assistant-gemini-key">API key</Label>
              <input
                id="assistant-gemini-key"
                type="password"
                autoComplete="off"
                value={geminiKey}
                placeholder="Your Google AI Studio / Gemini API key"
                onChange={(e) => setGeminiKey(e.target.value)}
                disabled={isWorking}
                className={cn(
                  "w-full rounded-md border border-input bg-input/20 px-2 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xs/relaxed dark:bg-input/30",
                )}
              />
            </div>
            <div className="grid gap-1 md:col-span-2">
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Label htmlFor="assistant-gemini-model">Model</Label>
                  <input
                    id="assistant-gemini-model"
                    list="assistant-gemini-model-datalist"
                    value={geminiModel}
                    placeholder="Model id (use list or type)"
                    onChange={(e) => setGeminiModel(e.target.value)}
                    disabled={isWorking}
                    className={cn(
                      "mt-1 w-full rounded-md border border-input bg-input/20 px-2 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xs/relaxed dark:bg-input/30",
                    )}
                  />
                  <datalist id="assistant-gemini-model-datalist">
                    {modelOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName}
                      </option>
                    ))}
                  </datalist>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={isWorking || modelsLoading || !geminiKey.trim()}
                  onClick={() => void loadGeminiModels()}
                >
                  {modelsLoading ? "Loading…" : "List models"}
                </Button>
              </div>
              {modelsError && (
                <p className="text-xs text-destructive" role="status">
                  {modelsError}
                </p>
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Requests go from your browser to{" "}
            <code className="rounded bg-muted px-1 py-0.5">generativelanguage.googleapis.com</code>
            . Chart Studio does not supply an API key; use{" "}
            <a
              className="underline underline-offset-2 hover:text-foreground"
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
            >
              Google AI Studio
            </a>{" "}
            to create a key.
          </div>
        </div>

        <div className="rounded-md border border-foreground/10 bg-muted/30 p-2 text-xs/relaxed">
          <div className="font-medium text-foreground/80">Progress</div>
          <div className="mt-1 space-y-1">
            {progressLines.length === 0 ? (
              <div className="text-muted-foreground">Idle.</div>
            ) : (
              progressLines.map((line, idx) => (
                <div key={`${idx}-${line}`} className="text-muted-foreground">
                  {line}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isWorking}>
            Cancel
          </Button>
          <Button onClick={onSend} disabled={!canSend || isWorking}>
            {isWorking ? "Sending…" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
