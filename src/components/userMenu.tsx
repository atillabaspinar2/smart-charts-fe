import { useAuth } from "../context/AuthContext";
import { UserPopover } from "./userPopover";
import { ThemeSwitcher } from "./themeSwitcher";
import { Button } from "@/components/ui/button";

export const UserMenu: React.FC<{
  openAuthModal: (mode: "signup" | "signin") => void;
  stacked?: boolean;
}> = ({ openAuthModal, stacked }) => {
  const { user, logout } = useAuth();

  return (
    <div
      className={`user-menu fit-content ${stacked ? "flex flex-col items-start gap-3" : "flex items-center space-x-2"}`}
    >
      <ThemeSwitcher />
      {!user ? (
        <div
          className={
            stacked ? "flex flex-col gap-2 w-full" : "flex items-center gap-2"
          }
        >
          <Button
            variant="outline"
            size="lg"
            className="border-zinc-500/60 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 bg-transparent"
            onClick={() => openAuthModal("signin")}
          >
            Login
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-zinc-500/60 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 bg-transparent"
            onClick={() => openAuthModal("signup")}
          >
            Sign Up
          </Button>
        </div>
      ) : (
        <UserPopover user={user} signOut={logout} />
      )}
    </div>
  );
};
