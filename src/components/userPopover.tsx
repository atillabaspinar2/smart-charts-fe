export const UserPopover: React.FC<{
  user: { name: string };
  logout: () => void;
}> = ({ user, logout }) => {
  return (
    <div>
      <button
        id="popover-btn"
        popoverTarget="popover-content"
        className="popover-btn px-4 py-2   text-theme-bg rounded text-xs hover:text-theme-primary"
      >
        <span className="block">Welcome</span>
        <span className="block">{user.name}</span>
      </button>
      <div
        id="popover-content"
        popover="auto"
        className="popover-content p-6 rounded-lg shadow-xl border border-theme-primary backdrop:bg-black/20"
      >
        <div className="mb-4">
          <h3 className="font-bold">User Menu</h3>
        </div>
        <ul className="mb-4">
          <li className="mb-2">
            <a href="#" className="text-blue-500 hover:underline">
              My Charts
            </a>
          </li>
          <li className="mb-2">
            <a href="#" className="text-blue-500 hover:underline">
              Settings
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-red-500 hover:underline"
              popoverTarget="popover-content"
              popoverTargetAction="hide"
              onClick={() => {
                logout();
              }}
            >
              Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
