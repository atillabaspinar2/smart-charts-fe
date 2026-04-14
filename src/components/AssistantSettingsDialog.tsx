import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { listGeminiModels } from "@/llm/geminiModels";
import {
  createEmptyAssistantProfileDraft,
  deleteAssistantProfile,
  loadAssistantGeminiModelList,
  loadAssistantProfilesState,
  saveAssistantGeminiModelList,
  setSelectedAssistantProfileId,
  upsertAssistantProfile,
  type AssistantProfile,
  type AssistantProfilesState,
} from "@/assistant/assistantProfiles";

type AssistantSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const inputClass = cn(
  "min-w-0 flex-1 rounded-md border border-input bg-input/20 px-2 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 md:text-xs/relaxed dark:bg-input/30",
);

function profileDisplayLabel(p: AssistantProfile) {
  const label = p.label?.trim() || "Profile";
  const model = p.geminiModel?.trim();
  return model ? `${label} — ${model}` : label;
}

export function AssistantSettingsDialog({
  open,
  onOpenChange,
}: AssistantSettingsDialogProps) {
  const [state, setState] = useState<AssistantProfilesState>(() =>
    loadAssistantProfilesState(),
  );
  const [draft, setDraft] = useState<AssistantProfile>(() =>
    createEmptyAssistantProfileDraft(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  const [modelOptions, setModelOptions] = useState<
    { id: string; displayName: string }[]
  >([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const loaded = loadAssistantProfilesState();
    setState(loaded);
    setEditingId(null);
    setDraft(createEmptyAssistantProfileDraft());
    setModelOptions(loadAssistantGeminiModelList());
    setModelsError(null);
    setModelsLoading(false);
  }, [open]);

  const selectedProfile = useMemo(() => {
    const id = state.selectedProfileId;
    if (!id) return null;
    return state.profiles.find((p) => p.id === id) ?? null;
  }, [state.profiles, state.selectedProfileId]);

  const canCommit = useMemo(() => {
    return (
      draft.geminiApiKey.trim().length > 0 && draft.geminiModel.trim().length > 0
    );
  }, [draft.geminiApiKey, draft.geminiModel]);

  /** Profile may reference a model id not in the last refreshed list. */
  const modelOptionExtra = useMemo(() => {
    const id = draft.geminiModel.trim();
    if (!id || modelOptions.some((m) => m.id === id)) return null;
    return { id, displayName: id };
  }, [draft.geminiModel, modelOptions]);

  const startEdit = (p: AssistantProfile) => {
    setEditingId(p.id);
    setDraft({ ...p });
    setModelsError(null);
  };

  const resetDraft = () => {
    setEditingId(null);
    setDraft(createEmptyAssistantProfileDraft());
    setModelsError(null);
  };

  const commitRow = () => {
    if (!canCommit) return;
    setState((prev) =>
      upsertAssistantProfile(prev, {
        id: draft.id,
        label: draft.label.trim() || "Profile",
        geminiApiKey: draft.geminiApiKey,
        geminiModel: draft.geminiModel,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      }),
    );
    resetDraft();
  };

  const onDelete = (id: string) => {
    setState((prev) => deleteAssistantProfile(prev, id));
    if (editingId === id) resetDraft();
  };

  const onSelectActive = (id: string) => {
    setState((prev) => setSelectedAssistantProfileId(prev, id));
  };

  const refreshModelList = useCallback(async () => {
    const key = draft.geminiApiKey.trim();
    if (!key) {
      setModelsError("Enter an API key in the row first.");
      return;
    }
    setModelsLoading(true);
    setModelsError(null);
    try {
      const list = await listGeminiModels(key);
      saveAssistantGeminiModelList(list);
      setModelOptions(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setModelsError(msg);
    } finally {
      setModelsLoading(false);
    }
  }, [draft.geminiApiKey]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Assistant settings</DialogTitle>
          <DialogDescription>
            Manage saved Gemini profiles (API key + model). The Assistant prompt dialog only lets
            you pick one of these profiles.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="rounded-md border border-foreground/10 bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-medium text-foreground/80">
                Saved profiles
              </div>
              {selectedProfile ? (
                <div className="text-xs text-muted-foreground">
                  Active:{" "}
                  <span className="text-foreground/80">
                    {profileDisplayLabel(selectedProfile)}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No active profile
                </div>
              )}
            </div>

            {state.profiles.length === 0 ? (
              <div className="mt-2 text-xs text-muted-foreground">
                No profiles yet. Fill the row below and click Add.
              </div>
            ) : (
              <div className="mt-2 grid gap-2">
                {state.profiles.map((p) => {
                  const isActive = state.selectedProfileId === p.id;
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-2 rounded-md border border-foreground/10 bg-background/40 px-2 py-2",
                        isActive && "ring-2 ring-ring/30",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium">
                          {profileDisplayLabel(p)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          API key: {p.geminiApiKey?.trim() ? "saved" : "missing"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={isActive ? "secondary" : "outline"}
                          onClick={() => onSelectActive(p.id)}
                        >
                          {isActive ? "Active" : "Make active"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(p.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <div className="text-xs font-medium text-foreground/80">
              {editingId ? "Edit profile" : "New profile"}
            </div>

            <div
              className={cn(
                "flex flex-wrap items-center gap-2",
                modelsError && "pb-0",
              )}
            >
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                disabled={!canCommit}
                onClick={commitRow}
              >
                {editingId ? "Update" : "Add"}
              </Button>
              <input
                aria-label="Profile label"
                value={draft.label}
                placeholder="Label"
                onChange={(e) => setDraft((p) => ({ ...p, label: e.target.value }))}
                className={cn(inputClass, "min-w-[6rem] max-w-[10rem]")}
              />
              <input
                aria-label="Gemini API key"
                id="assistant-profile-key"
                type="password"
                autoComplete="off"
                value={draft.geminiApiKey}
                placeholder="API key"
                onChange={(e) =>
                  setDraft((p) => ({ ...p, geminiApiKey: e.target.value }))
                }
                className={cn(inputClass, "min-w-[10rem] max-w-[14rem]")}
              />
              <div className="min-w-[12rem] max-w-[20rem] flex-1">
                <Select
                  value={draft.geminiModel.trim() || undefined}
                  onValueChange={(v) =>
                    setDraft((p) => ({ ...p, geminiModel: v }))
                  }
                  disabled={modelsLoading}
                >
                  <SelectTrigger
                    id="assistant-profile-model"
                    aria-label="Gemini model"
                    size="sm"
                    className="h-8 w-full bg-background"
                  >
                    <SelectValue placeholder="Select model…" />
                  </SelectTrigger>
                <SelectContent position="popper" className="z-[10002]">
                  {modelOptionExtra ? (
                    <SelectItem value={modelOptionExtra.id}>
                      {modelOptionExtra.displayName}
                    </SelectItem>
                  ) : null}
                  {modelOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
              </div>
              {editingId ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-muted-foreground"
                  onClick={resetDraft}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
            {modelsError && (
              <p className="text-xs text-destructive" role="status">
                {modelsError}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            disabled={modelsLoading || !draft.geminiApiKey.trim()}
            onClick={() => void refreshModelList()}
          >
            {modelsLoading ? "Refreshing…" : "Refresh model list"}
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
