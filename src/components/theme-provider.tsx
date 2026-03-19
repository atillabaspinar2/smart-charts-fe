/* eslint-disable react-refresh/only-export-components */
import * as React from "react";

export type ThemeName =
  | "theme-amber"
  | "theme-blue"
  | "theme-cyan"
  | "theme-green"
  | "theme-lime"
  | "theme-orange"
  | "theme-red"
  | "theme-rose"
  | "theme-pink"
  | "theme-violet";

export type Mode = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  storageKey?: string;
  defaultMode?: Mode;
  modeStorageKey?: string;
};

type ThemeProviderState = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
};

const THEME_VALUES: ThemeName[] = [
  "theme-amber",
  "theme-blue",
  "theme-cyan",
  "theme-green",
  "theme-lime",
  "theme-orange",
  "theme-red",
  "theme-rose",
  "theme-pink",
  "theme-violet",
];

const MODE_VALUES: Mode[] = ["light", "dark", "system"];

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined);

function isTheme(value: string | null): value is ThemeName {
  if (value === null) {
    return false;
  }

  return THEME_VALUES.includes(value as ThemeName);
}

function isMode(value: string | null): value is Mode {
  if (value === null) {
    return false;
  }

  return MODE_VALUES.includes(value as Mode);
}

function getSystemMode(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeClass(nextTheme: ThemeName) {
  const root = document.documentElement;
  root.classList.forEach((cls) => {
    if (cls.startsWith("theme-")) {
      root.classList.remove(cls);
    }
  });
  root.classList.add(nextTheme);
}

function applyModeClass(nextMode: Mode) {
  const root = document.documentElement;
  const resolvedMode = nextMode === "system" ? getSystemMode() : nextMode;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedMode);
}

export function ThemeProvider({
  children,
  defaultTheme = "theme-green",
  storageKey = "ui-theme",
  defaultMode = "light",
  modeStorageKey = "ui-mode",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeName>(() => {
    const storedTheme = localStorage.getItem(storageKey);
    if (isTheme(storedTheme)) {
      return storedTheme;
    }
    return defaultTheme;
  });

  const [mode, setModeState] = React.useState<Mode>(() => {
    const storedMode = localStorage.getItem(modeStorageKey);
    if (isMode(storedMode)) {
      return storedMode;
    }
    return defaultMode;
  });

  const setTheme = React.useCallback(
    (nextTheme: ThemeName) => {
      localStorage.setItem(storageKey, nextTheme);
      setThemeState(nextTheme);
    },
    [storageKey],
  );

  const setMode = React.useCallback(
    (nextMode: Mode) => {
      localStorage.setItem(modeStorageKey, nextMode);
      setModeState(nextMode);
    },
    [modeStorageKey],
  );

  React.useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  React.useEffect(() => {
    applyModeClass(mode);

    if (mode !== "system") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyModeClass("system");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode]);

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return;
      }

      if (event.key !== storageKey) {
        if (event.key !== modeStorageKey) {
          return;
        }

        if (isMode(event.newValue)) {
          setModeState(event.newValue);
          return;
        }

        setModeState(defaultMode);
        return;
      }

      if (isTheme(event.newValue)) {
        setThemeState(event.newValue);
        return;
      }

      setThemeState(defaultTheme);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [defaultTheme, storageKey, defaultMode, modeStorageKey]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      mode,
      setMode,
    }),
    [theme, setTheme, mode, setMode],
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
