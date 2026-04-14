import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { WorkspacesDialog } from "@/components/WorkspacesDialog";

export const UserPopover: React.FC<{
  user: { fullName: string; email: string };
  signOut: () => void;
  onOpenAssistantSettings?: () => void;
}> = ({ user, signOut, onOpenAssistantSettings }) => {
  const [workspacesOpen, setWorkspacesOpen] = useState(false);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-1 leading-tight">
            <span className="block text-[10px] text-muted-foreground">Signed in as</span>
            <span className="block">{user.fullName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setWorkspacesOpen(true);
            }}
          >
            My Workspaces
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onOpenAssistantSettings?.();
            }}
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              signOut();
            }}
            className="text-destructive focus:text-destructive"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <WorkspacesDialog open={workspacesOpen} onOpenChange={setWorkspacesOpen} />
    </div>
  );
};
