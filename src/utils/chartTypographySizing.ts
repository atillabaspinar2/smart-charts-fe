/**
 * Common chart text sizing: the workspace "Font size" control applies to the
 * chart title only (default {@link CHART_TITLE_DEFAULT_FONT_SIZE}).
 * Non-title body text: {@link CHART_BODY_DEFAULT_FONT_SIZE} in default mode,
 * {@link CHART_BODY_SKETCH_FONT_SIZE} when sketch mode is on.
 */
export const CHART_BODY_DEFAULT_FONT_SIZE = 12;

/** Body text (axes, legend, tooltips, etc.) in sketch mode — slightly larger than default mode. */
export const CHART_BODY_SKETCH_FONT_SIZE = 14;

/** Default for Common settings → title font size (px) when unset or invalid. */
export const CHART_TITLE_DEFAULT_FONT_SIZE = 20;

/** Title uses the per-chart font size setting; invalid/zero falls back to {@link CHART_TITLE_DEFAULT_FONT_SIZE}. */
export function resolveTitleFontSize(fontSize: number | undefined): number {
  if (typeof fontSize === "number" && Number.isFinite(fontSize) && fontSize > 0) {
    return fontSize;
  }
  return CHART_TITLE_DEFAULT_FONT_SIZE;
}

function mergeTextStyle(
  t: unknown,
  fontFamily: string,
  fontSize: number,
): Record<string, unknown> {
  const o =
    typeof t === "object" && t !== null
      ? (t as Record<string, unknown>)
      : {};
  return { ...o, fontFamily, fontSize };
}

function mergeSingleAxis(
  axis: unknown,
  fontFamily: string,
  bodyFontSize: number,
) {
  if (!axis || typeof axis !== "object") return axis;
  const a = axis as Record<string, unknown>;
  return {
    ...a,
    axisLabel: mergeTextStyle(a.axisLabel, fontFamily, bodyFontSize),
    nameTextStyle: mergeTextStyle(a.nameTextStyle, fontFamily, bodyFontSize),
  };
}

function mergeAxis(
  axis: unknown,
  fontFamily: string,
  bodyFontSize: number,
) {
  if (Array.isArray(axis)) {
    return axis.map((a) => mergeSingleAxis(a, fontFamily, bodyFontSize));
  }
  return mergeSingleAxis(axis, fontFamily, bodyFontSize);
}

function mergeLegend(
  legend: Record<string, unknown>,
  fontFamily: string,
  bodyFontSize: number,
) {
  return {
    ...legend,
    textStyle: mergeTextStyle(legend.textStyle, fontFamily, bodyFontSize),
  };
}

function mergeTooltip(
  tooltip: unknown,
  fontFamily: string,
  bodyFontSize: number,
) {
  if (!tooltip || typeof tooltip !== "object") {
    return { textStyle: mergeTextStyle(undefined, fontFamily, bodyFontSize) };
  }
  const t = tooltip as Record<string, unknown>;
  return {
    ...t,
    textStyle: mergeTextStyle(t.textStyle, fontFamily, bodyFontSize),
  };
}

/**
 * Non-sketch charts: set body font size + family on legend, axes, tooltip, and root textStyle.
 * Does not modify `title` (title size comes from common settings separately).
 */
export function applyBodyFontSizeToEChartsOption(
  option: Record<string, unknown>,
  bodyFontSize: number,
  fontFamily: string,
): Record<string, unknown> {
  const mergeRootText = (existing: unknown) => {
    const o =
      typeof existing === "object" && existing !== null
        ? (existing as Record<string, unknown>)
        : {};
    return { ...o, fontFamily, fontSize: bodyFontSize };
  };

  const next: Record<string, unknown> = {
    ...option,
    textStyle: mergeRootText(option.textStyle),
    tooltip: mergeTooltip(option.tooltip, fontFamily, bodyFontSize),
    xAxis: mergeAxis(option.xAxis, fontFamily, bodyFontSize),
    yAxis: mergeAxis(option.yAxis, fontFamily, bodyFontSize),
  };
  // Do not add `legend` when absent — maps and other charts without legend would
  // otherwise get a synthetic `{ textStyle }` and ECharts would show a legend.
  if (option.legend != null && typeof option.legend === "object") {
    next.legend = mergeLegend(
      option.legend as Record<string, unknown>,
      fontFamily,
      bodyFontSize,
    );
  }
  return next;
}
