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
import { cn } from "@/lib/utils";

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
  const [progressLines, setProgressLines] = useState<string[]>([]);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(() => prompt.trim().length > 0 && !isWorking, [
    prompt,
    isWorking,
  ]);

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
    const el = promptRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [prompt, open]);

  const onCancel = () => {
    // Placeholder for future abort-controller wiring.
    onOpenChange(false);
  };

  const onSend = async () => {
    if (!canSend) return;

    setIsWorking(true);
    appendProgress("Queued request…");

    try {
      appendProgress("Preparing…");
      // Intentionally minimal for now; real MCP+LLM work will be wired next.
      await new Promise((r) => setTimeout(r, 400));
      appendProgress("Done (stub). Check Network once wired.");
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
            Ask a question and we’ll fetch data + generate a chart.
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

