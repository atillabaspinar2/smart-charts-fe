// if user is logged in, show user menu with options like "My Charts", "Settings", "Logout"
// if user is not logged in, show login/signup options

import { useState } from "react";
import "./popover.css";
import { UserPopover } from "./userPopover";

type User = {
  name: string;
};

export const UserMenu: React.FC<{
  setSingUpModal: (value: boolean) => void;
}> = ({ setSingUpModal }) => {
  const [user, setUser] = useState<User | null>(null); // replace with actual user state management

  const login = () => {
    // replace with actual login logic
    setUser({ name: "John Doe" });
  };
  const logout = () => {
    // replace with actual logout logic
    setUser(null);
  };

  return (
    <div className="user-menu">
      {!user ? (
        <div>
          <button
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={login}
          >
            Login
          </button>
          <button
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded"
            onClick={() => setSingUpModal(true)}
          >
            Sign Up
          </button>
        </div>
      ) : (
        <UserPopover user={user} logout={logout} />
      )}
    </div>
  );
};
