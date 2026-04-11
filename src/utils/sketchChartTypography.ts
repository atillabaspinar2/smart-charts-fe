import type { SketchTypographyPresetId } from "@/components/chartTypes";
import {
  CHART_BODY_SKETCH_FONT_SIZE,
  resolveTitleFontSize,
} from "@/utils/chartTypographySizing";

/** Curated hand-drawn / informal faces for sketch charts (Google Fonts in index.html). */
export const SKETCH_TYPOGRAPHY_PRESETS: Record<
  SketchTypographyPresetId,
  { label: string; fontFamily: string }
> = {
  caveat: {
    label: "Caveat",
    fontFamily: '"Caveat", "Segoe Print", cursive',
  },
  kalam: {
    label: "Kalam",
    fontFamily: '"Kalam", "Comic Sans MS", sans-serif',
  },
  "patrick-hand": {
    label: "Patrick Hand",
    fontFamily: '"Patrick Hand", "Comic Sans MS", cursive',
  },
  "architects-daughter": {
    label: "Architects Daughter",
    fontFamily: '"Architects Daughter", "Comic Sans MS", cursive',
  },
  "indie-flower": {
    label: "Indie Flower",
    fontFamily: '"Indie Flower", "Comic Sans MS", cursive',
  },
  "comic-neue": {
    label: "Comic Neue",
    fontFamily: '"Comic Neue", "Comic Sans MS", sans-serif',
  },
  "permanent-marker": {
    label: "Permanent Marker",
    fontFamily: '"Permanent Marker", "Impact", fantasy',
  },
};

export const SKETCH_TYPOGRAPHY_PRESET_OPTIONS: {
  value: SketchTypographyPresetId;
  label: string;
}[] = (
  Object.entries(SKETCH_TYPOGRAPHY_PRESETS) as [
    SketchTypographyPresetId,
    { label: string },
  ][]
).map(([value, { label }]) => ({ value, label }));

const DEFAULT_PRESET: SketchTypographyPresetId = "indie-flower";

export function resolveSketchTypographyFontFamily(
  preset: SketchTypographyPresetId | undefined,
): string {
  const id = preset && preset in SKETCH_TYPOGRAPHY_PRESETS ? preset : DEFAULT_PRESET;
  return SKETCH_TYPOGRAPHY_PRESETS[id].fontFamily;
}

/**
 * Merge sketch typography into every ECharts text surface we care about.
 * `userFont` (from common settings) is listed after the sketch face as fallback.
 * Title uses `titleFontSize` from common settings; all other text uses {@link CHART_BODY_SKETCH_FONT_SIZE}.
 */
export function applySketchTypographyToEChartsOption(
  option: Record<string, unknown>,
  userFont: string | undefined,
  preset: SketchTypographyPresetId | undefined,
  titleFontSize: number | undefined,
): Record<string, unknown> {
  const sketchStack = resolveSketchTypographyFontFamily(preset);
  const font = [sketchStack, userFont?.trim()].filter(Boolean).join(", ");
  const titleResolved = resolveTitleFontSize(titleFontSize);
  const bodySketchSize = CHART_BODY_SKETCH_FONT_SIZE;

  const mergeRootText = (existing: unknown) => {
    const o =
      typeof existing === "object" && existing !== null
        ? (existing as Record<string, unknown>)
        : {};
    return { ...o, fontFamily: font, fontSize: bodySketchSize };
  };

  const mergeAxis = (axis: unknown) => {
    if (Array.isArray(axis)) {
      return axis.map((a) => mergeSingleAxis(a, font, bodySketchSize));
    }
    return mergeSingleAxis(axis, font, bodySketchSize);
  };

  const next: Record<string, unknown> = {
    ...option,
    textStyle: mergeRootText(option.textStyle),
    title: mergeTitle(option.title, font, titleResolved),
    tooltip: mergeTooltip(option.tooltip, font, bodySketchSize),
    xAxis: mergeAxis(option.xAxis),
    yAxis: mergeAxis(option.yAxis),
  };
  if (option.legend != null && typeof option.legend === "object") {
    next.legend = mergeLegend(
      option.legend as Record<string, unknown>,
      font,
      bodySketchSize,
    );
  }
  return next;
}

function mergeTitle(
  title: unknown,
  font: string,
  titleFontSize: number,
) {
  if (Array.isArray(title)) {
    return title.map((item) => mergeTitleItem(item, font, titleFontSize));
  }
  return mergeTitleItem(title, font, titleFontSize);
}

function mergeTitleItem(
  title: unknown,
  font: string,
  titleFontSize: number,
) {
  if (!title || typeof title !== "object") {
    return { textStyle: mergeTextStyle(undefined, font, titleFontSize) };
  }
  const t = title as Record<string, unknown>;
  return {
    ...t,
    textStyle: mergeTextStyle(t.textStyle, font, titleFontSize),
  };
}

function mergeTextStyle(
  t: unknown,
  font: string,
  fontSize?: number,
): Record<string, unknown> {
  const o =
    typeof t === "object" && t !== null
      ? (t as Record<string, unknown>)
      : {};
  return {
    ...o,
    fontFamily: font,
    ...(fontSize !== undefined ? { fontSize } : {}),
  };
}

function mergeLegend(
  legend: Record<string, unknown>,
  font: string,
  fontSize?: number,
) {
  return {
    ...legend,
    textStyle: mergeTextStyle(legend.textStyle, font, fontSize),
  };
}

function mergeTooltip(tooltip: unknown, font: string, fontSize?: number) {
  if (!tooltip || typeof tooltip !== "object") {
    return { textStyle: mergeTextStyle(undefined, font, fontSize) };
  }
  const t = tooltip as Record<string, unknown>;
  return {
    ...t,
    textStyle: mergeTextStyle(t.textStyle, font, fontSize),
  };
}

function mergeSingleAxis(
  axis: unknown,
  font: string,
  axisLabelFontSize?: number,
) {
  if (!axis || typeof axis !== "object") return axis;
  const a = axis as Record<string, unknown>;
  return {
    ...a,
    axisLabel: mergeTextStyle(a.axisLabel, font, axisLabelFontSize),
    nameTextStyle: mergeTextStyle(a.nameTextStyle, font, axisLabelFontSize),
  };
}
