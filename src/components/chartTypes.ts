export interface ChartItemData {
  id: number;
  instanceId: string;
  type: string;
  initialPosition?: {
    x: number;
    y: number;
  };
}

// Base settings shared by all chart types
export interface ChartSettingsBase {
  animationDuration: number;
  backgroundColor: string;
  title: string;
  fontFamily: string;
  fontSize: number;
  showLegend: boolean;
  legendTop: "top" | "bottom";
  legendLeft: "left" | "right" | "center";
  legendOrient: "horizontal" | "vertical";
}

// Line chart specific settings
export interface LineChartSettings extends ChartSettingsBase {
  lineShowLabels: boolean;
  lineSmooth: boolean;
  lineStep: boolean;
  lineArea: boolean;
}

// Bar chart specific settings
export interface BarChartSettings extends ChartSettingsBase {
  barShowBackground: boolean;
  barBackgroundColor: string;
  barAxisOrientation: "vertical" | "horizontal";
  barStackEnabled: boolean;
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
}

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
  animationDuration: 1000,
  backgroundColor: "#ffffff",
  title: "",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  showLegend: true,
  legendTop: "top",
  legendLeft: "center",
  legendOrient: "horizontal",
  lineShowLabels: false,
  lineSmooth: false,
  lineStep: false,
  lineArea: false,
};

export const defaultBarChartSettings: BarChartSettings = {
  animationDuration: 1000,
  backgroundColor: "#ffffff",
  title: "",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  showLegend: true,
  legendTop: "top",
  legendLeft: "center",
  legendOrient: "horizontal",
  barShowBackground: false,
  barBackgroundColor: "#eee",
  barAxisOrientation: "vertical",
  barStackEnabled: false,
};

export const defaultPieChartSettings: PieChartSettings = {
  animationDuration: 1000,
  backgroundColor: "#ffffff",
  title: "",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  showLegend: true,
  legendTop: "top",
  legendLeft: "center",
  legendOrient: "horizontal",
  chartType: "pie",
  innerRadius: 40,
  outerRadius: 70,
  padAngle: 10,
  borderWidth: 0,
  roseType: "area",
  showLabel: false,
};

export type ChartData = LineChartData | BarChartData | PieChartData;

export interface ReanimateSignal {
  instanceId: string;
  key: number;
}
