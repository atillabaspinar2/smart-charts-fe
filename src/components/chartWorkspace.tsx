import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { exportChartDataToCSV } from "../utils/spreadsheetExport";
import { drawExportWatermark } from "@/utils/videoWatermark";
import debounce from "lodash/debounce";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { ChartSettingsPanel } from "./ChartSettingsPanel";
import { ChartItem } from "./chartItem";
import { CanvasContextMenu } from "./canvasContextMenu";
import { Modal } from "./UILibrary/Modal";
import { Tooltip } from "./UILibrary/Tooltip";
import { PanelView } from "./UILibrary/PanelView";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  getThemeBackground,
  getThemePalette,
} from "../assets/themes/registerThemes";
import { getOptionsByType } from "./chartOptionTemplates";
import { LineChartDataPanel } from "./dataUI/lineChartDataPanel";
import { BarChartDataPanel } from "./dataUI/barChartDataPanel";
import { PieChartDataPanel } from "./dataUI/pieChartDataPanel";
import { MapChartDataPanel } from "./dataUI/mapChartDataPanel";
import type { MapChartData } from "./chartTypes";
import {
  buildChartDataFromSheetRows,
  readSheetRowsFromFile,
  type DataOrientation,
} from "../utils/spreadsheetImport";
import {
  resolveLineSketchIntensity,
  resolveSketchIntensity,
} from "@/utils/roughLineSeries";
import {
  type BarChartData,
  type ChartData,
  type ChartItemData,
  type LineChartData,
  type PieChartData,
  type PieChartSettings,
  type LineChartSettings,
  type BarChartSettings,
  type MapChartSettings,
  type ReanimateSignal,
  defaultPieChartSettings,
  defaultLineChartSettings,
  defaultBarChartSettings,
  defaultMapChartSettings,
  type ChartSettingsUnion,
  type SketchTypographyPresetId,
} from "./chartTypes";
import { useAuth } from "@/context/AuthContext";
import {
  useWorkspaceLayoutStore,
  defaultCanvasContainerSize,
  type CanvasSettings,
} from "@/store/workspaceLayoutStore";
import { useWorkspaceChartsStore } from "@/store/workspaceChartsStore";
import type { AnyAnnotation } from "@/hooks/useAnnotation";
import { useTheme, type ThemeName } from "./theme-provider";
import AnimationTimeline from "./timeline/AnimationTimeline";

const defaultChartSize = {
  width: 400,
  height: 300,
};

const defaultContainerSize = defaultCanvasContainerSize;

const EMPTY_ANNOTATIONS: AnyAnnotation[] = [];

const DATA_PANEL_FIXED_TOP = 120;
const DATA_PANEL_HEADER_HEIGHT = 40;
const CHART_Z_INDEX_MAX = 90;
const CHART_Z_INDEX_SELECTED = 95;

/** Chart title from import: file basename without the last extension (`Q1 sales.xlsx` → `Q1 sales`). */
function fileNameStemForTitle(fileName: string): string {
  const t = fileName.trim();
  if (!t) return "";
  const dot = t.lastIndexOf(".");
  if (dot <= 0) return t;
  const stem = t.slice(0, dot).trim();
  return stem || t;
}

