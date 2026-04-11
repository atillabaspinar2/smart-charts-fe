// Map chart data type
export interface MapChartData {
  type: "map";
  mapName: string;
  mapDisplayName?: string; // Optional display name for UI
  series: {
    data: { name: string; value: number }[];
  };
}
export interface ChartItemData {
  id: number;
  instanceId: string;
  type: string;
  initialPosition?: {
    x: number;
    y: number;
  };
}

/** Google Fonts–loaded stacks; see `SKETCH_TYPOGRAPHY_PRESETS` in sketchChartTypography.ts */
export type SketchTypographyPresetId =
  | "caveat"
  | "kalam"
  | "patrick-hand"
  | "architects-daughter"
  | "indie-flower"
  | "comic-neue"
  | "permanent-marker";

// Base settings shared by all chart types
export interface ChartSettingsBase {
  animationDuration: number;
  backgroundColor: string;
  title: string;
  fontFamily: string;
  fontSize: number;
  /** Title text color (Common settings). */
  titleFontColor: string;
  showLegend: boolean;
  legendTop: "top" | "bottom";
  legendLeft: "left" | "right" | "center";
  legendOrient: "horizontal" | "vertical";
  /** Hand-drawn text when sketch mode is on (line/bar/pie/map sketch). */
  sketchTypographyPreset?: SketchTypographyPresetId;
}

export type LineSymbol =
  | "circle"
  | "rect"
  | "roundRect"
  | "triangle"
  | "diamond"
  | "pin"
  | "arrow"
  | "none";

// Line chart specific settings
export interface LineChartSettings extends ChartSettingsBase {
  lineShowLabels: boolean;
  /** Hand-drawn stroke via Rough.js (linear segments; use without area/stack for MVP). */
  lineSketchEnabled?: boolean;
  /**
   * Single UI control (0–100): drives roughness, bowing, and stroke width together
   * for a visible sketch effect. See `intensityToRoughSketchParams` in roughLineSeries.
   */
  lineSketchIntensity?: number;
  /** @deprecated Prefer `lineSketchIntensity`; kept for migrating old IndexedDB settings. */
  lineSketchRoughness?: number;
  lineSmooth: boolean;
  lineStep: boolean;
  lineArea: boolean;
  lineStack: boolean;
  lineSymbol: LineSymbol;
  lineSymbolSize: number;
}

// Map charts specific settings
export interface MapChartSettings extends ChartSettingsBase {
  mapName: string;
  regionColor?: string;
  animationDelayUpdateValue?: number;
  showLabel?: boolean;
  /** When true, show numeric value on regions (alone or next to the region name). */
  showMapValues?: boolean;
  labelFontColor?: string;
  labelFontSize?: number;
  visualMapColorRange?: string; // Optional custom color range for visualMap
  visualMapPosition?: {
    left: string;
    top: string;
  };
  /** Hand-drawn regions via Rough.js (geo + custom series). */
  mapSketchEnabled?: boolean;
  mapSketchIntensity?: number;
}

// Bar chart specific settings
export interface BarChartSettings extends ChartSettingsBase {
  barShowBackground: boolean;
  barBackgroundColor: string;
  barAxisOrientation: "vertical" | "horizontal";
  barStackEnabled: boolean;
  /** Hand-drawn bars via Rough.js (custom series). */
  barSketchEnabled?: boolean;
  /** 0–100 sketch strength (shared semantics with line sketch intensity). */
  barSketchIntensity?: number;
}

// Pie chart specific settings (extends base)
export interface PieChartSettings extends ChartSettingsBase {
  chartType: "pie" | "funnel";
  innerRadius: number;
  outerRadius: number;
  padAngle: number;
  borderWidth: number;
  roseType: "area" | false;
  showLabel: boolean;
  /** Hand-drawn pie slices via Rough.js (normal pie only; not rose/funnel). */
  pieSketchEnabled?: boolean;
  pieSketchIntensity?: number;
}

