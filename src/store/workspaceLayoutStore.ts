import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ChartItemData } from "@/components/chartTypes";
import { indexedDbStorage } from "./indexedDbStorage";

const defaultChartSize = { width: 400, height: 300 };

type WorkspaceLayout = {
  chartPositionMap: Record<string, { x: number; y: number }>;
  chartSizeMap: Record<string, { width: number; height: number }>;
  chartStackOrder: string[];
  selectedChartInstanceId: string | null;
};

type WorkspaceMeta = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type LayoutState = {
  workspaces: WorkspaceMeta[];
  activeWorkspaceId: string;
  layoutsByWorkspaceId: Record<string, WorkspaceLayout>;
  chartPositionMap: Record<string, { x: number; y: number }>;
  chartSizeMap: Record<string, { width: number; height: number }>;
  chartStackOrder: string[];
  selectedChartInstanceId: string | null;

  createWorkspace: (name?: string) => string;
  setActiveWorkspace: (workspaceId: string) => void;
  renameWorkspace: (workspaceId: string, name: string) => void;
  deleteWorkspace: (workspaceId: string) => void;
  syncCharts: (charts: ChartItemData[]) => void;
  setSelectedChartInstanceId: (instanceId: string | null) => void;
  moveChart: (instanceId: string, x: number, y: number) => void;
  resizeChart: (instanceId: string, width: number, height: number) => void;
  moveChartToTop: (instanceId: string) => void;
  moveChartToBottom: (instanceId: string) => void;
  moveChartForward: (instanceId: string) => void;
  moveChartBackward: (instanceId: string) => void;
  mergeChartPositions: (positions: Record<string, { x: number; y: number }>) => void;
  mergeChartSizes: (
    sizes: Record<string, { width: number; height: number }>,
  ) => void;
  clearLayout: () => void;
};

