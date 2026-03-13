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

export interface ReanimateSignal {
  instanceId: string;
  key: number;
}