/** Persisted per-chart settings (discriminated by chart `type` + interface shape). */
export type ChartSettingsUnion =
  | LineChartSettings
  | BarChartSettings
  | PieChartSettings
  | MapChartSettings;

export type SeriesColorSource = "theme" | "custom";

export type LineChartVariation =
  | "basic"
  | "smooth"
  | "area"
  | "stacked-area"
  | "step";

export interface LineSeriesData {
  id: string;
  name: string;
  color: string;
  colorSource?: SeriesColorSource;
  themeColorIndex?: number | null;
  values: number[];
}

export interface LineChartData {
  type: "line";
  variation?: LineChartVariation;
  categories: string[];
  series: LineSeriesData[];
}

export interface BarSeriesData {
  id: string;
  name: string;
  color: string;
  colorSource?: SeriesColorSource;
  themeColorIndex?: number | null;
  values: number[];
}

export interface BarChartData {
  type: "bar";
  categories: string[];
  series: BarSeriesData[];
}

export interface PieDataPoint {
  id: string;
  name: string;
  value: number;
}

export interface PieChartData {
  type: "pie";
  seriesName?: string;
  data: PieDataPoint[];
}

export const defaultLineChartSettings: LineChartSettings = {
  animationDuration: 4000,
  backgroundColor: "#ffffff",
  title: "",
  fontFamily: "Inter, sans-serif",
  fontSize: 20,
  titleFontColor: "#333333",
  showLegend: true,
  legendTop: "bottom",
  legendLeft: "center",
  legendOrient: "horizontal",
  sketchTypographyPreset: "indie-flower",
  lineShowLabels: false,
  lineSketchEnabled: false,
  lineSketchIntensity: 50,
  lineSmooth: false,
  lineStep: false,
  lineArea: false,
  lineStack: false,
  lineSymbol: "circle",
  lineSymbolSize: 4,
};

export const defaultBarChartSettings: BarChartSettings = {
  animationDuration: 4000,
  backgroundColor: "#ffffff",
  title: "",
  fontFamily: "Inter, sans-serif",
  fontSize: 20,
  titleFontColor: "#333333",
  showLegend: true,
  legendTop: "bottom",
  legendLeft: "center",
  legendOrient: "horizontal",
  sketchTypographyPreset: "indie-flower",
  barShowBackground: false,
  barBackgroundColor: "#eee",
  barAxisOrientation: "vertical",
  barStackEnabled: false,
  barSketchEnabled: false,
  barSketchIntensity: 50,
};

export const defaultPieChartSettings: PieChartSettings = {
  animationDuration: 4000,
  backgroundColor: "#ffffff",
  title: "",
  fontFamily: "Inter, sans-serif",
  fontSize: 20,
  titleFontColor: "#333333",
  showLegend: true,
  legendTop: "bottom",
  legendLeft: "center",
  legendOrient: "horizontal",
  sketchTypographyPreset: "indie-flower",
  chartType: "pie",
  innerRadius: 40,
  outerRadius: 70,
  padAngle: 10,
  borderWidth: 0,
  roseType: "area",
  showLabel: false,
  pieSketchEnabled: false,
  pieSketchIntensity: 50,
};

export const defaultMapChartSettings: MapChartSettings = {
  mapName: "countries",
  regionColor: "#c23531",
  animationDelayUpdateValue: 20,
  showLabel: false,
  showMapValues: false,
  labelFontColor: "#000",
  labelFontSize: 10,
  animationDuration: 0,
  backgroundColor: "#ffffff",
  title: "",
  fontFamily: "",
  fontSize: 0,
  titleFontColor: "#333333",
  sketchTypographyPreset: "indie-flower",
  showLegend: false,
  legendTop: "bottom",
  legendLeft: "left",
  legendOrient: "vertical",
  mapSketchEnabled: false,
  mapSketchIntensity: 50,
};

export type ChartData =
  | LineChartData
  | BarChartData
  | PieChartData
  | MapChartData;

export interface ReanimateSignal {
  instanceId: string;
  key: number;
}
