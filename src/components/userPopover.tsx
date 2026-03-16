export const UserPopover: React.FC<{
  user: { fullName: string; email: string };
  signOut: () => void;
}> = ({ user, signOut }) => {
  return (
    <div>
      <button
        id="popover-btn"
        popoverTarget="popover-content"
        className="popover-btn px-4   text-theme-bg rounded text-xs hover:text-theme-primary"
      >
        <span className="block">Signed in as</span>
        <span className="block">{user.fullName}</span>
      </button>
      <div
        id="popover-content"
        popover="auto"
        className="popover-content min-w-52 rounded-lg border border-theme-primary bg-theme-bg p-4 text-theme-text shadow-xl backdrop:bg-black/20"
      >
        <div className="mb-4">
          <h3 className="font-bold">User Menu</h3>
        </div>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              className="w-full rounded border border-theme-primary bg-theme-surface px-3 py-2 text-left text-sm text-theme-text transition-colors hover:bg-theme-primary"
            >
              My Charts
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full rounded border border-theme-primary bg-theme-surface px-3 py-2 text-left text-sm text-theme-text transition-colors hover:bg-theme-primary"
            >
              Settings
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full rounded border border-theme-primary bg-theme-surface px-3 py-2 text-left text-sm text-theme-text transition-colors hover:bg-theme-primary"
              popoverTarget="popover-content"
              popoverTargetAction="hide"
              onClick={() => {
                signOut();
              }}
            >
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};
