import { ThemedActionButton } from "./themedActionButton";

type ThemeName =
  | "blue-slate"
  | "earth-clay"
  | "rose-wine"
  | "royal-cobalt"
  | "neutral-graphite";

const themes: Array<{ id: ThemeName; label: string }> = [
  { id: "blue-slate", label: "Blue Slate" },
  { id: "earth-clay", label: "Earth Clay" },
  { id: "rose-wine", label: "Rose Wine" },
  { id: "royal-cobalt", label: "Royal Cobalt" },
  { id: "neutral-graphite", label: "Neutral Graphite" },
];

export const ThemeSwitcher: React.FC<{
  selectedTheme: ThemeName;
  setSelectedTheme: (theme: ThemeName) => void;
}> = ({ selectedTheme, setSelectedTheme }) => {
  return (
    <div className="inline-block mr-2">
      <ThemedActionButton
        id="theme-popover-btn"
        popoverTarget="theme-popover-content"
        className="popover-btn"
        aria-label="Open theme switcher"
        title="Switch theme"
      >
        Theme
      </ThemedActionButton>
      <div
        id="theme-popover-content"
        popover="auto"
        className="popover-content p-4 rounded-lg shadow-xl border border-gray-200 bg-white text-slate-900 min-w-52"
      >
        <h3 className="font-bold mb-3">Choose Theme</h3>
        <ul className="space-y-2">
          {themes.map((theme) => (
            <li key={theme.id}>
              <button
                className={`w-full text-left px-3 py-2 rounded transition ${
                  selectedTheme === theme.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200"
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
