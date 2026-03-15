import * as echarts from "echarts";
import chalkProjectRaw from "./chalk.project.json?raw";
import darkProjectRaw from "./dark.project.json?raw";
import essosProjectRaw from "./essos.project.json?raw";
import vintageProjectRaw from "./vintage.project.json?raw";

type ThemeProject = {
  themeName: string;
  theme: Record<string, unknown>;
};

export const DEFAULT_THEME_COLORS = [
  "#2563eb",
  "#dc2626",
  "#059669",
  "#d97706",
  "#7c3aed",
];

const THEME_PROJECTS_RAW = [
  chalkProjectRaw,
  darkProjectRaw,
  essosProjectRaw,
  vintageProjectRaw,
];

const parseThemeProject = (raw: string): ThemeProject | null => {
  try {
    const parsed = JSON.parse(raw) as Partial<ThemeProject>;
    if (!parsed.themeName || !parsed.theme) return null;
    return {
      themeName: parsed.themeName,
      theme: parsed.theme,
    };
  } catch {
    return null;
  }
};

const THEME_PROJECTS = THEME_PROJECTS_RAW.map(parseThemeProject).filter(
  (project): project is ThemeProject => Boolean(project),
);

const toLabel = (themeName: string) =>
  themeName.charAt(0).toUpperCase() + themeName.slice(1);

export const ECHARTS_THEMES: { value: string; label: string }[] = [
  { value: "", label: "Default" },
  ...THEME_PROJECTS.map((project) => ({
    value: project.themeName,
    label: toLabel(project.themeName),
  })),
];

const sanitizeTheme = (theme: Record<string, unknown>) => {
  const cleaned = { ...theme };
  const existingTextStyle =
    typeof cleaned.textStyle === "object" && cleaned.textStyle !== null
      ? (cleaned.textStyle as Record<string, unknown>)
      : {};
  cleaned.textStyle = {
    ...existingTextStyle,
    fontFamily: "Noto Sans, sans-serif",
  };
  delete cleaned.seriesCnt;
  delete cleaned.textColorShow;
  return cleaned;
};

function registerThemeProject(project: ThemeProject) {
  echarts.registerTheme(project.themeName, sanitizeTheme(project.theme));
}

export function getThemePalette(themeName: string): string[] {
  if (!themeName) return DEFAULT_THEME_COLORS;
  const project = THEME_PROJECTS.find((item) => item.themeName === themeName);
  if (!project) return DEFAULT_THEME_COLORS;

  const rawColors = (project.theme as { color?: unknown }).color;
  if (!Array.isArray(rawColors)) return DEFAULT_THEME_COLORS;

  const colors = rawColors.filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  return colors.length ? colors : DEFAULT_THEME_COLORS;
}

export function getThemeBackground(themeName: string): string | null {
  if (!themeName) return null;
  const project = THEME_PROJECTS.find((item) => item.themeName === themeName);
  if (!project) return null;
  const bg = (project.theme as { backgroundColor?: unknown }).backgroundColor;
  return typeof bg === "string" && bg.length > 0 ? bg : null;
}

export function registerThemes() {
  THEME_PROJECTS.forEach(registerThemeProject);
}
