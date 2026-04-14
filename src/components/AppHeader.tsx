import { Link } from "react-router-dom";
import logo from "@/assets/logo.svg";
import { UserMenu } from "@/components/userMenu";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  isCoarsePointer: boolean;
  headerMenuOpen: boolean;
  setHeaderMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openAuthModal: (mode: "signup" | "signin") => void;
  onOpenAssistantSettings?: () => void;
  /** Extra content on the right before the user menu (e.g. intro CTA). */
  endAdornment?: React.ReactNode;
  /** e.g. `col-span-2` when the header spans the workspace grid above sidebar + main. */
  className?: string;
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  isCoarsePointer,
  headerMenuOpen,
  setHeaderMenuOpen,
  openAuthModal,
  onOpenAssistantSettings,
  endAdornment,
  className,
}) => {
  return (
    <header
      className={cn("w-full shadow-lg bg-zinc-950 text-zinc-100", className)}
    >
      <div className="px-4 py-1 flex items-center justify-between relative gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3 min-w-0">
          <Link to="/" className="shrink-0 flex items-center">
            <img src={logo} alt="" className="h-13.5 w-13.5 cursor-pointer" />
          </Link>
          <Link
            to="/"
            className="truncate hover:text-white/90 transition-colors"
          >
            Chart Studio
          </Link>
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          {endAdornment}
          {isCoarsePointer ? (
            <div className="relative">
              <button
                type="button"
                aria-label={headerMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setHeaderMenuOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-xl font-medium text-zinc-100 ring-1 ring-inset ring-zinc-700 shadow-sm transition hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
              >
                {headerMenuOpen ? "✕" : "☰"}
              </button>
              {headerMenuOpen && (
                <div className="absolute right-0 top-full z-[10002] mt-2 min-w-52 rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-700 shadow-lg backdrop-blur">
                  <UserMenu
                    openAuthModal={(mode) => {
                      openAuthModal(mode);
                      setHeaderMenuOpen(false);
                    }}
                    onOpenAssistantSettings={() => {
                      onOpenAssistantSettings?.();
                      setHeaderMenuOpen(false);
                    }}
                    stacked
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="right-6 top-4">
              <UserMenu
                openAuthModal={openAuthModal}
                onOpenAssistantSettings={onOpenAssistantSettings}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
