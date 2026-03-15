import { PaintBoardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type ThemeName =
  | "blue-slate"
  | "earth-clay"
  | "rose-wine"
  | "neutral-graphite"
  | "ember-forest";

const themes: Array<{ id: ThemeName; label: string }> = [
  { id: "rose-wine", label: "Rose Wine" },
  { id: "earth-clay", label: "Earth Clay" },
  { id: "neutral-graphite", label: "Neutral Graphite" },
  { id: "ember-forest", label: "Ember Forest" },
  { id: "blue-slate", label: "Blue Slate" },
];

export const ThemeSwitcher: React.FC<{
  selectedTheme: ThemeName;
  setSelectedTheme: (theme: ThemeName) => void;
}> = ({ selectedTheme, setSelectedTheme }) => {
  return (
    <div className="flex items-center">
      <button
        type="button"
        id="theme-popover-btn"
        popoverTarget="theme-popover-content"
        className="popover-btn inline-flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent p-0 text-theme-bg transition-colors hover:text-theme-primary"
        aria-label="Open theme switcher"
        title="Switch theme"
      >
        <HugeiconsIcon icon={PaintBoardIcon} size={24} />
      </button>
      <div
        id="theme-popover-content"
        popover="auto"
        className="popover-content min-w-52 rounded-lg border border-theme-primary bg-theme-bg p-4 text-theme-text shadow-xl"
      >
        <ul className="space-y-2">
          {themes.map((theme) => (
            <li key={theme.id}>
              <button
                className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors ${
                  selectedTheme === theme.id
                    ? "border-theme-accent bg-theme-accent text-theme-bg"
                    : "border-theme-primary bg-theme-surface text-theme-text hover:bg-theme-primary"
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

export type { ThemeName };
