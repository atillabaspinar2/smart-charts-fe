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

export type ChartData = LineChartData | BarChartData;

export interface ReanimateSignal {
  instanceId: string;
  key: number;
}
