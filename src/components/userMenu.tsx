import "./popover.css";
import { useAuth } from "../context/AuthContext";
import { UserPopover } from "./userPopover";
import { ThemeSwitcher, type ThemeName } from "./themeSwitcher";
import { ThemedActionButton } from "./UILibrary/themedActionButton";

export const UserMenu: React.FC<{
  openAuthModal: (mode: "signup" | "signin") => void;
  selectedTheme: ThemeName;
  setSelectedTheme: (theme: ThemeName) => void;
}> = ({ openAuthModal, selectedTheme, setSelectedTheme }) => {
  const { user, logout } = useAuth();

  return (
    <div className="user-menu flex items-center space-x-2 fit-content">
      <ThemeSwitcher
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
      />
      {!user ? (
        <div className="flex items-center gap-2">
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
