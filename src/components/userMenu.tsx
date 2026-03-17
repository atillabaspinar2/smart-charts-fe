import "./popover.css";
import { useAuth } from "../context/AuthContext";
import { UserPopover } from "./userPopover";
import { ThemeSwitcher, type ThemeName } from "./themeSwitcher";
import { ThemedActionButton } from "./UILibrary/themedActionButton";

export const UserMenu: React.FC<{
  openAuthModal: (mode: "signup" | "signin") => void;
  selectedTheme: ThemeName;
  setSelectedTheme: (theme: ThemeName) => void;
  stacked?: boolean;
}> = ({ openAuthModal, selectedTheme, setSelectedTheme, stacked }) => {
  const { user, logout } = useAuth();

  return (
    <div
      className={`user-menu fit-content ${stacked ? "flex flex-col items-start gap-3" : "flex items-center space-x-2"}`}
    >
      <ThemeSwitcher
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
      />
      {!user ? (
        <div
          className={
            stacked ? "flex flex-col gap-2 w-full" : "flex items-center gap-2"
          }
        >
          <ThemedActionButton onClick={() => openAuthModal("signin")}>
            Login
          </ThemedActionButton>
          <ThemedActionButton onClick={() => openAuthModal("signup")}>
            Sign Up
          </ThemedActionButton>
        </div>
      ) : (
        <UserPopover user={user} signOut={logout} />
      )}
    </div>
  );
};