export const ChartWorkspace: React.FC<{
  charts: ChartItemData[];
  addChart: (type: string, initialPosition?: { x: number; y: number }) => void;
  removeChart: (id: number) => void;
  isMobileMode: boolean;
  pendingMobileChartType: string | null;
  setAuthModal: React.Dispatch<
    React.SetStateAction<"signup" | "signin" | null>
  >;
  onPlaceMobileChartType: (
    type: string,
    position: { x: number; y: number },
  ) => void;
  onCancelMobileChartPlacement: () => void;
}> = ({
  charts,
  addChart,
  removeChart,
  isMobileMode,
  pendingMobileChartType,
  onPlaceMobileChartType,
  onCancelMobileChartPlacement,
  setAuthModal: _setAuthModal,
}) => {
  const { isAuthenticated } = useAuth();
  const workspaceId = useWorkspaceLayoutStore((s) => s.activeWorkspaceId);
  const workspaces = useWorkspaceLayoutStore((s) => s.workspaces);
  const chartsStoreHydrated = useWorkspaceChartsStore((s) => s.hasHydrated);
  const chartEntities = useWorkspaceChartsStore(
    (s) => s.chartsByWorkspaceId[workspaceId],
  );
  const upsertChartData = useWorkspaceChartsStore((s) => s.upsertChartData);
  const upsertChartSettings = useWorkspaceChartsStore(
    (s) => s.upsertChartSettings,
  );
  const upsertAnnotations = useWorkspaceChartsStore(
    (s) => s.upsertAnnotations,
  );
  const upsertChartDraftData = useWorkspaceChartsStore((s) => s.upsertChartDraftData);
  const clearChartDraftData = useWorkspaceChartsStore((s) => s.clearChartDraftData);
  const [pendingRemoval, setPendingRemoval] = useState<
    { mode: "single"; chartId: number } | { mode: "all" } | null
  >(null);
  const chartPositionMap = useWorkspaceLayoutStore((s) => s.chartPositionMap);
  const chartSizeMap = useWorkspaceLayoutStore((s) => s.chartSizeMap);
  const chartStackOrder = useWorkspaceLayoutStore((s) => s.chartStackOrder);
  const selectedChartInstanceId = useWorkspaceLayoutStore(
    (s) => s.selectedChartInstanceId,
  );
  const syncLayoutCharts = useWorkspaceLayoutStore((s) => s.syncCharts);
  const setSelectedChartInstanceId = useWorkspaceLayoutStore(
    (s) => s.setSelectedChartInstanceId,
  );
  const moveChart = useWorkspaceLayoutStore((s) => s.moveChart);
  const resizeChart = useWorkspaceLayoutStore((s) => s.resizeChart);
  const moveChartToTop = useWorkspaceLayoutStore((s) => s.moveChartToTop);
  const moveChartToBottom = useWorkspaceLayoutStore((s) => s.moveChartToBottom);
  const moveChartForward = useWorkspaceLayoutStore((s) => s.moveChartForward);
  const moveChartBackward = useWorkspaceLayoutStore((s) => s.moveChartBackward);
  const mergeChartPositions = useWorkspaceLayoutStore(
    (s) => s.mergeChartPositions,
  );
  const mergeChartSizes = useWorkspaceLayoutStore((s) => s.mergeChartSizes);
  const clearLayout = useWorkspaceLayoutStore((s) => s.clearLayout);

  // Workspace-persisted UI state (canvas settings, chart theme, and media type)
  const layoutHydrated = useWorkspaceLayoutStore((s) => s.hasHydrated);
  const persistedCanvasContainerSize = useWorkspaceLayoutStore(
    (s) => s.canvasContainerSize,
  );
  const setCanvasContainerSize = useWorkspaceLayoutStore(
    (s) => s.setCanvasContainerSize,
  );
  const persistedCanvasSettings = useWorkspaceLayoutStore((s) => s.canvasSettings);
  const persistedWorkspaceTheme = useWorkspaceLayoutStore((s) => s.workspaceTheme);
  const persistedMediaType = useWorkspaceLayoutStore((s) => s.mediaType);
  // Workspace-persisted global app UI state (ThemeProvider theme + light/dark mode)
  const persistedAppTheme = useWorkspaceLayoutStore((s) => s.appTheme);
  const persistedAppMode = useWorkspaceLayoutStore((s) => s.appMode);
  const setWorkspaceCanvasUi = useWorkspaceLayoutStore(
    (s) => s.setWorkspaceCanvasUi,
  );
  const setWorkspaceAppUi = useWorkspaceLayoutStore((s) => s.setWorkspaceAppUi);

  const { theme: appTheme, mode: appMode, setTheme, setMode } = useTheme();
  const appThemeRef = useRef(appTheme);
  const appModeRef = useRef(appMode);
  useEffect(() => {
    appThemeRef.current = appTheme;
  }, [appTheme]);
  useEffect(() => {
    appModeRef.current = appMode;
  }, [appMode]);
  const [chartDataMap, setChartDataMap] = useState<Record<string, ChartData>>(
    {},
  );
  const [chartSettingsMap, setChartSettingsMap] = useState<
    Record<
      string,
      LineChartSettings | BarChartSettings | PieChartSettings | MapChartSettings
    >
  >({});
  const [mediaType, setMediaType] = useState<string>("webm");
  const [reanimateSignal, setReanimateSignal] =
    useState<ReanimateSignal | null>(null);
  const [hiddenChartIds, setHiddenChartIds] = useState<Set<string>>(new Set());
  const [fadedOutChartIds, setFadedOutChartIds] = useState<Set<string>>(new Set());
  const playbackTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [animBarKey, setAnimBarKey] = useState(0);
  const [animBarDurationMs, setAnimBarDurationMs] = useState(1000);
  const animBarClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Counts how many upcoming reanimateSignal updates belong to a "animate all"
  // batch and should NOT restart the progress bar independently.
  const suppressBarSignalCountRef = useRef(0);
  const [isCapturingAll, setIsCapturingAll] = useState(false);
  const [activeCanvasTab, setActiveCanvasTab] = useState<"workspace" | "timeline">("workspace");
  const [containerSize, setContainerSize] = useState(defaultContainerSize);
  const [dataPanelMode, setDataPanelMode] = useState<"grid" | "fixed-up">(
    "grid",
  );
  const [fixedPanelBounds, setFixedPanelBounds] = useState({
    left: 0,
    width: 0,
  });
  const [dataPanelTop, setDataPanelTop] =
    useState<number>(DATA_PANEL_FIXED_TOP);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    animationDuration: 1000,
    timelineTotalMs: 10000,
    backgroundColor: "#ffffff",
    title: "Workspace",
    fontFamily: "Noto Sans",
    fontSize: 20,
    titleFontColor: "#333333",
  });
  const [workspaceTheme, setWorkspaceTheme] = useState<string>("");
  const didInitWorkspaceUiRef = useRef(false);
  const isHydratingWorkspaceUiRef = useRef(false);

  const persistWorkspaceCanvasUiDebounced = useMemo(
    () =>
      debounce(
        (ui: {
          canvasSettings: CanvasSettings;
          workspaceTheme: string;
          mediaType: string;
        }) => {
          setWorkspaceCanvasUi(ui);
        },
        250,
        { maxWait: 1000 },
      ),
    [setWorkspaceCanvasUi],
  );

  const persistCanvasContainerSizeDebounced = useMemo(
    () =>
      debounce(
        (size: { width: number; height: number }) => {
          setCanvasContainerSize(size);
        },
        250,
        { maxWait: 1000 },
      ),
    [setCanvasContainerSize],
  );

  const areCanvasSettingsEqual = useCallback(
    (a: CanvasSettings, b: CanvasSettings) =>
      a.animationDuration === b.animationDuration &&
      a.backgroundColor === b.backgroundColor &&
      a.title === b.title &&
      a.fontFamily === b.fontFamily &&
      a.fontSize === b.fontSize &&
      a.titleFontColor === b.titleFontColor,
    [],
  );

  // Restore and persist workspace-scoped UI state.
  useEffect(() => {
    if (!layoutHydrated) return;
    isHydratingWorkspaceUiRef.current = true;

    setCanvasSettings((prev) =>
      areCanvasSettingsEqual(prev, persistedCanvasSettings)
        ? prev
        : persistedCanvasSettings,
    );
    setWorkspaceTheme((prev) =>
      prev === persistedWorkspaceTheme ? prev : persistedWorkspaceTheme,
    );
    setMediaType((prev) =>
      prev === persistedMediaType ? prev : persistedMediaType,
    );
    setContainerSize((prev) =>
      prev.width === persistedCanvasContainerSize.width &&
      prev.height === persistedCanvasContainerSize.height
        ? prev
        : persistedCanvasContainerSize,
    );

    // Sync ThemeProvider global UI state from workspace.
    // Important: we intentionally do NOT re-run this effect on user toggles
    // (so we don't fight with the ThemeProvider state).
    if (persistedAppTheme !== appThemeRef.current) {
      setTheme(persistedAppTheme as ThemeName);
    }
    const effectivePersistedMode = persistedAppMode === "system" ? "light" : persistedAppMode;
    if (effectivePersistedMode !== appModeRef.current) {
      setMode(effectivePersistedMode);
    }

    // Keep the "hydrating" guard enabled for this effect flush so the
    // "persist back" effects don't write to the store immediately.
    window.setTimeout(() => {
      didInitWorkspaceUiRef.current = true;
      isHydratingWorkspaceUiRef.current = false;
    }, 0);
  }, [
    layoutHydrated,
    workspaceId,
    persistedCanvasSettings,
    persistedCanvasContainerSize,
    persistedWorkspaceTheme,
    persistedMediaType,
    persistedAppTheme,
    persistedAppMode,
    setCanvasSettings,
    setWorkspaceTheme,
    setMediaType,
    setTheme,
    setMode,
    areCanvasSettingsEqual,
  ]);

  useEffect(() => {
    if (!layoutHydrated) return;
    if (isHydratingWorkspaceUiRef.current) return;
    if (!didInitWorkspaceUiRef.current) return;

    const canvasUnchanged = areCanvasSettingsEqual(
      canvasSettings,
      persistedCanvasSettings,
    );
    const themeUnchanged = workspaceTheme === persistedWorkspaceTheme;
    const mediaUnchanged = mediaType === persistedMediaType;

    if (canvasUnchanged && themeUnchanged && mediaUnchanged) return;

    persistWorkspaceCanvasUiDebounced({
      canvasSettings,
      workspaceTheme,
      mediaType,
    });
  }, [
    layoutHydrated,
    canvasSettings,
    workspaceTheme,
    mediaType,
    persistedCanvasSettings,
    persistedWorkspaceTheme,
    persistedMediaType,
    persistWorkspaceCanvasUiDebounced,
    areCanvasSettingsEqual,
  ]);

  useEffect(() => {
    return () => {
      persistWorkspaceCanvasUiDebounced.cancel();
    };
  }, [persistWorkspaceCanvasUiDebounced]);

  useEffect(() => {
    return () => {
      persistCanvasContainerSizeDebounced.cancel();
    };
  }, [persistCanvasContainerSizeDebounced]);

  useEffect(() => {
    if (!layoutHydrated) return;
    if (isHydratingWorkspaceUiRef.current) return;
    if (!didInitWorkspaceUiRef.current) return;

    if (
      containerSize.width === persistedCanvasContainerSize.width &&
      containerSize.height === persistedCanvasContainerSize.height
    ) {
      return;
    }

    persistCanvasContainerSizeDebounced(containerSize);
  }, [
    layoutHydrated,
    containerSize,
    persistedCanvasContainerSize.width,
    persistedCanvasContainerSize.height,
    persistCanvasContainerSizeDebounced,
  ]);

  useEffect(() => {
    if (!layoutHydrated) return;
    if (isHydratingWorkspaceUiRef.current) return;
    if (!didInitWorkspaceUiRef.current) return;

    if (persistedAppTheme === appTheme && persistedAppMode === appMode) {
      return;
    }

    setWorkspaceAppUi({
      appTheme,
      appMode,
    });
  }, [
    layoutHydrated,
    appTheme,
    appMode,
    persistedAppTheme,
    persistedAppMode,
    setWorkspaceAppUi,
  ]);
  const [chartDataOrientationMap, setChartDataOrientationMap] = useState<
    Record<string, DataOrientation>
  >({});

  const activeWorkspaceName = useMemo(() => {
    return workspaces.find((w) => w.id === workspaceId)?.name ?? "Workspace";
  }, [workspaces, workspaceId]);

  // Hydrate persisted chart content once (per workspace) so refresh restores charts.
  useEffect(() => {
    if (!chartsStoreHydrated) return;

    charts.forEach((chart) => {
      const entity = chartEntities?.[chart.instanceId];
      if (!entity) return;

      if (entity.chartData && !chartDataMap[chart.instanceId]) {
        setChartDataMap((prev) => ({
          ...prev,
          [chart.instanceId]: entity.chartData as ChartData,
        }));
      }

      if (entity.chartSettings && !chartSettingsMap[chart.instanceId]) {
        setChartSettingsMap((prev) => ({
          ...prev,
          [chart.instanceId]:
            entity.chartSettings as
              | LineChartSettings
              | BarChartSettings
              | PieChartSettings
              | MapChartSettings,
        }));
      }

    });
    // We intentionally include local maps so we only fill missing keys.
  }, [
    charts,
    chartsStoreHydrated,
    chartEntities,
    chartDataMap,
    chartSettingsMap,
  ]);

  const [pendingImportChartInstanceId, setPendingImportChartInstanceId] =
    useState<string | null>(null);
  const dataPanelApplyHandlerRef = useRef<(() => ChartData) | null>(null);
  const activeThemeColors = getThemePalette(workspaceTheme);

  const commitChartData = (instanceId: string, nextData: ChartData) => {
    setChartDataMap((prev) => ({
      ...prev,
      [instanceId]: nextData,
    }));
    upsertChartData(workspaceId, instanceId, nextData);
    clearChartDraftData(workspaceId, instanceId);
  };

  const updateChartDataDraft = (instanceId: string, nextData: ChartData) => {
    upsertChartDraftData(workspaceId, instanceId, nextData);
  };

  const getThemeColor = useCallback(
    (index: number) => activeThemeColors[index % activeThemeColors.length],
    [activeThemeColors],
  );

  const initializeChartSettings = (instanceId: string, type: string) => {
    const templateOptions: any = getOptionsByType(type);

    let nextSettings: ChartSettingsUnion;

    if (type === "pie") {
      nextSettings = {
        ...defaultPieChartSettings,
        animationDuration: templateOptions.animationDuration || 1000,
        backgroundColor: "#ffffff",
        title: templateOptions?.title?.text || "",
        fontFamily: canvasSettings.fontFamily,
        fontSize: canvasSettings.fontSize,
        titleFontColor: canvasSettings.titleFontColor,
      };
    } else if (type === "map") {
      nextSettings = {
        ...defaultMapChartSettings,
        animationDuration: templateOptions.animationDuration || 1000,
        title: templateOptions?.title?.text || "",
        fontFamily: canvasSettings.fontFamily,
        fontSize: canvasSettings.fontSize,
        titleFontColor: canvasSettings.titleFontColor,
      };
    } else {
      const baseDefaults = type === "bar" ? defaultBarChartSettings : defaultLineChartSettings;
      nextSettings = {
        ...baseDefaults,
        animationDuration: templateOptions.animationDuration || 1000,
        backgroundColor: "#ffffff",
        title: templateOptions?.title?.text || "",
        fontFamily: canvasSettings.fontFamily,
        fontSize: canvasSettings.fontSize,
        titleFontColor: canvasSettings.titleFontColor,
      } as LineChartSettings | BarChartSettings;
    }

    setChartSettingsMap((prev) => ({
      ...prev,
      [instanceId]: nextSettings,
    }));

    upsertChartSettings(workspaceId, instanceId, nextSettings);
  };

  const initializeChartData = (instanceId: string, type: string) => {
    if (type !== "line" && type !== "bar" && type !== "pie" && type !== "map")
      return;

    if (type === "pie") {
      const templateOptions: any = getOptionsByType(type);
      const templateSeries = Array.isArray(templateOptions?.series)
        ? templateOptions.series[0] || {}
        : {};
      const templateData = Array.isArray(templateSeries?.data)
        ? templateSeries.data
        : [];

      const nextData: PieChartData = {
        type: "pie",
        seriesName: templateSeries?.name || "Pie Series",
        data: templateData.length
          ? templateData.map((point: any, index: number) => ({
              id: `${instanceId}-slice-${index + 1}`,
              name: String(point?.name || `Slice ${index + 1}`),
              value: Number(point?.value) || 0,
            }))
          : [
              {
                id: `${instanceId}-slice-1`,
                name: "Slice 1",
                value: 100,
              },
            ],
      };

      commitChartData(instanceId, nextData);
      return;
    }

    if (type === "bar") {
      const templateOptions: any = getOptionsByType(type);
      const categories = Array.isArray(templateOptions?.xAxis?.data)
        ? templateOptions.xAxis.data.map(String)
        : ["A", "B", "C", "D", "E"];
      const templateSeries = Array.isArray(templateOptions?.series)
        ? templateOptions.series
        : [];

      const nextData: BarChartData = {
        type: "bar",
        categories,
        series: templateSeries.length
          ? templateSeries.map((series: any, index: number) => ({
              id: `${instanceId}-series-${index + 1}`,
              name: series.name || `Series ${index + 1}`,
              color: getThemeColor(index),
              colorSource: "theme",
              themeColorIndex: index,
              values: Array.isArray(series.data)
                ? series.data.map((value: unknown) => Number(value) || 0)
                : [],
            }))
          : [
              {
                id: `${instanceId}-series-1`,
                name: "Series 1",
                color: getThemeColor(0),
                colorSource: "theme",
                themeColorIndex: 0,
                values: [5, 20, 36, 10, 10],
              },
            ],
      };

      commitChartData(instanceId, nextData);
      return;
    }

    if (type === "map") {
      const mapName = "countries";
      const nextData: MapChartData & {
        series: { data: { name: string; value: number }[] };
      } = {
        type: "map",
        mapName,
        series: { data: [] },
      };

      commitChartData(instanceId, nextData);

      // Fill region rows for the data panel (same as changing map in the panel).
      void (async () => {
        try {
          const { getMapData } = await import("./mapChartOptions");
          const regions = await getMapData(mapName);
          if (regions.length === 0) return;
          commitChartData(instanceId, {
            type: "map",
            mapName,
            series: { data: regions },
          });
        } catch {
          // Map asset failed; empty grid until user picks a map or imports data.
        }
      })();
      return;
    }

    const templateOptions: any = getOptionsByType(type);
    const categories = Array.isArray(templateOptions?.xAxis?.data)
      ? templateOptions.xAxis.data.map(String)
      : [];
    const templateSeries = Array.isArray(templateOptions?.series)
      ? templateOptions.series
      : [];

    const nextData: LineChartData = {
      type: "line",
      categories,
      series: templateSeries.length
        ? templateSeries.map((series: any, index: number) => ({
            id: `${instanceId}-series-${index + 1}`,
            name: series.name || `Series ${index + 1}`,
            color: getThemeColor(index),
            colorSource: "theme",
            themeColorIndex: index,
            values: Array.isArray(series.data)
              ? series.data.map((value: unknown) => Number(value) || 0)
              : [],
          }))
        : [
            {
              id: `${instanceId}-series-1`,
              name: "Series 1",
              color: getThemeColor(0),
              colorSource: "theme",
              themeColorIndex: 0,
              values: [150, 230, 224, 218, 135, 147, 260],
            },
          ],
    };

    commitChartData(instanceId, nextData);
  };

  const updateChartSettings = (
    instanceId: string,
    updates: Partial<
      LineChartSettings &
      BarChartSettings &
      PieChartSettings &
      MapChartSettings
    >,
  ) => {
    setChartSettingsMap((prev) => {
      const current = prev[instanceId] || defaultLineChartSettings;
      const next = { ...current, ...updates };

      // Persist committed settings immediately (settings panel is treated as live).
      upsertChartSettings(workspaceId, instanceId, next as any);

      const animationChanged =
        typeof updates.animationDuration === "number" &&
        updates.animationDuration !== current.animationDuration;

      // Only the flags above were used historically; pie/map-specific fields (innerRadius,
      // mapName, visualMapColorRange, …) must still update local state — do not short-circuit.
      const nextSerialized = JSON.stringify(next);
      const currentSerialized = JSON.stringify(current);
      if (nextSerialized === currentSerialized) {
        return prev;
      }

      if (animationChanged) {
        setReanimateSignal({ instanceId, key: Date.now() });
      }

      return {
        ...prev,
        [instanceId]: next,
      };
    });
  };

  const getChartSettings = (
    instanceId: string,
    type?: string,
  ):
    | LineChartSettings
    | BarChartSettings
    | PieChartSettings
    | MapChartSettings => {
    const defaults =
      type === "pie"
        ? defaultPieChartSettings
        : type === "bar"
          ? defaultBarChartSettings
          : type === "map"
            ? defaultMapChartSettings
            : defaultLineChartSettings;
    const settings = chartSettingsMap[instanceId];
    if (settings) {
      return { ...defaults, ...settings } as
        | LineChartSettings
        | BarChartSettings
        | PieChartSettings
        | MapChartSettings;
    }
    return defaults;
  };

  const getPieChartSettings = (instanceId: string): PieChartSettings => {
    const chart = charts.find((c) => c.instanceId === instanceId);
    const s = getChartSettings(instanceId, chart?.type);
    return s as PieChartSettings;
  };

  const getMapChartSettings = (instanceId: string): MapChartSettings => {
    const chart = charts.find((c) => c.instanceId === instanceId);
    const s = getChartSettings(instanceId, chart?.type);
    return s as MapChartSettings;
  };

  const updateChartData = (
    instanceId: string,
    nextData: ChartData,
    options?: { reanimate?: boolean },
  ) => {
    commitChartData(instanceId, nextData);
    if (options?.reanimate) {
      setReanimateSignal({ instanceId, key: Date.now() });
    }
  };

  const applyThemeColorsToChartSeries = useCallback(
    (instanceId: string) => {
      const data = chartDataMap[instanceId];
      if (!data || (data.type !== "line" && data.type !== "bar")) return;

      const nextSeries = data.series.map((series, index) => ({
        ...series,
        color: activeThemeColors[index % activeThemeColors.length],
        colorSource: "theme" as const,
        themeColorIndex: index,
      }));

      updateChartData(
        instanceId,
        {
          ...data,
          series: nextSeries,
        } as ChartData,
        { reanimate: true },
      );

      const themeBg = getThemeBackground(workspaceTheme);
      if (themeBg) {
        updateChartSettings(instanceId, { backgroundColor: themeBg });
      }
    },
    [activeThemeColors, chartDataMap, workspaceTheme],
  );

  const applyThemeColorsToAllCharts = useCallback(() => {
    charts.forEach((chart) => {
      applyThemeColorsToChartSeries(chart.instanceId);
    });
  }, [charts, applyThemeColorsToChartSeries]);

  useEffect(() => {
    if (!chartsStoreHydrated) return;
    charts.forEach((chart) => {
      const entity = chartEntities?.[chart.instanceId];
      if (!chartSettingsMap[chart.instanceId]) {
        if (!entity?.chartSettings) {
          initializeChartSettings(chart.instanceId, chart.type);
        }
      }
      if (
        (chart.type === "line" ||
          chart.type === "bar" ||
          chart.type === "pie" ||
          chart.type === "map") &&
        !chartDataMap[chart.instanceId]
      ) {
        if (!entity?.chartData) {
          initializeChartData(chart.instanceId, chart.type);
        }
      }
    });
  }, [
    charts,
    chartSettingsMap,
    chartDataMap,
    chartsStoreHydrated,
    workspaceId,
    chartEntities,
  ]);

  const orderedCharts = useMemo(() => {
    if (!chartStackOrder.length) return charts;
    return [...charts].sort((a, b) => {
      const ia = chartStackOrder.indexOf(a.instanceId);
      const ib = chartStackOrder.indexOf(b.instanceId);
      const sa = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
      const sb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
      return sa - sb;
    });
  }, [charts, chartStackOrder]);

  useEffect(() => {
    if (!layoutHydrated || !chartsStoreHydrated) return;
    syncLayoutCharts(charts);
  }, [
    charts,
    syncLayoutCharts,
    layoutHydrated,
    chartsStoreHydrated,
  ]);

  const onSelectChart = useCallback(
    (instanceId: string) => {
      setSelectedChartInstanceId(instanceId);
    },
    [setSelectedChartInstanceId],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const gridDataPanelRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const clampDataPanelTop = useCallback((value: number) => {
    const maxTop = Math.max(
      0,
      window.innerHeight - DATA_PANEL_HEADER_HEIGHT - 8,
    );
    return Math.max(0, Math.min(maxTop, value));
  }, []);

  const handleDataPanelHeaderMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-panel-drag='true']")) return;

      e.preventDefault();

      const startY = e.clientY;
      const currentTop =
        dataPanelMode === "fixed-up"
          ? dataPanelTop
          : (gridDataPanelRef.current?.getBoundingClientRect().top ??
            DATA_PANEL_FIXED_TOP);

      if (dataPanelMode !== "fixed-up") {
        setDataPanelMode("fixed-up");
      }
      setDataPanelTop(clampDataPanelTop(currentTop));

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = moveEvent.clientY - startY;
        setDataPanelTop(clampDataPanelTop(currentTop + deltaY));
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [clampDataPanelTop, dataPanelMode, dataPanelTop],
  );

  useEffect(() => {
    const updateFixedPanelBounds = () => {
      const host = workspaceRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      setFixedPanelBounds({
        left: Math.round(rect.left),
        width: Math.round(rect.width),
      });
    };

    updateFixedPanelBounds();
    window.addEventListener("resize", updateFixedPanelBounds);
    window.addEventListener("scroll", updateFixedPanelBounds, true);

    return () => {
      window.removeEventListener("resize", updateFixedPanelBounds);
      window.removeEventListener("scroll", updateFixedPanelBounds, true);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateContainerSize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      // Ignore zero dimensions: happens when the workspace tab is hidden
      // (display:none / visibility:hidden collapses the container).
      if (width === 0 || height === 0) return;
      setContainerSize((prev) => {
        if (prev.width === width && prev.height === height) return prev;
        return { width, height };
      });
    };

    updateContainerSize();
    const observer = new ResizeObserver(updateContainerSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("chartType");
    // if type is a chart type, add a new chart at the drop position
    // else bubble the event to allow dropping into chart items for annotation placement
    if (type && !["line", "bar", "pie", "map"].includes(type)) return;
    e.stopPropagation();

    const container = containerRef.current;

    if (type && container) {
      const containerRect = container.getBoundingClientRect();
      const dropX = Math.max(
        0,
        e.clientX - containerRect.left + container.scrollLeft,
      );
      const dropY = Math.max(
        0,
        e.clientY - containerRect.top + container.scrollTop,
      );

      addChart(type, { x: dropX, y: dropY });
      return;
    }

    if (type) addChart(type);
  };

  const onCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;

    if (isMobileMode && pendingMobileChartType) {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const dropX = Math.max(0, e.clientX - rect.left + container.scrollLeft);
      const dropY = Math.max(0, e.clientY - rect.top + container.scrollTop);
      onPlaceMobileChartType(pendingMobileChartType, { x: dropX, y: dropY });
      setSelectedChartInstanceId(null);
      return;
    }

    setSelectedChartInstanceId(null);
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const buildCanvasSnapshot = (): HTMLCanvasElement | null => {
    const container = containerRef.current;
    if (!container) return null;

    const chartItems = Array.from(container.children).filter(
      (el): el is HTMLDivElement =>
        el instanceof HTMLElement && el.hasAttribute("data-instance-id"),
    );
    if (chartItems.length === 0) return null;

    /** Match the visible workspace (#chart-canvas) only. Fixed client size stays stable across sketch motion (no per-frame inflate). */
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);

    const output = document.createElement("canvas");
    output.width = width;
    output.height = height;

    const ctx = output.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = canvasSettings.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const containerRect = container.getBoundingClientRect();

    chartItems.forEach((item) => {
      // Skip charts that are hidden (waiting for their timeline startMs)
      if (item.style.visibility === "hidden") return;
      if (item.dataset.fadedOut === "true") return;

      const sourceCanvas = item.querySelector(
        "canvas",
      ) as HTMLCanvasElement | null;
      if (!sourceCanvas) return;

      const itemRect = item.getBoundingClientRect();
      const x = itemRect.left - containerRect.left + container.scrollLeft;
      const y = itemRect.top - containerRect.top + container.scrollTop;
      const w = item.offsetWidth;
      const h = item.offsetHeight;

      ctx.drawImage(
        sourceCanvas,
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height,
        x,
        y,
        w,
        h,
      );
    });

    return output;
  };


  const handleRemoveAll = () => {
    charts.forEach((chart) => removeChart(chart.id));
    setSelectedChartInstanceId(null);
    clearLayout();
  };

  const requestRemoveChart = useCallback((chartId: number) => {
    setPendingRemoval({ mode: "single", chartId });
  }, []);

  const requestRemoveAll = useCallback(() => {
    setPendingRemoval({ mode: "all" });
  }, []);

  const confirmRemoval = useCallback(() => {
    if (!pendingRemoval) return;

    if (pendingRemoval.mode === "single") {
      removeChart(pendingRemoval.chartId);
      const chartToRemove = charts.find((chart) => chart.id === pendingRemoval.chartId);
      if (chartToRemove && selectedChartInstanceId === chartToRemove.instanceId) {
        setSelectedChartInstanceId(null);
      }
    } else {
      handleRemoveAll();
    }

    setPendingRemoval(null);
  }, [
    charts,
    handleRemoveAll,
    pendingRemoval,
    removeChart,
    selectedChartInstanceId,
    setSelectedChartInstanceId,
  ]);

  const startProgressBar = useCallback((durationMs: number) => {
    if (animBarClearTimerRef.current !== null) {
      clearTimeout(animBarClearTimerRef.current);
    }
    setAnimBarDurationMs(durationMs);
    setAnimBarKey((k) => k + 1);
    // Remove the bar once the animation completes
    animBarClearTimerRef.current = setTimeout(() => {
      setAnimBarKey(0);
      animBarClearTimerRef.current = null;
    }, durationMs + 50);
  }, []);

  const triggerStaggeredPlayback = useCallback(() => {
    // Cancel any in-progress timers from a previous playback
    playbackTimersRef.current.forEach(clearTimeout);
    playbackTimersRef.current = [];

    const totalMs = persistedCanvasSettings.timelineTotalMs ?? 10000;
    // Suppress per-chart bar restarts for all signals fired by this batch
    suppressBarSignalCountRef.current = charts.length;
    startProgressBar(totalMs);

    // Hide every chart initially; each reveals at its own startMs
    setHiddenChartIds(new Set(charts.map((c) => c.instanceId)));
    // Clear any leftover fade-outs from a previous playback
    setFadedOutChartIds(new Set());

    charts.forEach((chart, idx) => {
      const entity = chartEntities?.[chart.instanceId];
      const clip = entity?.timelineClip;
      const startMs = clip?.startMs ?? 0;
      const endMs = clip?.endMs ?? totalMs;

      // Stagger by 2ms per chart so React doesn't batch the state updates
      const t = setTimeout(() => {
        setHiddenChartIds((prev) => {
          const next = new Set(prev);
          next.delete(chart.instanceId);
          return next;
        });
        setReanimateSignal({
          instanceId: chart.instanceId,
          key: Date.now() + idx,
        });
      }, startMs + idx * 2);

      playbackTimersRef.current.push(t);

      // Schedule fade-out after the clip ends (if hideAfterAnimation is set)
      if (entity?.hideAfterAnimation) {
        const fadeTimer = setTimeout(() => {
          setFadedOutChartIds((prev) => new Set([...prev, chart.instanceId]));
        }, endMs + idx * 2);
        playbackTimersRef.current.push(fadeTimer);
      }
    });

    // After full canvas animation, restore all faded-out charts (screen only)
    const restoreTimer = setTimeout(() => {
      setFadedOutChartIds(new Set());
    }, totalMs + 700);
    playbackTimersRef.current.push(restoreTimer);
  }, [charts, chartEntities, persistedCanvasSettings.timelineTotalMs, startProgressBar]);

  // Show progress bar for single-chart reanimate (skip signals from batch playback)
  useEffect(() => {
    if (!reanimateSignal) return;
    if (suppressBarSignalCountRef.current > 0) {
      suppressBarSignalCountRef.current -= 1;
      return;
    }
    const chart = charts.find((c) => c.instanceId === reanimateSignal.instanceId);
    if (!chart) return;
    const clip = chartEntities?.[chart.instanceId]?.timelineClip;
    const durationMs = clip
      ? clip.endMs - clip.startMs
      : (getChartSettings(chart.instanceId, chart.type).animationDuration ?? 1000);
    startProgressBar(durationMs);
  }, [reanimateSignal]);

  const handleRefreshAll = () => {
    triggerStaggeredPlayback();
  };

  const handleCaptureAll = async () => {
      if (charts.length === 0 || isCapturingAll) return;
    

    try {
      const totalMs = persistedCanvasSettings.timelineTotalMs ?? 10000;
      const durationMs = totalMs + 500;

      // Hide all charts so they reveal at their proper timeline positions
      setHiddenChartIds(new Set(charts.map((c) => c.instanceId)));

      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );

      const snapshotCanvas = buildCanvasSnapshot();
      if (!snapshotCanvas) return;

      const stream = snapshotCanvas.captureStream(30);
      // Choose mime type based on selected mediaType, with graceful fallback if unsupported.
      let mimeType =
        mediaType === "mp4"
          ? "video/mp4; codecs=avc1.42E01E,mp4a.40.2"
          : "video/webm; codecs=vp9";
      if (typeof MediaRecorder !== "undefined") {
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          const fallbackWebm = "video/webm; codecs=vp9";
          const fallbackVp8 = "video/webm; codecs=vp8";
          if (MediaRecorder.isTypeSupported(fallbackWebm)) {
            mimeType = fallbackWebm;
          } else if (MediaRecorder.isTypeSupported(fallbackVp8)) {
            mimeType = fallbackVp8;
          } else {
            // Let browser choose; some environments ignore explicit mimeType anyway.
            mimeType = "";
          }
        }
      }
      const recorder =
        mimeType && typeof MediaRecorder !== "undefined"
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const updateCompositeFrame = () => {
        const nextFrame = buildCanvasSnapshot();
        if (!nextFrame) return;

        const ctx = snapshotCanvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
        ctx.drawImage(
          nextFrame,
          0,
          0,
          nextFrame.width,
          nextFrame.height,
          0,
          0,
          snapshotCanvas.width,
          snapshotCanvas.height,
        );
        drawExportWatermark(ctx, snapshotCanvas.width, snapshotCanvas.height);
      };

      const startedAt = performance.now();
      const tick = (now: number) => {
        if (now - startedAt >= durationMs) return;
        updateCompositeFrame();
        requestAnimationFrame(tick);
      };

      recorder.start();
      requestAnimationFrame(tick);

      // Schedule each chart to reveal and animate at its timeline startMs
      playbackTimersRef.current.forEach(clearTimeout);
      playbackTimersRef.current = [];
      setFadedOutChartIds(new Set());
      charts.forEach((chart, idx) => {
        const entity = chartEntities?.[chart.instanceId];
        const clip = entity?.timelineClip;
        const startMs = clip?.startMs ?? 0;
        const endMs = clip?.endMs ?? totalMs;
        const t = setTimeout(() => {
          setHiddenChartIds((prev) => {
            const next = new Set(prev);
            next.delete(chart.instanceId);
            return next;
          });
          setReanimateSignal({
            instanceId: chart.instanceId,
            key: Date.now() + idx,
          });
        }, startMs + idx * 2);
        playbackTimersRef.current.push(t);

        // Fade out after clip ends (included in video, no restore at the end)
        if (entity?.hideAfterAnimation) {
          const fadeTimer = setTimeout(() => {
            setFadedOutChartIds((prev) => new Set([...prev, chart.instanceId]));
          }, endMs + idx * 2);
          playbackTimersRef.current.push(fadeTimer);
        }
      });

      await new Promise<void>((resolve) => {
        recorder.onstop = () => {
          const ext = mediaType === "mp4" ? "mp4" : "webm";
          const type =
            mimeType || (ext === "mp4" ? "video/mp4" : "video/webm");
          const blob = new Blob(chunks, { type });
          downloadBlob(blob, `canvas-video.${ext}`);
          resolve();
        };
        setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
        }, durationMs);
      });
    } catch (err) {
      console.error("Canvas capture failed", err);
    } finally {
      setIsCapturingAll(false);
      // Restore faded-out charts on screen after the video has been saved
      // (this restoration is intentionally not part of the recorded video)
      setFadedOutChartIds(new Set());
    }
  };

  const handleDownloadAll = () => {
    const snapshotCanvas = buildCanvasSnapshot();
    if (!snapshotCanvas) return;

    const ctx = snapshotCanvas.getContext("2d");
    if (ctx) {
      drawExportWatermark(ctx, snapshotCanvas.width, snapshotCanvas.height);
    }
    const url = snapshotCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "canvas-image.png";
    link.click();
  };

  const handleExpandContainerToPanel = useCallback(() => {
    if (!isAuthenticated) {
      // open auth modal or show message
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;
    const parentWidth = parent?.clientWidth;
    if (!parentWidth) return;

    setContainerSize((prev) => ({
      width: parentWidth,
      height: prev.height,
    }));
  }, []);

  const handleAutofitContainer = useCallback(() => {
    if (charts.length === 0) return;

    const padding = 16;
    let maxRight = 0;
    let maxBottom = 0;

    charts.forEach((chart) => {
      const pos = chartPositionMap[chart.instanceId];
      const size = chartSizeMap[chart.instanceId] || defaultChartSize;
      if (!pos) return;
      maxRight = Math.max(maxRight, pos.x + size.width);
      maxBottom = Math.max(maxBottom, pos.y + size.height);
    });

    setContainerSize({
      width: maxRight + padding,
      height: maxBottom + padding,
    });
  }, [charts, chartPositionMap, chartSizeMap]);

  const handleAutoArrange = () => {
    const container = containerRef.current;
    if (!container || charts.length === 0) return;

    const orderedIds = chartStackOrder.length
      ? chartStackOrder.filter((id) => charts.some((c) => c.instanceId === id))
      : charts.map((c) => c.instanceId);

    const chartRects = new Map<string, { width: number; height: number }>();

    Array.from(container.children).forEach((child) => {
      const el = child as HTMLDivElement;
      const instanceId = el.dataset.instanceId;
      if (!instanceId) return;
      chartRects.set(instanceId, {
        width: el.offsetWidth || defaultChartSize.width,
        height: el.offsetHeight || defaultChartSize.height,
      });
    });

    const padding = 16;
    const gap = 16;
    const availableWidth = Math.max(320, container.clientWidth - padding * 2);

    let cursorX = padding;
    let cursorY = padding;
    let rowHeight = 0;
    const nextPositions: Record<string, { x: number; y: number }> = {};

    orderedIds.forEach((id) => {
      const rect = chartRects.get(id) || chartSizeMap[id] || defaultChartSize;

      if (
        cursorX > padding &&
        cursorX + rect.width > padding + availableWidth
      ) {
        cursorX = padding;
        cursorY += rowHeight + gap;
        rowHeight = 0;
      }

      nextPositions[id] = { x: cursorX, y: cursorY };
      cursorX += rect.width + gap;
      rowHeight = Math.max(rowHeight, rect.height);
    });

    mergeChartPositions(nextPositions);
  };

  const handleExpandChartToFullWidth = useCallback(
    (instanceId: string) => {
      const container = containerRef.current;
      if (!container || charts.length === 0) return;

      const orderedIds = chartStackOrder.length
        ? chartStackOrder.filter((id) =>
            charts.some((chart) => chart.instanceId === id),
          )
        : charts.map((chart) => chart.instanceId);

      const padding = 16;
      const gap = 16;
      const availableWidth = Math.max(320, container.clientWidth - padding * 2);
      const chartRects = new Map<string, { width: number; height: number }>();

      Array.from(container.children).forEach((child) => {
        const el = child as HTMLDivElement;
        const childInstanceId = el.dataset.instanceId;
        if (!childInstanceId) return;
        chartRects.set(childInstanceId, {
          width: el.offsetWidth || defaultChartSize.width,
          height: el.offsetHeight || defaultChartSize.height,
        });
      });

      const expandedRect =
        chartRects.get(instanceId) ||
        chartSizeMap[instanceId] ||
        defaultChartSize;
      let cursorX = padding;
      let cursorY = padding;
      let rowHeight = 0;
      const nextPositions: Record<string, { x: number; y: number }> = {};

      orderedIds.forEach((id) => {
        const rect =
          id === instanceId
            ? {
                width: availableWidth,
                height: expandedRect.height,
              }
            : chartRects.get(id) || chartSizeMap[id] || defaultChartSize;

        if (id === instanceId && cursorX > padding) {
          cursorX = padding;
          cursorY += rowHeight + gap;
          rowHeight = 0;
        }

        if (
          cursorX > padding &&
          cursorX + rect.width > padding + availableWidth
        ) {
          cursorX = padding;
          cursorY += rowHeight + gap;
          rowHeight = 0;
        }

        nextPositions[id] = { x: cursorX, y: cursorY };
        cursorX += rect.width + gap;
        rowHeight = Math.max(rowHeight, rect.height);
      });

      mergeChartSizes({
        [instanceId]: {
          width: availableWidth,
          height: expandedRect.height,
        },
      });
      mergeChartPositions(nextPositions);
      setSelectedChartInstanceId(instanceId);
    },
    [
      chartSizeMap,
      chartStackOrder,
      charts,
      mergeChartPositions,
      mergeChartSizes,
      setSelectedChartInstanceId,
    ],
  );

  const handleOpenImportDialog = (instanceId: string) => {
    setSelectedChartInstanceId(instanceId);
    setPendingImportChartInstanceId(instanceId);
    importInputRef.current?.click();
  };

  const handleImportSpreadsheet = async (
    file: File,
    targetChartInstanceId: string | null,
  ) => {
    if (!targetChartInstanceId) {
      window.alert("Select a chart first.");
      return;
    }

    const selected = charts.find(
      (chart) => chart.instanceId === targetChartInstanceId,
    );
    if (
      !selected ||
      (selected.type !== "line" &&
        selected.type !== "bar" &&
        selected.type !== "pie" &&
        selected.type !== "map")
    ) {
      window.alert(
        "Import is currently available only for line, bar, pie, and map charts.",
      );
      return;
    }

    try {
      const rows = await readSheetRowsFromFile(file);

      let nextData;
      if (selected.type === "map") {
        // Extract map name from file name (remove extension)
        let mapName = file.name.split(".")[0];
        // fallback to settings if file name is empty
        if (!mapName) {
          const mapSettings = chartSettingsMap[selected.instanceId] as
            | MapChartSettings
            | undefined;
          mapName = mapSettings?.mapName || "countries";
        }
        nextData = buildChartDataFromSheetRows(
          rows,
          "map",
          selected.instanceId,
          getThemeColor,
          undefined,
          mapName,
        );
      } else {
        nextData = buildChartDataFromSheetRows(
          rows,
          selected.type,
          selected.instanceId,
          getThemeColor,
          chartDataOrientationMap[selected.instanceId] || "columns-as-series",
        );
      }

      let hasImportedData = false;
      if (nextData?.type === "pie") {
        hasImportedData = nextData.data.length > 0;
      } else if (nextData?.type === "map") {
        hasImportedData =
          Array.isArray(nextData.series?.data) &&
          nextData.series.data.length > 0;
      } else {
        hasImportedData = Boolean(nextData && nextData.series.length > 0);
      }

      if (!nextData || !hasImportedData) {
        let message = "Could not map this file.";
        if (selected.type === "pie") {
          message =
            "Could not map this file. For pie charts, expected header row + at least one data row with label in the first column and numeric value in the second column.";
        } else if (selected.type === "map") {
          message =
            "Could not map this file. For map charts, expected header row + at least one data row with region name in the first column and numeric value in the second column.";
        } else {
          message =
            "Could not map this file. Expected header row + at least one data row with one x-axis column and one or more numeric series columns.";
        }
        window.alert(message);
        return;
      }

      updateChartData(selected.instanceId, nextData, { reanimate: true });
      const titleFromFile = fileNameStemForTitle(file.name);
      if (titleFromFile) {
        updateChartSettings(selected.instanceId, { title: titleFromFile });
      }
    } catch (error) {
      console.error("Failed to import spreadsheet", error);
      window.alert(
        "Import failed. Please check the file format and try again.",
      );
    }
  };

  const selectedChart = selectedChartInstanceId
    ? charts.find((chart) => chart.instanceId === selectedChartInstanceId) ||
      null
    : null;

  /** Draft from persisted store takes priority; falls back to committed local map, then stored entity. */
  const resolvedPanelChartData = useMemo((): ChartData | undefined => {
    if (!selectedChartInstanceId) return undefined;
    const entity = chartEntities?.[selectedChartInstanceId];
    const draft = entity?.draftChartData;
    const map = chartDataMap[selectedChartInstanceId];
    const stored = entity?.chartData;
    return (draft ?? map ?? stored) ?? undefined;
  }, [
    selectedChartInstanceId,
    chartDataMap,
    chartEntities,
  ]);

  const selectedChartDataOrientation = selectedChartInstanceId
    ? chartDataOrientationMap[selectedChartInstanceId] || "columns-as-series"
    : "columns-as-series";

  const transposeChartDataOrientation = useCallback(
    (data: ChartData, instanceId: string): ChartData => {
      if (data.type !== "line" && data.type !== "bar") return data;

      const oldCategories = data.categories;
      const oldSeries = data.series;
      const oldSeriesCount = oldSeries.length;
      const oldCategoryCount = oldCategories.length;

      if (oldSeriesCount === 0 || oldCategoryCount === 0) return data;

      const newCategories = oldSeries.map((series) => series.name);
      const newSeries = oldCategories.map((categoryLabel, categoryIndex) => ({
        id: `${instanceId}-series-${categoryIndex + 1}`,
        name: String(categoryLabel || `Series ${categoryIndex + 1}`),
        color: getThemeColor(categoryIndex),
        colorSource: "theme" as const,
        themeColorIndex: categoryIndex,
        values: oldSeries.map((series) => {
          const raw = series.values[categoryIndex];
          return Number.isFinite(raw) ? raw : 0;
        }),
      }));

      if (data.type === "line") {
        return {
          type: "line",
          categories: newCategories,
          series: newSeries,
        } satisfies LineChartData;
      }

      return {
        type: "bar",
        categories: newCategories,
        series: newSeries,
      } satisfies BarChartData;
    },
    [getThemeColor],
  );

  const handleChangeDataOrientation = useCallback(
    (orientation: DataOrientation) => {
      if (!selectedChartInstanceId) return;

      const currentOrientation =
        chartDataOrientationMap[selectedChartInstanceId] || "columns-as-series";
      if (currentOrientation === orientation) return;

      const currentData =
        chartDataMap[selectedChartInstanceId] ??
        chartEntities?.[selectedChartInstanceId]?.chartData ??
        undefined;
      if (
        currentData &&
        (currentData.type === "line" || currentData.type === "bar")
      ) {
        const nextData = transposeChartDataOrientation(
          currentData,
          selectedChartInstanceId,
        );
        updateChartData(selectedChartInstanceId, nextData, {
          reanimate: true,
        });
      }

      setChartDataOrientationMap((prev) => ({
        ...prev,
        [selectedChartInstanceId]: orientation,
      }));
    },
    [
      chartDataMap,
      chartEntities,
      chartDataOrientationMap,
      selectedChartInstanceId,
      transposeChartDataOrientation,
    ],
  );

  const dataPanelHeaderRight = (
    <div className="flex items-center gap-1">
      <Tooltip content="Export CSV">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!selectedChartInstanceId) return;
            const data = chartDataMap[selectedChartInstanceId];
            if (data) exportChartDataToCSV(data);
          }}
          data-no-panel-drag="true"
          aria-label="Export chart data as CSV"
          disabled={!selectedChartInstanceId}
        >
          Export
        </Button>
      </Tooltip>
      <Tooltip content="Discard unsaved changes">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!selectedChartInstanceId) return;
            clearChartDraftData(workspaceId, selectedChartInstanceId);
          }}
          data-no-panel-drag="true"
          aria-label="Discard changes"
          disabled={!selectedChartInstanceId || !chartEntities?.[selectedChartInstanceId]?.draftChartData}
        >
          Discard
        </Button>
      </Tooltip>
      <Tooltip content="Apply Changes">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!selectedChartInstanceId) return;
            const snapshotData = dataPanelApplyHandlerRef.current?.() ?? null;
            const draft = snapshotData ?? chartEntities?.[selectedChartInstanceId]?.draftChartData ?? null;
            if (draft) {
              updateChartData(selectedChartInstanceId, draft, { reanimate: true });
            } else {
              setReanimateSignal({ instanceId: selectedChartInstanceId, key: Date.now() });
            }
          }}
          data-no-panel-drag="true"
          aria-label="Apply chart data"
          disabled={!selectedChartInstanceId || !chartEntities?.[selectedChartInstanceId]?.draftChartData}
        >
          Apply
        </Button>
      </Tooltip>
      <Tooltip content={dataPanelMode === "fixed-up" ? "Move down" : "Move up"}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() =>
            setDataPanelMode((prev) => {
              if (prev === "fixed-up") return "grid";
              setDataPanelTop(clampDataPanelTop(DATA_PANEL_FIXED_TOP));
              return "fixed-up";
            })
          }
          data-no-panel-drag="true"
          aria-label={dataPanelMode === "fixed-up" ? "Move data panel down" : "Move data panel up"}
        >
          <HugeiconsIcon
            icon={dataPanelMode === "fixed-up" ? ArrowDown01Icon : ArrowUp01Icon}
            size={16}
          />
        </Button>
      </Tooltip>
    </div>
  );

  // List of available maps (from assets/maps)
  const availableMaps: Record<string, string>[] = [
    { name: "Iceland", value: "iceland" },
    { name: "USA", value: "usa" },
    { name: "Turkiye", value: "turkiye" },
    { name: "Africa", value: "africa" },
    // { name: "Continents", value: "contitents" },
    { name: "Countries", value: "countries" },
    // { name: "Russia", value: "russia" },
    { name: "Europe", value: "europe" },
    { name: "European Union", value: "european-union" },
    // { name: "South America", value: "southameriaca" },
  ];

  const handleMapNameChange = async (mapName: string) => {
    // When map changes, update draft data with new regions, but do not commit until Apply is clicked

    if (!selectedChartInstanceId) return;
    const current =
      (chartEntities?.[selectedChartInstanceId]?.draftChartData as MapChartData) ||
      (chartDataMap[selectedChartInstanceId] as MapChartData) ||
      (chartEntities?.[selectedChartInstanceId]?.chartData as MapChartData | undefined);
    if (current && current.mapName !== mapName) {
      // Dynamically import getMapData
      const { getMapData } = await import("./mapChartOptions");
      const regions = await getMapData(mapName);
      // Optionally, preserve values for matching regions
      const prevData = current.series?.data || [];
      const mergedRegions = regions.map((region) => {
        const prev = prevData.find((r) => r.name === region.name);
        return prev ? { ...region, value: prev.value } : region;
      });
      updateChartDataDraft(selectedChartInstanceId, {
        ...current,
        mapName,
        series: { data: mergedRegions },
      });
    }
  };

  const dataPanelBody = (
    <>
      {!selectedChart && (
        <p className="text-sm text-gray-600">
          Select a chart to edit its data.
        </p>
      )}

      {selectedChart?.type === "line" && selectedChartInstanceId && (
        <LineChartDataPanel
          data={
            resolvedPanelChartData?.type === "line"
              ? resolvedPanelChartData
              : undefined
          }
          onChange={(nextData) =>
            updateChartDataDraft(selectedChartInstanceId, nextData)
          }
          registerApplyHandler={(handler) => {
            dataPanelApplyHandlerRef.current = handler;
          }}
          themeColors={activeThemeColors}
        />
      )}

      {selectedChart?.type === "bar" && selectedChartInstanceId && (
        <BarChartDataPanel
          data={
            resolvedPanelChartData?.type === "bar"
              ? resolvedPanelChartData
              : undefined
          }
          onChange={(nextData) =>
            updateChartDataDraft(selectedChartInstanceId, nextData)
          }
          registerApplyHandler={(handler) => {
            dataPanelApplyHandlerRef.current = handler;
          }}
          themeColors={activeThemeColors}
        />
      )}

      {selectedChart?.type === "pie" && selectedChartInstanceId && (
        <PieChartDataPanel
          data={
            resolvedPanelChartData?.type === "pie"
              ? resolvedPanelChartData
              : undefined
          }
          onChange={(nextData) =>
            updateChartDataDraft(selectedChartInstanceId, nextData)
          }
          registerApplyHandler={(handler) => {
            dataPanelApplyHandlerRef.current = handler;
          }}
        />
      )}

      {selectedChart?.type === "map" && selectedChartInstanceId && (
        <MapChartDataPanel
          data={
            resolvedPanelChartData?.type === "map"
              ? resolvedPanelChartData
              : undefined
          }
          onChange={(nextData) => {
            updateChartDataDraft(selectedChartInstanceId, nextData);
          }}
          onMapNameChange={handleMapNameChange}
          registerApplyHandler={(handler) => {
            dataPanelApplyHandlerRef.current = handler;
          }}
          availableMaps={availableMaps}
        />
      )}

      {selectedChart &&
        selectedChart.type !== "line" &&
        selectedChart.type !== "bar" &&
        selectedChart.type !== "pie" &&
        selectedChart.type !== "map" && (
          <p className="text-sm text-gray-600">
            Data editing for {selectedChart.type} charts is not implemented yet.
          </p>
        )}
    </>
  );

  return (
    <div
      ref={workspaceRef}
      className="chart-workspace grid grid-cols-1 md:grid-cols-[80%_1fr] gap-2"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        ref={importInputRef}
        type="file"
        accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={async (e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = "";
          if (!file) return;
          const targetChartInstanceId =
            pendingImportChartInstanceId || selectedChartInstanceId;
          setPendingImportChartInstanceId(null);
          await handleImportSpreadsheet(file, targetChartInstanceId);
        }}
      />

      {isMobileMode && pendingMobileChartType && (
        <div className="fixed top-2 left-1/2 z-10001 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-primary bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg">
            <span>
              Tap canvas to place {pendingMobileChartType} chart or cancel
              with{" "}
            </span>
            <button
              type="button"
              onClick={onCancelMobileChartPlacement}
              className="rounded-full bg-background px-2 py-1 text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Tabs
        defaultValue="workspace"
        className="relative z-10 gap-0"
        onValueChange={(v) => setActiveCanvasTab(v as "workspace" | "timeline")}
      >
        <PanelView
          title={
            <TabsList className="h-auto gap-1 bg-transparent p-0">
              <TabsTrigger
                value="workspace"
                className="h-6 flex-none rounded-t-md rounded-b-none border-b-0 px-3 py-0 focus-visible:ring-0"
              >
                {activeWorkspaceName}
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="h-6 flex-none rounded-t-md rounded-b-none border-b-0 px-3 py-0 focus-visible:ring-0"
              >
                Animation Timeline
              </TabsTrigger>
            </TabsList>
          }
          headerClassName="pb-0!"
          titleClassName="self-end"
          bodyClassName="p-0 overflow-hidden"
          onClick={() => setSelectedChartInstanceId(null)}
          headerRight={activeCanvasTab === "workspace" && (
            <CanvasContextMenu
              id="canvas-context-menu"
              onRemoveAll={requestRemoveAll}
              onCaptureAll={handleCaptureAll}
              onRefreshAll={handleRefreshAll}
              onDownloadAll={handleDownloadAll}
              onAutoArrange={handleAutoArrange}
              onExpandContainerToPanel={handleExpandContainerToPanel}
              onAutofitContainer={handleAutofitContainer}
              isCapturing={isCapturingAll}
            />)
          }
        >
          <TabsContent
            value="workspace"
            forceMount
            className="mt-0 data-[state=inactive]:invisible data-[state=inactive]:h-0 data-[state=inactive]:overflow-hidden"
          >
            <div
              id="chart-canvas"
              ref={containerRef}
              className="relative resize overflow-auto p-1 border border-border rounded-md bg-white/50 shadow-lg canvas-grid"
              style={{
                width: `${containerSize.width}px`,
                height: `${containerSize.height}px`,
                backgroundColor: canvasSettings.backgroundColor,
                isolation: "isolate",
                containerType: "size",
                cursor:
                  isMobileMode && pendingMobileChartType
                    ? "crosshair"
                    : "default",
              }}
              onClick={onCanvasClick}
            >
              {/* Animation progress bar — spans the top of the canvas for the clip duration */}
              {animBarKey > 0 && (
                <div className="absolute top-0 left-1 right-1 z-50 pointer-events-none">
                  <div
                    key={animBarKey}
                    className="h-0.5 rounded-full bg-rose-500"
                    style={{
                      width: "0%",
                      animation: `anim-bar-grow ${animBarDurationMs}ms linear forwards`,
                    }}
                  />
                </div>
              )}
              {orderedCharts.map((c) => {
                const entity = chartEntities?.[c.instanceId];
                const clip =
                  entity?.timelineClip ?? {
                    startMs: 0,
                    endMs: Math.min(4000, canvasSettings.timelineTotalMs),
                  };

                return (
                  <ChartItem
                    key={c.id}
                    data={c}
                    reanimateSignal={reanimateSignal}
                    settings={getChartSettings(c.instanceId, c.type)}
                    timelineClip={clip}
                    isHidden={hiddenChartIds.has(c.instanceId)}
                    isFadedOut={fadedOutChartIds.has(c.instanceId)}
                    chartData={chartDataMap[c.instanceId]}
                    onSelectChart={onSelectChart}
                    position={chartPositionMap[c.instanceId] || { x: 20, y: 20 }}
                    size={chartSizeMap[c.instanceId] || defaultChartSize}
                    onMove={moveChart}
                    onResize={resizeChart}
                    zIndex={
                      selectedChartInstanceId === c.instanceId
                        ? CHART_Z_INDEX_SELECTED
                        : Math.min(
                            CHART_Z_INDEX_MAX,
                            Math.max(
                              1,
                              chartStackOrder.indexOf(c.instanceId) + 1,
                            ),
                          )
                    }
                    onExpandToFullWidth={() =>
                      handleExpandChartToFullWidth(c.instanceId)
                    }
                    onMoveToTop={() => moveChartToTop(c.instanceId)}
                    onMoveUp={() => moveChartForward(c.instanceId)}
                  onMoveDown={() => moveChartBackward(c.instanceId)}
                  onMoveToBottom={() => moveChartToBottom(c.instanceId)}
                  isSelected={selectedChartInstanceId === c.instanceId}
                  onRequestRemoveChart={requestRemoveChart}
                  onImportData={handleOpenImportDialog}
                  mediaType={mediaType}
                  theme={workspaceTheme || undefined}
                  annotations={
                    chartEntities?.[c.instanceId]?.annotations ??
                    EMPTY_ANNOTATIONS
                  }
                  onAnnotationsChange={(nextAnnotations) =>
                    upsertAnnotations(
                      workspaceId,
                      c.instanceId,
                      nextAnnotations,
                    )
                  }
                />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent
            value="timeline"
            forceMount
            className="mt-0 data-[state=inactive]:hidden"
          >
            <AnimationTimeline />
          </TabsContent>
        </PanelView>
      </Tabs>

      <Modal
        isOpen={pendingRemoval !== null}
        onClose={() => setPendingRemoval(null)}
      >
        <div>
          <h3 className="mb-3 text-lg font-semibold text-foreground">
            Confirm removal
          </h3>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove the selected chart(s)?
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPendingRemoval(null)}
            >
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={confirmRemoval}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>

      <PanelView title="Settings" className="relative z-20" bodyClassName="p-1">
        {selectedChartInstanceId ? (
          <ChartSettingsPanel
            animationDuration={
              getChartSettings(selectedChartInstanceId, selectedChart?.type).animationDuration
            }
            setAnimationDuration={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                animationDuration: value,
              })
            }
            fontFamily={getChartSettings(selectedChartInstanceId, selectedChart?.type).fontFamily}
            setFontFamily={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                fontFamily: value,
              })
            }
            fontSize={getChartSettings(selectedChartInstanceId, selectedChart?.type).fontSize}
            setFontSize={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                fontSize: value,
              })
            }
            titleFontColor={
              getChartSettings(selectedChartInstanceId, selectedChart?.type).titleFontColor
            }
            setTitleFontColor={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                titleFontColor: value,
              })
            }
            mediaType={mediaType}
            setMediaType={setMediaType}
            backgroundColor={
              getChartSettings(selectedChartInstanceId, selectedChart?.type).backgroundColor
            }
            setBackgroundColor={(color) =>
              updateChartSettings(selectedChartInstanceId, {
                backgroundColor: color,
              })
            }
            title={getChartSettings(selectedChartInstanceId, selectedChart?.type).title}
            setTitle={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                title: value,
              })
            }
            showLegend={getChartSettings(selectedChartInstanceId, selectedChart?.type).showLegend}
            setShowLegend={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                showLegend: value,
              })
            }
            legendTop={getChartSettings(selectedChartInstanceId, selectedChart?.type).legendTop}
            setLegendTop={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                legendTop: value,
              })
            }
            legendLeft={getChartSettings(selectedChartInstanceId, selectedChart?.type).legendLeft}
            setLegendLeft={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                legendLeft: value,
              })
            }
            legendOrient={
              getChartSettings(selectedChartInstanceId, selectedChart?.type).legendOrient
            }
            setLegendOrient={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                legendOrient: value,
              })
            }
            barShowBackground={(() => {
              const settings = getChartSettings(selectedChartInstanceId, selectedChart?.type);
              return "barShowBackground" in settings
                ? settings.barShowBackground
                : undefined;
            })()}
            setBarShowBackground={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                barShowBackground: value,
              })
            }
            barBackgroundColor={(() => {
              const settings = getChartSettings(selectedChartInstanceId, selectedChart?.type);
              return "barBackgroundColor" in settings
                ? settings.barBackgroundColor
                : undefined;
            })()}
            setBarBackgroundColor={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                barBackgroundColor: value,
              })
            }
            barAxisOrientation={(() => {
              const settings = getChartSettings(selectedChartInstanceId, selectedChart?.type);
              return "barAxisOrientation" in settings
                ? settings.barAxisOrientation
                : undefined;
            })()}
            setBarAxisOrientation={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                barAxisOrientation: value,
              })
            }
            barStackEnabled={(() => {
              const settings = getChartSettings(selectedChartInstanceId, selectedChart?.type);
              return "barStackEnabled" in settings
                ? settings.barStackEnabled
                : undefined;
            })()}
            setBarStackEnabled={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                barStackEnabled: value,
              })
            }
            barSketchEnabled={(() => {
              const settings = getChartSettings(
                selectedChartInstanceId,
                selectedChart?.type,
              );
              return "barSketchEnabled" in settings
                ? Boolean((settings as BarChartSettings).barSketchEnabled)
                : false;
            })()}
            setBarSketchEnabled={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                barSketchEnabled: value,
              })
            }
            barSketchIntensity={resolveSketchIntensity(
              getChartSettings(
                selectedChartInstanceId,
                selectedChart?.type,
              ) as BarChartSettings,
            )}
            setBarSketchIntensity={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                barSketchIntensity: Math.min(100, Math.max(0, value)),
              })
            }
            lineShowLabels={(() => {
              const settings = getChartSettings(selectedChartInstanceId, selectedChart?.type);
              return "lineShowLabels" in settings
                ? settings.lineShowLabels
                : undefined;
            })()}
            setLineShowLabels={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                lineShowLabels: value,
              })
            }
            lineSmooth={(() => {
              const settings = getChartSettings(selectedChartInstanceId, selectedChart?.type);
              return "lineSmooth" in settings ? settings.lineSmooth : undefined;
            })()}
            setLineSmooth={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                lineSmooth: value,
              })
            }
            lineStep={(() => {
              const settings = getChartSettings(selectedChartInstanceId, selectedChart?.type);
              return "lineStep" in settings ? settings.lineStep : undefined;
            })()}
            setLineStep={(value) =>
              updateChartSettings(selectedChartInstanceId, { lineStep: value })
            }
            lineArea={(() => {
              const settings = getChartSettings(selectedChartInstanceId, selectedChart?.type);
              return "lineArea" in settings ? settings.lineArea : undefined;
            })()}
            setLineArea={(value) =>
              updateChartSettings(selectedChartInstanceId, { lineArea: value })
            }
            lineStack={(() => {
              const settings = getChartSettings(selectedChartInstanceId, selectedChart?.type);
              return "lineStack" in settings ? (settings as any).lineStack : undefined;
            })()}
            setLineStack={(value) =>
              updateChartSettings(selectedChartInstanceId, { lineStack: value })
            }
            lineSymbol={(() => {
              const settings = getChartSettings(selectedChartInstanceId, selectedChart?.type);
              return "lineSymbol" in settings ? (settings as any).lineSymbol : undefined;
            })()}
            setLineSymbol={(value) =>
              updateChartSettings(selectedChartInstanceId, { lineSymbol: value })
            }
            lineSymbolSize={(() => {
              const settings = getChartSettings(selectedChartInstanceId, selectedChart?.type);
              return "lineSymbolSize" in settings ? (settings as any).lineSymbolSize : undefined;
            })()}
            setLineSymbolSize={(value) =>
              updateChartSettings(selectedChartInstanceId, { lineSymbolSize: value })
            }
            lineSketchEnabled={(() => {
              const settings = getChartSettings(
                selectedChartInstanceId,
                selectedChart?.type,
              );
              return "lineSketchEnabled" in settings
                ? Boolean((settings as LineChartSettings).lineSketchEnabled)
                : false;
            })()}
            setLineSketchEnabled={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                lineSketchEnabled: value,
              })
            }
            lineSketchIntensity={resolveLineSketchIntensity(
              getChartSettings(
                selectedChartInstanceId,
                selectedChart?.type,
              ) as LineChartSettings,
            )}
            setLineSketchIntensity={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                lineSketchIntensity: Math.min(100, Math.max(0, value)),
              })
            }
            sketchTypographyPreset={(() => {
              const settings = getChartSettings(
                selectedChartInstanceId,
                selectedChart?.type,
              );
              const p =
                "sketchTypographyPreset" in settings
                  ? settings.sketchTypographyPreset
                  : undefined;
              return (p ?? "indie-flower") as SketchTypographyPresetId;
            })()}
            setSketchTypographyPreset={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                sketchTypographyPreset: value,
              })
            }
            selectedChartType={
              charts.find((c) => c.instanceId === selectedChartInstanceId)?.type
            }
            dataOrientation={selectedChartDataOrientation}
            setDataOrientation={handleChangeDataOrientation}
            pieSettings={getPieChartSettings(selectedChartInstanceId)}
            setPieSettings={(updates) =>
              updateChartSettings(selectedChartInstanceId, updates)
            }
            mapSettings={getMapChartSettings(selectedChartInstanceId)}
            setMapSettings={(updates) =>
              updateChartSettings(selectedChartInstanceId, updates)
            }
          />
        ) : (
          <ChartSettingsPanel
            animationDuration={canvasSettings.animationDuration}
            setAnimationDuration={(value) =>
              setCanvasSettings((prev) => ({
                ...prev,
                animationDuration: value,
              }))
            }
            fontFamily={canvasSettings.fontFamily}
            setFontFamily={(value) => {
              setCanvasSettings((prev) => ({ ...prev, fontFamily: value }));
              setChartSettingsMap((prev) => {
                const next: Record<
                  string,
                  | LineChartSettings
                  | BarChartSettings
                  | PieChartSettings
                  | MapChartSettings
                > = {};
                Object.entries(prev).forEach(([instanceId, settings]) => {
                  next[instanceId] = { ...settings, fontFamily: value };
                });
                return next;
              });
            }}
            fontSize={canvasSettings.fontSize}
            setFontSize={(value) => {
              setCanvasSettings((prev) => ({ ...prev, fontSize: value }));
              setChartSettingsMap((prev) => {
                const next: Record<
                  string,
                  | LineChartSettings
                  | BarChartSettings
                  | PieChartSettings
                  | MapChartSettings
                > = {};
                Object.entries(prev).forEach(([instanceId, settings]) => {
                  next[instanceId] = { ...settings, fontSize: value };
                });
                return next;
              });
            }}
            titleFontColor={canvasSettings.titleFontColor}
            setTitleFontColor={(value) => {
              setCanvasSettings((prev) => ({ ...prev, titleFontColor: value }));
              setChartSettingsMap((prev) => {
                const next: Record<
                  string,
                  | LineChartSettings
                  | BarChartSettings
                  | PieChartSettings
                  | MapChartSettings
                > = {};
                Object.entries(prev).forEach(([instanceId, settings]) => {
                  next[instanceId] = { ...settings, titleFontColor: value };
                });
                return next;
              });
            }}
            mediaType={mediaType}
            setMediaType={setMediaType}
            backgroundColor={canvasSettings.backgroundColor}
            setBackgroundColor={(color) =>
              setCanvasSettings((prev) => ({ ...prev, backgroundColor: color }))
            }
            title={canvasSettings.title}
            setTitle={(value) =>
              setCanvasSettings((prev) => ({ ...prev, title: value }))
            }
            workspaceTheme={workspaceTheme}
            setWorkspaceTheme={setWorkspaceTheme}
            onApplyThemeColorsToAll={applyThemeColorsToAllCharts}
          />
        )}
      </PanelView>

      {dataPanelMode === "grid" && (
        <div ref={gridDataPanelRef} className="md:col-span-2 relative z-30">
          <PanelView
            title={
              <span className="flex items-center gap-2">
                Chart Data
                {selectedChartInstanceId && !!chartEntities?.[selectedChartInstanceId]?.draftChartData && (
                  <span className="text-[10px] font-medium text-amber-600 normal-case tracking-normal">• unsaved</span>
                )}
              </span>
            }
            headerRight={dataPanelHeaderRight}
            onHeaderMouseDown={handleDataPanelHeaderMouseDown}
            bodyClassName="p-2"
          >
            {dataPanelBody}
          </PanelView>
        </div>
      )}

      {dataPanelMode === "fixed-up" && (
        <PanelView
          title={
            <span className="flex items-center gap-2">
              Chart Data
              {selectedChartInstanceId && !!chartEntities?.[selectedChartInstanceId]?.draftChartData && (
                <span className="text-[10px] font-medium text-amber-600 normal-case tracking-normal">• unsaved</span>
              )}
            </span>
          }
          className="fixed bottom-0 z-9000"
          bodyClassName="h-[calc(100%-2.5rem)] overflow-y-auto"
          style={{
            top: `${dataPanelTop}px`,
            left: `${fixedPanelBounds.left}px`,
            width: `${fixedPanelBounds.width}px`,
          }}
          headerRight={dataPanelHeaderRight}
          onHeaderMouseDown={handleDataPanelHeaderMouseDown}
        >
          {dataPanelBody}
        </PanelView>
      )}
    </div>
  );
};
