import { useEffect, useMemo, useRef, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getMcpClient } from "@/mcp/mcpClient";
import { callMcpToolCached, decideNextActionCached } from "@/assistant/assistantCached";
import { synthesizeChartDataLLM } from "@/llm/llm";
import type { LlmRuntime } from "@/llm/llm";
import { useWorkspaceLayoutStore } from "@/store/workspaceLayoutStore";
import { useWorkspaceChartsStore } from "@/store/workspaceChartsStore";
import type { ChartData, ChartSettingsUnion } from "@/components/chartTypes";
import {
  defaultBarChartSettings,
  defaultLineChartSettings,
  defaultMapChartSettings,
  defaultPieChartSettings,
} from "@/components/chartTypes";
import {
  loadAssistantProfilesState,
  setSelectedAssistantProfileId,
  type AssistantProfile,
  type AssistantProfilesState,
} from "@/assistant/assistantProfiles";

function profileSelectLabel(p: AssistantProfile) {
  return `${p.label?.trim() || "Profile"}${
    p.geminiModel?.trim() ? ` — ${p.geminiModel.trim()}` : ""
  }`;
}

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

export function AssistantPromptDialog({
  open,
  onOpenChange,
}: AssistantPromptDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [progressLines, setProgressLines] = useState<
    Array<{ kind: "info" | "error"; code?: string; text: string }>
  >([]);
  const [profilesState, setProfilesState] = useState<AssistantProfilesState>(() =>
    loadAssistantProfilesState(),
  );
  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedProfile: AssistantProfile | null = useMemo(() => {
    const id = profilesState.selectedProfileId;
    if (!id) return null;
    return profilesState.profiles.find((p) => p.id === id) ?? null;
  }, [profilesState.profiles, profilesState.selectedProfileId]);

  const canSend = useMemo(
    () =>
      prompt.trim().length > 0 &&
      !!selectedProfile?.geminiApiKey?.trim() &&
      !!selectedProfile?.geminiModel?.trim() &&
      !isWorking,
    [prompt, selectedProfile?.geminiApiKey, selectedProfile?.geminiModel, isWorking],
  );

  const appendProgressInfo = (text: string) => {
    setProgressLines((prev) => [...prev, { kind: "info", text }]);
  };

  const appendProgressError = (code: string, text: string) => {
    setProgressLines((prev) => [...prev, { kind: "error", code, text }]);
  };

  const normalizeError = (e: unknown): { code: string; text: string } => {
    if (e instanceof Error) {
      const code = e.name?.trim() || "Error";
      const text = (e.message || "Unknown error").trim();
      return { code, text: text.replace(/\s+/g, " ").slice(0, 220) };
    }
    const text = String(e ?? "Unknown error").trim();
    return { code: "Error", text: text.replace(/\s+/g, " ").slice(0, 220) };
  };

  useEffect(() => {
    if (open) return;
    setPrompt("");
    setIsWorking(false);
    setHasCompleted(false);
    setProgressLines([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setProfilesState(loadAssistantProfilesState());
  }, [open]);

  useEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [prompt, open]);

  const onCancel = () => {
    onOpenChange(false);
  };

  const onSend = async () => {
    if (!canSend) return;

    setIsWorking(true);
    setHasCompleted(false);
    appendProgressInfo("Queued request…");

    try {
      if (!selectedProfile?.geminiApiKey?.trim() || !selectedProfile?.geminiModel?.trim()) {
        appendProgressInfo(
          "Select an Assistant profile (API key + model) in User menu → Settings.",
        );
        return;
      }

      const runtime: LlmRuntime = {
        gemini: {
          apiKey: selectedProfile.geminiApiKey.trim(),
          model: selectedProfile.geminiModel.trim(),
        },
      };

      appendProgressInfo("Connecting to MCP…");
      const { tools } = await getMcpClient();
      appendProgressInfo(`Discovered ${tools.tools.length} tools.`);

      appendProgressInfo("Asking Gemini API what to do…");
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
      if (routerFromCache) appendProgressInfo("Router cache hit.");

      if (decision.kind === "none") {
        appendProgressInfo(`No tool call: ${decision.reason}`);
        return;
      }

      appendProgressInfo(`Calling tool: ${decision.tool}`);
      const { result, fromCache: toolFromCache } = await callMcpToolCached(
        decision.tool,
        decision.args,
      );
      if (toolFromCache) appendProgressInfo("Tool cache hit.");
      appendProgressInfo("Tool call done.");
      console.log("[assistant] tool result", result);

      appendProgressInfo("Generating ChartData with Gemini API…");
      const synthesized = await synthesizeChartDataLLM({
        prompt,
        toolName: decision.tool,
        toolResult: result,
        runtime,
      });
      const chartData = synthesized.chartData;

      appendProgressInfo("Applying chart to workspace…");
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
      appendProgressInfo("Done.");
    } catch (e) {
      const { code, text } = normalizeError(e);
      appendProgressError(code, text);
    } finally {
      setIsWorking(false);
      setHasCompleted(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assistant</DialogTitle>
          <DialogDescription>
            Ask a question and we’ll fetch data + generate a chart. Pick a saved Gemini profile
            (API key + model) from settings.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="assistant-prompt">Prompt</Label>
          <textarea
            id="assistant-prompt"
            ref={promptRef}
            value={prompt}
            placeholder="e.g., New York vs Los Angeles population growth from 1960 to now, in two series in bar chart. one series for New York, another for Los Angeles. x axis should be years from 1900 to present, each year being a series item."
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isWorking}
            rows={2}
            className={cn(
              "min-h-[calc(2lh+0.5rem)] w-full resize-none overflow-hidden rounded-md border border-input bg-input/20 px-2 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xs/relaxed dark:bg-input/30",
            )}
          />
        </div>

        <div className="grid gap-2">
          <div className="text-xs font-medium text-foreground/80">Profile</div>
          <div className="grid gap-1">
            <Label htmlFor="assistant-profile">API key + model</Label>
            <Select
              value={profilesState.selectedProfileId ?? undefined}
              onValueChange={(id) => {
                setProfilesState((prev) =>
                  setSelectedAssistantProfileId(prev, id || null),
                );
              }}
              disabled={isWorking || profilesState.profiles.length === 0}
            >
              <SelectTrigger
                id="assistant-profile"
                className="h-auto min-h-8 w-full py-1.5 md:text-xs/relaxed"
              >
                <SelectValue
                  placeholder={
                    profilesState.profiles.length === 0
                      ? "No profiles (User menu → Settings → add a Gemini profile)"
                      : "Select a profile"
                  }
                />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[10002]">
                {profilesState.profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {profileSelectLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              LLM requests go from your browser to{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                generativelanguage.googleapis.com
              </code>
              . Manage profiles under <span className="font-medium">User menu → Settings</span>.
            </div>
          </div>
        </div>

        <div className="rounded-md border border-foreground/10 bg-muted/30 p-2 text-xs/relaxed">
          <div className="font-medium text-foreground/80">Progress</div>
          <div className="mt-1 space-y-1">
            {progressLines.length === 0 ? (
              <div className="text-muted-foreground">Idle.</div>
            ) : (
              progressLines.map((line, idx) => {
                const key = `${idx}-${line.kind}-${line.code ?? ""}-${line.text}`;
                if (line.kind === "error") {
                  return (
                    <div key={key} className="text-destructive">
                      <code className="rounded bg-destructive/10 px-1 py-0.5 text-[11px]">
                        {line.code ?? "Error"}
                      </code>{" "}
                      <span className="text-xs">{line.text}</span>
                    </div>
                  );
                }
                return (
                  <div key={key} className="text-muted-foreground">
                    {line.text}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isWorking}>
            Cancel
          </Button>
          {hasCompleted ? (
            <Button onClick={onCancel} disabled={isWorking}>
              Close
            </Button>
          ) : (
            <Button onClick={onSend} disabled={!canSend || isWorking}>
              {isWorking ? "Sending…" : "Send"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
