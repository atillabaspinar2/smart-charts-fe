export interface ChartItemData {
  id: number;
  instanceId: string;
  type: string;
}

export interface ChartSettingsData {
  animationDuration: number;
  backgroundColor: string;
  title: string;
}

export interface LineSeriesData {
  id: string;
  name: string;
  color: string;
  values: number[];
  areaStyle: boolean;
}

export interface LineChartData {
  type: "line";
  categories: string[];
  series: LineSeriesData[];
}

export interface BarSeriesData {
  id: string;
  name: string;
  color: string;
  values: number[];
}

export interface BarChartData {
  type: "bar";
  categories: string[];
  series: BarSeriesData[];
}

export type ChartData = LineChartData | BarChartData;

export interface ReanimateSignal {
  instanceId: string;
  key: number;
}
