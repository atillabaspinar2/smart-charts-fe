import { PaintBoardIcon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme, type ThemeName } from "./theme-provider";

const themes: Array<{ id: ThemeName; label: string }> = [
  { id: "theme-amber", label: "Amber" },
  { id: "theme-blue", label: "Blue" },
  { id: "theme-cyan", label: "Cyan" },
  { id: "theme-green", label: "Green" },
  { id: "theme-lime", label: "Lime" },
  { id: "theme-orange", label: "Orange" },
  { id: "theme-red", label: "Red" },
  { id: "theme-rose", label: "Rose" },
  { id: "theme-pink", label: "Pink" },
  { id: "theme-violet", label: "Violet" },
];

export const ThemeSwitcher: React.FC = () => {
  const {
    theme: selectedTheme,
    setTheme: setSelectedTheme,
    mode,
    setMode,
  } = useTheme();

  const toggleMode = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={toggleMode}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent p-0 text-zinc-100 transition-colors hover:text-zinc-300"
        aria-label="Toggle dark and light mode"
        title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
      >
        <HugeiconsIcon icon={Sun03Icon} size={20} />
      </button>
      <button
        type="button"
        id="theme-popover-btn"
        popoverTarget="theme-popover-content"
        className="popover-btn inline-flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent p-0 text-zinc-100 transition-colors hover:text-zinc-300"
        aria-label="Open theme switcher"
        title="Switch theme"
      >
        <HugeiconsIcon icon={PaintBoardIcon} size={24} />
      </button>
      <div
        id="theme-popover-content"
        popover="auto"
        className="popover-content min-w-52 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-xl"
      >
        <ul className="space-y-2">
          {themes.map((theme) => (
            <li key={theme.id}>
              <button
                className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors ${
                  selectedTheme === theme.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => setSelectedTheme(theme.id)}
                popoverTarget="theme-popover-content"
                popoverTargetAction="hide"
              >
                {theme.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
