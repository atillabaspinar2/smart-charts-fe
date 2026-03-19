export interface ChartItemData {
  id: number;
  instanceId: string;
  type: string;
  initialPosition?: {
    x: number;
    y: number;
  };
}

export interface ChartSettingsData {
  animationDuration: number;
  backgroundColor: string;
  title: string;
  fontFamily: string;
  fontSize: number;
  showLegend: boolean;
  legendTop: "top" | "bottom";
  legendLeft: "left" | "right" | "center";
  legendOrient: "horizontal" | "vertical";
  barShowBackground: boolean;
  barBackgroundColor: string;
  barAxisOrientation: "vertical" | "horizontal";
  barStackEnabled: boolean;
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
  smooth: boolean;
  step: boolean;
  areaStyle: Record<string, never> | null;
}

export interface LineChartData {
  type: "line";
  variation?: LineChartVariation;
  showEndValueLabels?: boolean;
  categories: string[];
  series: LineSeriesData[];
}

export type BarChartVariation =
  | "grouped"
  | "stacked"
  | "stacked-100"
  | "horizontal";

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
  variation?: BarChartVariation;
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

export interface PieChartSettings {
  chartType: "pie" | "funnel";
  innerRadius: number;
  outerRadius: number;
  padAngle: number;
  borderWidth: number;
  roseType: "area" | false;
  showLabel: boolean;
}

export const defaultPieChartSettings: PieChartSettings = {
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