const nowIso = () => new Date().toISOString();
const createId = () => `ws_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const makeEmptyLayout = (): WorkspaceLayout => ({
  chartPositionMap: {},
  chartSizeMap: {},
  chartStackOrder: [],
  selectedChartInstanceId: null,
});

const makeWorkspace = (name?: string): WorkspaceMeta => ({
  id: createId(),
  name: name?.trim() || "Untitled workspace",
  createdAt: nowIso(),
  updatedAt: nowIso(),
});

const withActiveLayout = (
  state: LayoutState,
  updater: (layout: WorkspaceLayout) => WorkspaceLayout,
) => {
  const activeId = state.activeWorkspaceId;
  const current = state.layoutsByWorkspaceId[activeId] ?? makeEmptyLayout();
  const nextLayout = updater(current);
  return {
    layoutsByWorkspaceId: {
      ...state.layoutsByWorkspaceId,
      [activeId]: nextLayout,
    },
    chartPositionMap: nextLayout.chartPositionMap,
    chartSizeMap: nextLayout.chartSizeMap,
    chartStackOrder: nextLayout.chartStackOrder,
    selectedChartInstanceId: nextLayout.selectedChartInstanceId,
    workspaces: state.workspaces.map((w) =>
      w.id === activeId ? { ...w, updatedAt: nowIso() } : w,
    ),
  };
};

export const useWorkspaceLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => {
      const defaultWorkspace = makeWorkspace("Default workspace");
      const defaultLayout = makeEmptyLayout();
      return {
        workspaces: [defaultWorkspace],
        activeWorkspaceId: defaultWorkspace.id,
        layoutsByWorkspaceId: { [defaultWorkspace.id]: defaultLayout },
        chartPositionMap: defaultLayout.chartPositionMap,
        chartSizeMap: defaultLayout.chartSizeMap,
        chartStackOrder: defaultLayout.chartStackOrder,
        selectedChartInstanceId: defaultLayout.selectedChartInstanceId,

      createWorkspace: (name) => {
        const ws = makeWorkspace(name);
        set((state) => ({
          workspaces: [...state.workspaces, ws],
          layoutsByWorkspaceId: {
            ...state.layoutsByWorkspaceId,
            [ws.id]: makeEmptyLayout(),
          },
          activeWorkspaceId: ws.id,
          chartPositionMap: {},
          chartSizeMap: {},
          chartStackOrder: [],
          selectedChartInstanceId: null,
        }));
        return ws.id;
      },

      setActiveWorkspace: (workspaceId) =>
        set((state) => {
          const exists = state.workspaces.some((w) => w.id === workspaceId);
          if (!exists) return state;
          const layout = state.layoutsByWorkspaceId[workspaceId] ?? makeEmptyLayout();
          return {
            activeWorkspaceId: workspaceId,
            chartPositionMap: layout.chartPositionMap,
            chartSizeMap: layout.chartSizeMap,
            chartStackOrder: layout.chartStackOrder,
            selectedChartInstanceId: layout.selectedChartInstanceId,
          };
        }),

      renameWorkspace: (workspaceId, name) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? { ...w, name: name.trim() || w.name, updatedAt: nowIso() }
              : w,
          ),
        })),

      deleteWorkspace: (workspaceId) =>
        set((state) => {
          if (state.workspaces.length <= 1) return state;
          const remaining = state.workspaces.filter((w) => w.id !== workspaceId);
          const nextLayouts = { ...state.layoutsByWorkspaceId };
          delete nextLayouts[workspaceId];
          const nextActive =
            state.activeWorkspaceId === workspaceId
              ? remaining[0].id
              : state.activeWorkspaceId;
          const activeLayout = nextLayouts[nextActive] ?? makeEmptyLayout();
          return {
            workspaces: remaining,
            layoutsByWorkspaceId: nextLayouts,
            activeWorkspaceId: nextActive,
            chartPositionMap: activeLayout.chartPositionMap,
            chartSizeMap: activeLayout.chartSizeMap,
            chartStackOrder: activeLayout.chartStackOrder,
            selectedChartInstanceId: activeLayout.selectedChartInstanceId,
          };
        }),

      syncCharts: (charts) => {
        const state = get();
        const activeLayout =
          state.layoutsByWorkspaceId[state.activeWorkspaceId] ?? makeEmptyLayout();
        const activeIds = charts.map((chart) => chart.instanceId);
        const activeIdSet = new Set(activeIds);

        const nextPositionMap: Record<string, { x: number; y: number }> = {};
        charts.forEach((chart, index) => {
          const existing = activeLayout.chartPositionMap[chart.instanceId];
          if (existing) {
            nextPositionMap[chart.instanceId] = existing;
            return;
          }
          if (chart.initialPosition) {
            nextPositionMap[chart.instanceId] = chart.initialPosition;
            return;
          }
          nextPositionMap[chart.instanceId] = {
            x: 20 + (index % 5) * 36,
            y: 20 + Math.floor(index / 5) * 36,
          };
        });

        const nextSizeMap: Record<string, { width: number; height: number }> = {};
        charts.forEach((chart) => {
          nextSizeMap[chart.instanceId] =
            activeLayout.chartSizeMap[chart.instanceId] ?? defaultChartSize;
        });

        const filtered = activeLayout.chartStackOrder.filter((id) =>
          activeIdSet.has(id),
        );
        const existing = new Set(filtered);
        const missing = activeIds.filter((id) => !existing.has(id));
        const nextOrder = [...filtered, ...missing];

        const nextSelected = activeLayout.selectedChartInstanceId;
        const selectedExists = nextSelected && activeIdSet.has(nextSelected);

        const nextLayout: WorkspaceLayout = {
          chartPositionMap: nextPositionMap,
          chartSizeMap: nextSizeMap,
          chartStackOrder: nextOrder,
          selectedChartInstanceId: selectedExists ? nextSelected : null,
        };
        set({
          ...withActiveLayout(state, () => nextLayout),
        });
      },

      setSelectedChartInstanceId: (instanceId) =>
        set((state) =>
          withActiveLayout(state, (layout) => ({
            ...layout,
            selectedChartInstanceId: instanceId,
          })),
        ),

      moveChart: (instanceId, x, y) =>
        set((state) => {
          const current = state.chartPositionMap[instanceId];
          if (current && current.x === x && current.y === y) return state;
          return withActiveLayout(state, (layout) => ({
            ...layout,
            chartPositionMap: {
              ...layout.chartPositionMap,
              [instanceId]: { x, y },
            },
          }));
        }),

      resizeChart: (instanceId, width, height) =>
        set((state) => {
          const current = state.chartSizeMap[instanceId];
          if (current && current.width === width && current.height === height) {
            return state;
          }
          return withActiveLayout(state, (layout) => ({
            ...layout,
            chartSizeMap: {
              ...layout.chartSizeMap,
              [instanceId]: { width, height },
            },
          }));
        }),

      moveChartToTop: (instanceId) =>
        set((state) => {
          const index = state.chartStackOrder.indexOf(instanceId);
          if (index < 0 || index === state.chartStackOrder.length - 1) {
            return state;
          }
          const next = state.chartStackOrder.filter((id) => id !== instanceId);
          next.push(instanceId);
          return withActiveLayout(state, (layout) => ({
            ...layout,
            chartStackOrder: next,
          }));
        }),

      moveChartToBottom: (instanceId) =>
        set((state) => {
          const index = state.chartStackOrder.indexOf(instanceId);
          if (index <= 0) return state;
          const next = state.chartStackOrder.filter((id) => id !== instanceId);
          next.unshift(instanceId);
          return withActiveLayout(state, (layout) => ({
            ...layout,
            chartStackOrder: next,
          }));
        }),

      moveChartForward: (instanceId) =>
        set((state) => {
          const index = state.chartStackOrder.indexOf(instanceId);
          if (index < 0 || index === state.chartStackOrder.length - 1) {
            return state;
          }
          const next = [...state.chartStackOrder];
          [next[index], next[index + 1]] = [next[index + 1], next[index]];
          return withActiveLayout(state, (layout) => ({
            ...layout,
            chartStackOrder: next,
          }));
        }),

      moveChartBackward: (instanceId) =>
        set((state) => {
          const index = state.chartStackOrder.indexOf(instanceId);
          if (index <= 0) return state;
          const next = [...state.chartStackOrder];
          [next[index], next[index - 1]] = [next[index - 1], next[index]];
          return withActiveLayout(state, (layout) => ({
            ...layout,
            chartStackOrder: next,
          }));
        }),

      mergeChartPositions: (positions) =>
        set((state) =>
          withActiveLayout(state, (layout) => ({
            ...layout,
            chartPositionMap: { ...layout.chartPositionMap, ...positions },
          })),
        ),

      mergeChartSizes: (sizes) =>
        set((state) =>
          withActiveLayout(state, (layout) => ({
            ...layout,
            chartSizeMap: { ...layout.chartSizeMap, ...sizes },
          })),
        ),

      clearLayout: () =>
        set((state) =>
          withActiveLayout(state, () => ({
            chartPositionMap: {},
            chartSizeMap: {},
            chartStackOrder: [],
            selectedChartInstanceId: null,
          })),
        ),
    };
    },
    {
      name: "smartcharts-workspace-layout-v1",
      version: 1,
      storage: createJSONStorage(() => indexedDbStorage),
    },
  ),
);

