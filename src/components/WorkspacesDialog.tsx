import { useMemo, useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useWorkspaceLayoutStore } from "@/store/workspaceLayoutStore";
import { useWorkspaceChartsStore } from "@/store/workspaceChartsStore";

export function WorkspacesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const workspaces = useWorkspaceLayoutStore((s) => s.workspaces);
  const activeWorkspaceId = useWorkspaceLayoutStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useWorkspaceLayoutStore((s) => s.setActiveWorkspace);
  const createWorkspace = useWorkspaceLayoutStore((s) => s.createWorkspace);
  const renameWorkspace = useWorkspaceLayoutStore((s) => s.renameWorkspace);
  const deleteWorkspace = useWorkspaceLayoutStore((s) => s.deleteWorkspace);

  const deleteWorkspaceCharts = useWorkspaceChartsStore((s) => s.deleteWorkspaceCharts);

  const [newName, setNewName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [renameWorkspaceId, setRenameWorkspaceId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const confirmWorkspace = useMemo(
    () => workspaces.find((w) => w.id === confirmDeleteId) ?? null,
    [confirmDeleteId, workspaces],
  );

  const renameTarget = useMemo(
    () => workspaces.find((w) => w.id === renameWorkspaceId) ?? null,
    [renameWorkspaceId, workspaces],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>My workspaces</DialogTitle>
            <DialogDescription>
              Open an existing workspace or create a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Workspace name"
            />
            <Button
              variant="default"
              onClick={() => {
                createWorkspace(newName);
                setNewName("");
              }}
            >
              New
            </Button>
          </div>

          <div className="mt-2 flex-1 overflow-y-auto rounded-md border border-border">
            <div className="divide-y divide-border">
              {workspaces.map((ws) => {
                const isActive = ws.id === activeWorkspaceId;
                return (
                  <div
                    key={ws.id}
                    className="flex items-center justify-between gap-2 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {ws.name}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-muted-foreground">
                            (active)
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">
                        Updated {new Date(ws.updatedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setRenameWorkspaceId(ws.id);
                          setRenameValue(ws.name);
                        }}
                        aria-label={`Rename workspace ${ws.name}`}
                        title="Rename workspace"
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant={isActive ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => {
                          setActiveWorkspace(ws.id);
                          onOpenChange(false);
                        }}
                      >
                        Open
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={workspaces.length <= 1}
                        onClick={() => setConfirmDeleteId(ws.id)}
                        aria-label={`Delete workspace ${ws.name}`}
                        title="Delete workspace"
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDeleteId != null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setConfirmDeleteId(null);
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Delete workspace?</DialogTitle>
            <DialogDescription>
              {confirmWorkspace ? (
                <>
                  This will permanently delete{" "}
                  <span className="font-medium text-foreground">
                    {confirmWorkspace.name}
                  </span>
                  . This action cannot be undone.
                </>
              ) : (
                "This action cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!confirmDeleteId) return;
                // Remove chart data stored for this workspace as well.
                deleteWorkspaceCharts(confirmDeleteId);
                deleteWorkspace(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={renameWorkspaceId != null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setRenameWorkspaceId(null);
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Rename workspace</DialogTitle>
            <DialogDescription>
              {renameTarget ? (
                <>
                  Rename{" "}
                  <span className="font-medium text-foreground">
                    {renameTarget.name}
                  </span>
                  .
                </>
              ) : (
                "Enter a new name."
              )}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Workspace name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (!renameWorkspaceId) return;
              renameWorkspace(renameWorkspaceId, renameValue);
              setRenameWorkspaceId(null);
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameWorkspaceId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!renameWorkspaceId) return;
                renameWorkspace(renameWorkspaceId, renameValue);
                setRenameWorkspaceId(null);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

