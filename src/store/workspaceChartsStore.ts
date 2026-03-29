import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  ChartData,
  ChartItemData,
  ChartSettingsUnion,
} from "@/components/chartTypes";
import type { AnyAnnotation } from "@/hooks/useAnnotation";
import { indexedDbStorage } from "./indexedDbStorage";

export type TimelineClip = {
  startMs: number;
  endMs: number;
};

export type ChartEntity = {
  id: number; // ChartItemData.id
  instanceId: string;
  type: string;
  initialPosition?: { x: number; y: number };

  chartData: ChartData | null;
  /** Single source of truth: line, bar, pie, or map settings (see ChartSettingsUnion). */
  chartSettings: ChartSettingsUnion | null;
  /** Timeline clip for this chart instance. Drives animationDuration for line/bar/pie. */
  timelineClip?: TimelineClip;
  /** When true the chart fades out after its animation completes during canvas playback. */
  hideAfterAnimation?: boolean;

  annotations: AnyAnnotation[];
};

type ChartsByWorkspaceId = Record<string, Record<string, ChartEntity>>;

type WorkspaceChartsState = {
  hasHydrated: boolean;
  chartsByWorkspaceId: ChartsByWorkspaceId;

  addChart: (
    workspaceId: string,
    type: string,
    initialPosition?: { x: number; y: number },
  ) => ChartItemData;
  removeChart: (workspaceId: string, chartId: number) => void;

  upsertChartData: (
    workspaceId: string,
    instanceId: string,
    data: ChartData,
  ) => void;
  upsertChartSettings: (
    workspaceId: string,
    instanceId: string,
    settings: ChartSettingsUnion,
  ) => void;
  upsertAnnotations: (
    workspaceId: string,
    instanceId: string,
    annotations: AnyAnnotation[],
  ) => void;
  upsertChartTimelineClip: (
    workspaceId: string,
    instanceId: string,
    clip: TimelineClip,
  ) => void;
  upsertChartHideAfterAnimation: (
    workspaceId: string,
    instanceId: string,
    hideAfterAnimation: boolean,
  ) => void;
};

const makeEmptyEntity = (
  chartId: number,
  instanceId: string,
  type: string,
  initialPosition?: { x: number; y: number },
): ChartEntity => ({
  id: chartId,
  instanceId,
  type,
  initialPosition,
  chartData: null,
  chartSettings: null,
  annotations: [],
});

export const useWorkspaceChartsStore = create<WorkspaceChartsState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      chartsByWorkspaceId: {},

      addChart: (workspaceId, type, initialPosition) => {
        const chartId = Date.now();
        const instanceId = `chart-${Date.now()}-${Math.random()}`;

        const entity = makeEmptyEntity(chartId, instanceId, type, initialPosition);

        set((state) => ({
          chartsByWorkspaceId: {
            ...state.chartsByWorkspaceId,
            [workspaceId]: {
              ...(state.chartsByWorkspaceId[workspaceId] ?? {}),
              [instanceId]: entity,
            },
          },
        }));

        return { id: chartId, instanceId, type, initialPosition };
      },

      removeChart: (workspaceId, chartId) => {
        set((state) => {
          const byWs = state.chartsByWorkspaceId[workspaceId];
          if (!byWs) return state;

          let removed = false;
          const next: Record<string, ChartEntity> = {};
          Object.entries(byWs).forEach(([instanceId, entity]) => {
            if (entity.id === chartId) {
              removed = true;
              return;
            }
            next[instanceId] = entity;
          });
          if (!removed) return state;

          return {
            chartsByWorkspaceId: {
              ...state.chartsByWorkspaceId,
              [workspaceId]: next,
            },
          };
        });
      },

      upsertChartData: (workspaceId, instanceId, data) => {
        set((state) => {
          const byWs = state.chartsByWorkspaceId[workspaceId] ?? {};
          const current = byWs[instanceId];
          if (!current) return state;

          return {
            chartsByWorkspaceId: {
              ...state.chartsByWorkspaceId,
              [workspaceId]: {
                ...byWs,
                [instanceId]: {
                  ...current,
                  chartData: data,
                },
              },
            },
          };
        });
      },

      upsertChartSettings: (workspaceId, instanceId, settings) => {
        set((state) => {
          const byWs = state.chartsByWorkspaceId[workspaceId] ?? {};
          const current = byWs[instanceId];
          if (!current) return state;
          return {
            chartsByWorkspaceId: {
              ...state.chartsByWorkspaceId,
              [workspaceId]: {
                ...byWs,
                [instanceId]: {
                  ...current,
                  chartSettings: settings,
                },
              },
            },
          };
        });
      },

      upsertChartTimelineClip: (workspaceId, instanceId, clip) => {
        set((state) => {
          const byWs = state.chartsByWorkspaceId[workspaceId] ?? {};
          const current = byWs[instanceId];
          if (!current) return state;
          return {
            chartsByWorkspaceId: {
              ...state.chartsByWorkspaceId,
              [workspaceId]: {
                ...byWs,
                [instanceId]: { ...current, timelineClip: clip },
              },
            },
          };
        });
      },

      upsertChartHideAfterAnimation: (workspaceId, instanceId, hideAfterAnimation) => {
        set((state) => {
          const byWs = state.chartsByWorkspaceId[workspaceId] ?? {};
          const current = byWs[instanceId];
          if (!current) return state;
          return {
            chartsByWorkspaceId: {
              ...state.chartsByWorkspaceId,
              [workspaceId]: {
                ...byWs,
                [instanceId]: { ...current, hideAfterAnimation },
              },
            },
          };
        });
      },

      upsertAnnotations: (workspaceId, instanceId, annotations) => {
        set((state) => {
          const byWs = state.chartsByWorkspaceId[workspaceId] ?? {};
          const current = byWs[instanceId];
          if (!current) return state;
          return {
            chartsByWorkspaceId: {
              ...state.chartsByWorkspaceId,
              [workspaceId]: {
                ...byWs,
                [instanceId]: {
                  ...current,
                  annotations,
                },
              },
            },
          };
        });
      },
    }),
    {
      name: "smartcharts-workspace-charts-v1",
      version: 1,
      storage: createJSONStorage(() => indexedDbStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    },
  ),
);

export type { ChartSettingsUnion } from "@/components/chartTypes";
