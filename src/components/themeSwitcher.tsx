import { Moon02Icon, PaintBoardIcon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme, type ThemeName } from "./theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    // System mode removed from UI; keep it strictly light/dark.
    setMode(mode === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="lg"
        onClick={toggleMode}
        aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
      >
        <HugeiconsIcon icon={mode === "dark" ? Moon02Icon : Sun03Icon} size={24} />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="lg"
            aria-label="Open theme switcher"
            title="Switch theme"
          >
            <HugeiconsIcon icon={PaintBoardIcon} size={24} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {themes.map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              onSelect={() => setSelectedTheme(theme.id)}
              className={
                selectedTheme === theme.id
                  ? "bg-accent text-accent-foreground"
                  : undefined
              }
            >
              {theme.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
