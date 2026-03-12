// if user is logged in, show user menu with options like "My Charts", "Settings", "Logout"
// if user is not logged in, show login/signup options

import { useState } from "react";
import "./popover.css";
import { UserPopover } from "./userPopover";
import {
  ThemeSwitcher,
  firstColorByTheme,
  type ThemeName,
} from "./themeSwitcher";
import { ThemedActionButton } from "./themedActionButton";

type User = {
  name: string;
};

export const UserMenu: React.FC<{
  setSingUpModal: (value: boolean) => void;
  selectedTheme: ThemeName;
  setSelectedTheme: (theme: ThemeName) => void;
}> = ({ setSingUpModal, selectedTheme, setSelectedTheme }) => {
  const [user, setUser] = useState<User | null>(null); // replace with actual user state management
  const actionColor = firstColorByTheme[selectedTheme];

  const login = () => {
    // replace with actual login logic
    setUser({ name: "John Doe" });
  };
  const logout = () => {
    // replace with actual logout logic
    setUser(null);
  };

  return (
    <div className="user-menu flex items-center space-x-2">
      <ThemeSwitcher
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
      />
      {!user ? (
        <div className="flex items-center gap-2">
          <ThemedActionButton color={actionColor} onClick={login}>
            Login
          </ThemedActionButton>
          <ThemedActionButton
            color={actionColor}
            onClick={() => setSingUpModal(true)}
          >
            Sign Up
          </ThemedActionButton>
        </div>
      ) : (
        <UserPopover user={user} logout={logout} />
      )}
    </div>
  );
};
