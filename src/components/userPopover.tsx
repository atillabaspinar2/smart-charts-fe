export const UserPopover: React.FC<{
  user: { fullName: string; email: string };
  signOut: () => void;
}> = ({ user, signOut }) => {
  return (
    <div>
      <button
        id="popover-btn"
        popoverTarget="popover-content"
        className="popover-btn rounded px-4 text-xs text-zinc-100 hover:text-zinc-300"
      >
        <span className="block">Signed in as</span>
        <span className="block">{user.fullName}</span>
      </button>
      <div
        id="popover-content"
        popover="auto"
        className="popover-content min-w-52 rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-zinc-100 shadow-xl backdrop:bg-black/20"
      >
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-left text-sm text-zinc-100 transition-colors hover:bg-zinc-700"
            >
              My Charts
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-left text-sm text-zinc-100 transition-colors hover:bg-zinc-700"
            >
              Settings
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-left text-sm text-zinc-100 transition-colors hover:bg-zinc-700"
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
