import * as echarts from "echarts";
import chalkProjectRaw from "./chalk.project.json?raw";
import darkProjectRaw from "./dark.project.json?raw";
import essosProjectRaw from "./essos.project.json?raw";
import vintageProjectRaw from "./vintage.project.json?raw";

type ThemeProject = {
  themeName: string;
  theme: Record<string, unknown>;
};

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

export function registerThemes() {
  THEME_PROJECTS.forEach(registerThemeProject);
}
