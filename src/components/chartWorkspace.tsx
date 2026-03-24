import React, { useCallback, useEffect, useRef, useState } from "react";
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
} from "./chartTypes";

const defaultChartSize = {
  width: 400,
  height: 300,
};

const defaultContainerSize = {
  width: 800,
  height: 600,
};

const DATA_PANEL_FIXED_TOP = 120;
const DATA_PANEL_HEADER_HEIGHT = 40;
const CHART_Z_INDEX_MAX = 90;
const CHART_Z_INDEX_SELECTED = 95;

export const ChartWorkspace: React.FC<{
  charts: ChartItemData[];
  addChart: (type: string, initialPosition?: { x: number; y: number }) => void;
  removeChart: (id: number) => void;
  isMobileMode: boolean;
  pendingMobileChartType: string | null;
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
}) => {
  const [pendingRemoval, setPendingRemoval] = useState<
    { mode: "single"; chartId: number } | { mode: "all" } | null
  >(null);
  const [chartPositionMap, setChartPositionMap] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [chartSizeMap, setChartSizeMap] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const [chartStackOrder, setChartStackOrder] = useState<string[]>([]);
  const [chartDataMap, setChartDataMap] = useState<Record<string, ChartData>>(
    {},
  );
  const [chartDataDraftMap, setChartDataDraftMap] = useState<
    Record<string, ChartData>
  >({});
  const [chartDataDraftDirtyMap, setChartDataDraftDirtyMap] = useState<
    Record<string, boolean>
  >({});
  const [chartSettingsMap, setChartSettingsMap] = useState<
    Record<
      string,
      LineChartSettings | BarChartSettings | PieChartSettings | MapChartSettings
    >
  >({});
  const [mediaType, setMediaType] = useState<string>("webm");
  const [reanimateSignal, setReanimateSignal] =
    useState<ReanimateSignal | null>(null);
  const [reanimateAllKey, setReanimateAllKey] = useState<number>(0);
  const [isCapturingAll, setIsCapturingAll] = useState(false);
  const [containerSize, setContainerSize] = useState(defaultContainerSize);
  const [selectedChartInstanceId, setSelectedChartInstanceId] = useState<
    string | null
  >(null);
  const [dataPanelMode, setDataPanelMode] = useState<"grid" | "fixed-up">(
    "grid",
  );
  const [fixedPanelBounds, setFixedPanelBounds] = useState({
    left: 0,
    width: 0,
  });
  const [dataPanelTop, setDataPanelTop] =
    useState<number>(DATA_PANEL_FIXED_TOP);
  const [canvasSettings, setCanvasSettings] = useState({
    animationDuration: 1000,
    backgroundColor: "#ffffff",
    title: "Workspace",
    fontFamily: "Noto Sans",
    fontSize: 12,
  });
  const [workspaceTheme, setWorkspaceTheme] = useState<string>("");
  const [chartDataOrientationMap, setChartDataOrientationMap] = useState<
    Record<string, DataOrientation>
  >({});
  const [pieSettingsMap, setPieSettingsMap] = useState<
    Record<string, PieChartSettings>
  >({});

  const [mapSettingsMap, setMapSettingsMap] = useState<
    Record<string, MapChartSettings>
  >({});

  const [pendingImportChartInstanceId, setPendingImportChartInstanceId] =
    useState<string | null>(null);
  const dataPanelApplyHandlerRef = useRef<(() => ChartData) | null>(null);
  const activeThemeColors = getThemePalette(workspaceTheme);

  const commitChartData = (instanceId: string, nextData: ChartData) => {
    setChartDataMap((prev) => ({
      ...prev,
      [instanceId]: nextData,
    }));
    setChartDataDraftMap((prev) => ({
      ...prev,
      [instanceId]: nextData,
    }));
    setChartDataDraftDirtyMap((prev) => ({
      ...prev,
      [instanceId]: false,
    }));
  };

  const updateChartDataDraft = (instanceId: string, nextData: ChartData) => {
    setChartDataDraftMap((prev) => ({
      ...prev,
      [instanceId]: nextData,
    }));
    setChartDataDraftDirtyMap((prev) => ({
      ...prev,
      [instanceId]: true,
    }));
  };

  const getThemeColor = useCallback(
    (index: number) => activeThemeColors[index % activeThemeColors.length],
    [activeThemeColors],
  );

  const initializeChartSettings = (instanceId: string, type: string) => {
    const templateOptions: any = getOptionsByType(type);
    setChartSettingsMap((prev) => ({
      ...prev,
      [instanceId]: {
        animationDuration: templateOptions.animationDuration || 1000,
        backgroundColor: "#ffffff",
        title: templateOptions?.title?.text || "",
        fontFamily: canvasSettings.fontFamily,
        fontSize: canvasSettings.fontSize,
        showLegend: true,
        legendTop: "bottom",
        legendLeft: "center",
        legendOrient: "horizontal",
        barShowBackground: false,
        barBackgroundColor: "#f3f4f6",
        barAxisOrientation: "vertical",
        barStackEnabled: false,
        lineShowLabels: false,
        lineSmooth: false,
        lineStep: false,
        lineArea: false,
      },
    }));
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
      const nextData: MapChartData & {
        series: { data: { name: string; value: number }[] };
      } = {
        type: "map",
        mapName: "countries",
        series: { data: [] },
      };

      commitChartData(instanceId, nextData);
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
    updates: Partial<LineChartSettings & BarChartSettings & PieChartSettings>,
  ) => {
    setChartSettingsMap((prev) => {
      const current = prev[instanceId] || defaultLineChartSettings;
      const next = { ...current, ...updates };

      const animationChanged =
        typeof updates.animationDuration === "number" &&
        updates.animationDuration !== current.animationDuration;
      const backgroundChanged =
        typeof updates.backgroundColor === "string" &&
        updates.backgroundColor !== current.backgroundColor;
      const titleChanged =
        typeof updates.title === "string" && updates.title !== current.title;
      const fontFamilyChanged =
        typeof updates.fontFamily === "string" &&
        updates.fontFamily !== current.fontFamily;
      const fontSizeChanged =
        typeof updates.fontSize === "number" &&
        updates.fontSize !== current.fontSize;
      const showLegendChanged =
        typeof updates.showLegend === "boolean" &&
        updates.showLegend !== current.showLegend;
      const legendTopChanged =
        typeof updates.legendTop === "string" &&
        updates.legendTop !== current.legendTop;
      const legendLeftChanged =
        typeof updates.legendLeft === "string" &&
        updates.legendLeft !== current.legendLeft;
      const legendOrientChanged =
        typeof updates.legendOrient === "string" &&
        updates.legendOrient !== current.legendOrient;
      const barShowBackgroundChanged =
        "barShowBackground" in current &&
        typeof updates.barShowBackground === "boolean" &&
        updates.barShowBackground !== current.barShowBackground;
      const barBackgroundColorChanged =
        "barBackgroundColor" in current &&
        typeof updates.barBackgroundColor === "string" &&
        updates.barBackgroundColor !== current.barBackgroundColor;
      const barAxisOrientationChanged =
        "barAxisOrientation" in current &&
        typeof updates.barAxisOrientation === "string" &&
        updates.barAxisOrientation !== current.barAxisOrientation;
      const barStackEnabledChanged =
        "barStackEnabled" in current &&
        typeof updates.barStackEnabled === "boolean" &&
        updates.barStackEnabled !== current.barStackEnabled;
      const lineShowLabelsChanged =
        "lineShowLabels" in current &&
        typeof updates.lineShowLabels === "boolean" &&
        updates.lineShowLabels !== current.lineShowLabels;
      const lineSmoothChanged =
        "lineSmooth" in current &&
        typeof updates.lineSmooth === "boolean" &&
        updates.lineSmooth !== current.lineSmooth;
      const lineStepChanged =
        "lineStep" in current &&
        typeof updates.lineStep === "boolean" &&
        updates.lineStep !== current.lineStep;
      const lineAreaChanged =
        "lineArea" in current &&
        typeof updates.lineArea === "boolean" &&
        updates.lineArea !== current.lineArea;

      if (
        !animationChanged &&
        !backgroundChanged &&
        !titleChanged &&
        !fontFamilyChanged &&
        !fontSizeChanged &&
        !showLegendChanged &&
        !legendTopChanged &&
        !legendLeftChanged &&
        !legendOrientChanged &&
        !barShowBackgroundChanged &&
        !barBackgroundColorChanged &&
        !barAxisOrientationChanged &&
        !barStackEnabledChanged &&
        !lineShowLabelsChanged &&
        !lineSmoothChanged &&
        !lineStepChanged &&
        !lineAreaChanged
      ) {
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
    const settings = chartSettingsMap[instanceId];
    if (settings) return settings;
    if (type === "pie") return defaultPieChartSettings;
    if (type === "bar") return defaultBarChartSettings;
    if (type === "line") return defaultLineChartSettings;
    if (type === "map") return defaultMapChartSettings;
    return defaultLineChartSettings; // fallback
  };

  const getPieSettings = (instanceId: string): PieChartSettings =>
    pieSettingsMap[instanceId] ?? defaultPieChartSettings;

  const updatePieSettings = (
    instanceId: string,
    updates: Partial<PieChartSettings>,
  ) => {
    setPieSettingsMap((prev) => ({
      ...prev,
      [instanceId]: {
        ...(prev[instanceId] ?? defaultPieChartSettings),
        ...updates,
      },
    }));
  };

  const getMapSettings = (instanceId: string): MapChartSettings =>
    mapSettingsMap[instanceId] ?? defaultMapChartSettings;

  const updateMapSettings = (
    instanceId: string,
    updates: Partial<MapChartSettings>,
  ) => {
    setMapSettingsMap((prev) => ({
      ...prev,
      [instanceId]: {
        ...(prev[instanceId] ?? defaultMapChartSettings),
        ...updates,
      },
    }));
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
    charts.forEach((chart) => {
      if (!chartSettingsMap[chart.instanceId]) {
        initializeChartSettings(chart.instanceId, chart.type);
      }
      if (
        (chart.type === "line" ||
          chart.type === "bar" ||
          chart.type === "pie" ||
          chart.type === "map") &&
        !chartDataMap[chart.instanceId]
      ) {
        initializeChartData(chart.instanceId, chart.type);
      }
      if (chart.type === "pie" && !pieSettingsMap[chart.instanceId]) {
        setPieSettingsMap((prev) => ({
          ...prev,
          [chart.instanceId]: defaultPieChartSettings,
        }));
      }
    });
  }, [charts, chartSettingsMap, chartDataMap, pieSettingsMap]);

  useEffect(() => {
    setChartPositionMap((prev) => {
      const next: Record<string, { x: number; y: number }> = {};
      let changed = false;

      charts.forEach((chart, index) => {
        const existing = prev[chart.instanceId];
        if (existing) {
          next[chart.instanceId] = existing;
          return;
        }

        changed = true;
        if (chart.initialPosition) {
          next[chart.instanceId] = chart.initialPosition;
          return;
        }
        const offsetX = 20 + (index % 5) * 36;
        const offsetY = 20 + Math.floor(index / 5) * 36;
        next[chart.instanceId] = { x: offsetX, y: offsetY };
      });

      if (Object.keys(prev).length !== charts.length) changed = true;
      return changed ? next : prev;
    });
  }, [charts]);

  useEffect(() => {
    setChartSizeMap((prev) => {
      const next: Record<string, { width: number; height: number }> = {};
      let changed = false;

      charts.forEach((chart) => {
        const existing = prev[chart.instanceId];
        if (existing) {
          next[chart.instanceId] = existing;
          return;
        }

        changed = true;
        next[chart.instanceId] = defaultChartSize;
      });

      if (Object.keys(prev).length !== charts.length) changed = true;
      return changed ? next : prev;
    });
  }, [charts]);

  useEffect(() => {
    setChartStackOrder((prev) => {
      const activeIds = charts.map((chart) => chart.instanceId);
      const filtered = prev.filter((id) => activeIds.includes(id));
      const existing = new Set(filtered);
      const missing = activeIds.filter((id) => !existing.has(id));
      const next = [...filtered, ...missing];
      const unchanged =
        prev.length === next.length &&
        prev.every((value, index) => value === next[index]);
      return unchanged ? prev : next;
    });
  }, [charts]);

  const onSelectChart = useCallback((instanceId: string) => {
    setSelectedChartInstanceId(instanceId);
  }, []);

  const onMoveChart = useCallback(
    (instanceId: string, x: number, y: number) => {
      setChartPositionMap((prev) => {
        const current = prev[instanceId];
        if (current && current.x === x && current.y === y) return prev;
        return { ...prev, [instanceId]: { x, y } };
      });
    },
    [],
  );

  const onResizeChart = useCallback(
    (instanceId: string, width: number, height: number) => {
      setChartSizeMap((prev) => {
        const current = prev[instanceId];
        if (current && current.width === width && current.height === height) {
          return prev;
        }
        return { ...prev, [instanceId]: { width, height } };
      });
    },
    [],
  );

  const moveChartToTop = useCallback((instanceId: string) => {
    setChartStackOrder((prev) => {
      const index = prev.indexOf(instanceId);
      if (index < 0 || index === prev.length - 1) return prev;
      const next = prev.filter((id) => id !== instanceId);
      next.push(instanceId);
      return next;
    });
  }, []);

  const moveChartToBottom = useCallback((instanceId: string) => {
    setChartStackOrder((prev) => {
      const index = prev.indexOf(instanceId);
      if (index <= 0) return prev;
      const next = prev.filter((id) => id !== instanceId);
      next.unshift(instanceId);
      return next;
    });
  }, []);

  const moveChartForward = useCallback((instanceId: string) => {
    setChartStackOrder((prev) => {
      const index = prev.indexOf(instanceId);
      if (index < 0 || index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const moveChartBackward = useCallback((instanceId: string) => {
    setChartStackOrder((prev) => {
      const index = prev.indexOf(instanceId);
      if (index <= 0) return prev;
      const next = [...prev];
      [next[index], next[index - 1]] = [next[index - 1], next[index]];
      return next;
    });
  }, []);

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

  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("chartType");
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

    const chartItems = Array.from(container.children) as HTMLDivElement[];
    if (chartItems.length === 0) return null;

    const containerRect = container.getBoundingClientRect();
    let maxRight = 0;
    let maxBottom = 0;

    chartItems.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      const right = itemRect.right - containerRect.left + container.scrollLeft;
      const bottom = itemRect.bottom - containerRect.top + container.scrollTop;
      maxRight = Math.max(maxRight, right);
      maxBottom = Math.max(maxBottom, bottom);
    });

    const width = Math.max(container.clientWidth, Math.ceil(maxRight));
    const height = Math.max(container.clientHeight, Math.ceil(maxBottom));
    if (width <= 0 || height <= 0) return null;

    const output = document.createElement("canvas");
    output.width = width;
    output.height = height;

    const ctx = output.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = canvasSettings.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    chartItems.forEach((item) => {
      const sourceCanvas = item.querySelector(
        "canvas",
      ) as HTMLCanvasElement | null;
      if (!sourceCanvas) return;

      const itemRect = item.getBoundingClientRect();
      const x = itemRect.left - containerRect.left + container.scrollLeft;
      const y = itemRect.top - containerRect.top + container.scrollTop;
      const w = item.offsetWidth;
      const h = item.offsetHeight;

      ctx.drawImage(sourceCanvas, x, y, w, h);
    });

    return output;
  };

  const getMaxAnimationDuration = () => {
    if (charts.length === 0) return 1000;
    return charts.reduce((max, chart) => {
      const duration =
        getChartSettings(chart.instanceId).animationDuration || 1000;
      return Math.max(max, duration);
    }, 1000);
  };

  const handleRemoveAll = () => {
    charts.forEach((chart) => removeChart(chart.id));
    setSelectedChartInstanceId(null);
    setChartPositionMap({});
    setChartStackOrder([]);
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
      setSelectedChartInstanceId((current) => {
        const chartToRemove = charts.find(
          (chart) => chart.id === pendingRemoval.chartId,
        );
        if (!chartToRemove) return current;
        return current === chartToRemove.instanceId ? null : current;
      });
    } else {
      handleRemoveAll();
    }

    setPendingRemoval(null);
  }, [charts, handleRemoveAll, pendingRemoval, removeChart]);

  const handleRefreshAll = () => {
    setReanimateAllKey(Date.now());
  };

  const handleCaptureAll = async () => {
    if (charts.length === 0 || isCapturingAll) return;

    setIsCapturingAll(true);
    try {
      const durationMs = getMaxAnimationDuration() + 500;
      setReanimateAllKey(Date.now());

      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );

      const snapshotCanvas = buildCanvasSnapshot();
      if (!snapshotCanvas) return;

      const stream = snapshotCanvas.captureStream(30);
      const mimeType = "video/webm; codecs=vp9";
      const recorder = new MediaRecorder(stream, { mimeType });
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
      };

      const startedAt = performance.now();
      const tick = (now: number) => {
        if (now - startedAt >= durationMs) return;
        updateCompositeFrame();
        requestAnimationFrame(tick);
      };

      recorder.start();
      requestAnimationFrame(tick);

      await new Promise<void>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          downloadBlob(blob, "canvas-video.webm");
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
    }
  };

  const handleDownloadAll = () => {
    const snapshotCanvas = buildCanvasSnapshot();
    if (!snapshotCanvas) return;

    const url = snapshotCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "canvas-image.png";
    link.click();
  };

  const handleExpandContainerToPanel = useCallback(() => {
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

    setChartPositionMap((prev) => ({ ...prev, ...nextPositions }));
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

      setChartSizeMap((prev) => ({
        ...prev,
        [instanceId]: {
          width: availableWidth,
          height: expandedRect.height,
        },
      }));
      setChartPositionMap((prev) => ({ ...prev, ...nextPositions }));
      setSelectedChartInstanceId(instanceId);
    },
    [chartSizeMap, chartStackOrder, charts],
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

      const currentData = chartDataMap[selectedChartInstanceId];
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
      chartDataOrientationMap,
      selectedChartInstanceId,
      transposeChartDataOrientation,
    ],
  );

  const dataPanelHeaderRight = (
    <div className="flex items-center gap-1">
      <Tooltip content="Apply">
        <button
          type="button"
          onClick={() => {
            if (!selectedChartInstanceId) return;
            const appliedData = dataPanelApplyHandlerRef.current?.() ?? null;

            if (appliedData) {
              updateChartData(selectedChartInstanceId, appliedData, {
                reanimate: true,
              });
              return;
            }

            const draft = chartDataDraftMap[selectedChartInstanceId];
            const isDirty = chartDataDraftDirtyMap[selectedChartInstanceId];

            if (draft && isDirty) {
              updateChartData(selectedChartInstanceId, draft, {
                reanimate: true,
              });
              return;
            }

            setReanimateSignal({
              instanceId: selectedChartInstanceId,
              key: Date.now(),
            });
          }}
          data-no-panel-drag="true"
          aria-label="Apply chart animation"
          title="Apply"
          className="rounded bg-white/20 px-2 py-1 text-xs font-medium text-zinc-100 hover:bg-white/30 disabled:opacity-50"
          disabled={!selectedChartInstanceId}
        >
          Apply
        </button>
      </Tooltip>
      <Tooltip content={dataPanelMode === "fixed-up" ? "move down" : "move up"}>
        <button
          type="button"
          onClick={() =>
            setDataPanelMode((prev) => {
              if (prev === "fixed-up") return "grid";
              setDataPanelTop(clampDataPanelTop(DATA_PANEL_FIXED_TOP));
              return "fixed-up";
            })
          }
          data-no-panel-drag="true"
          aria-label={
            dataPanelMode === "fixed-up"
              ? "Move data panel down"
              : "Move data panel up"
          }
          title={dataPanelMode === "fixed-up" ? "move down" : "move up"}
          className="rounded p-1 hover:bg-white/20"
        >
          <HugeiconsIcon
            icon={
              dataPanelMode === "fixed-up" ? ArrowDown01Icon : ArrowUp01Icon
            }
            size={16}
            className="text-zinc-100"
          />
        </button>
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
      (chartDataDraftMap[selectedChartInstanceId] as MapChartData) ||
      (chartDataMap[selectedChartInstanceId] as MapChartData);
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
            (chartDataDraftMap[selectedChartInstanceId] as LineChartData) ||
            (chartDataMap[selectedChartInstanceId] as LineChartData)
          }
          onChange={(nextData) =>
            updateChartDataDraft(selectedChartInstanceId, nextData)
          }
          themeColors={activeThemeColors}
        />
      )}

      {selectedChart?.type === "bar" && selectedChartInstanceId && (
        <BarChartDataPanel
          data={
            (chartDataDraftMap[selectedChartInstanceId] as BarChartData) ||
            (chartDataMap[selectedChartInstanceId] as BarChartData)
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
            (chartDataDraftMap[selectedChartInstanceId] as PieChartData) ||
            (chartDataMap[selectedChartInstanceId] as PieChartData)
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
            (chartDataDraftMap[selectedChartInstanceId] as MapChartData) ||
            (chartDataMap[selectedChartInstanceId] as MapChartData)
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

      <PanelView
        title="Workspace"
        className="relative z-10"
        bodyClassName="p-0 overflow-hidden"
        onClick={() => setSelectedChartInstanceId(null)}
        headerRight={
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
          />
        }
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
            cursor:
              isMobileMode && pendingMobileChartType ? "crosshair" : "default",
          }}
          onClick={onCanvasClick}
        >
          {charts.map((c) => (
            <ChartItem
              key={c.id}
              data={c}
              reanimateSignal={reanimateSignal}
              reanimateAllKey={reanimateAllKey}
              settings={getChartSettings(c.instanceId)}
              chartData={chartDataMap[c.instanceId]}
              onSelectChart={onSelectChart}
              position={chartPositionMap[c.instanceId] || { x: 20, y: 20 }}
              size={chartSizeMap[c.instanceId] || defaultChartSize}
              onMove={onMoveChart}
              onResize={onResizeChart}
              zIndex={
                selectedChartInstanceId === c.instanceId
                  ? CHART_Z_INDEX_SELECTED
                  : Math.min(
                      CHART_Z_INDEX_MAX,
                      Math.max(1, chartStackOrder.indexOf(c.instanceId) + 1),
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
              pieSettings={getPieSettings(c.instanceId)}
              mapSettings={getMapSettings(c.instanceId)}
            />
          ))}
        </div>
      </PanelView>

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
              getChartSettings(selectedChartInstanceId).animationDuration
            }
            setAnimationDuration={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                animationDuration: value,
              })
            }
            fontFamily={getChartSettings(selectedChartInstanceId).fontFamily}
            setFontFamily={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                fontFamily: value,
              })
            }
            fontSize={getChartSettings(selectedChartInstanceId).fontSize}
            setFontSize={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                fontSize: value,
              })
            }
            mediaType={mediaType}
            setMediaType={setMediaType}
            backgroundColor={
              getChartSettings(selectedChartInstanceId).backgroundColor
            }
            setBackgroundColor={(color) =>
              updateChartSettings(selectedChartInstanceId, {
                backgroundColor: color,
              })
            }
            title={getChartSettings(selectedChartInstanceId).title}
            setTitle={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                title: value,
              })
            }
            showLegend={getChartSettings(selectedChartInstanceId).showLegend}
            setShowLegend={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                showLegend: value,
              })
            }
            legendTop={getChartSettings(selectedChartInstanceId).legendTop}
            setLegendTop={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                legendTop: value,
              })
            }
            legendLeft={getChartSettings(selectedChartInstanceId).legendLeft}
            setLegendLeft={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                legendLeft: value,
              })
            }
            legendOrient={
              getChartSettings(selectedChartInstanceId).legendOrient
            }
            setLegendOrient={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                legendOrient: value,
              })
            }
            barShowBackground={(() => {
              const settings = getChartSettings(selectedChartInstanceId);
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
              const settings = getChartSettings(selectedChartInstanceId);
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
              const settings = getChartSettings(selectedChartInstanceId);
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
              const settings = getChartSettings(selectedChartInstanceId);
              return "barStackEnabled" in settings
                ? settings.barStackEnabled
                : undefined;
            })()}
            setBarStackEnabled={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                barStackEnabled: value,
              })
            }
            lineShowLabels={(() => {
              const settings = getChartSettings(selectedChartInstanceId);
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
              const settings = getChartSettings(selectedChartInstanceId);
              return "lineSmooth" in settings ? settings.lineSmooth : undefined;
            })()}
            setLineSmooth={(value) =>
              updateChartSettings(selectedChartInstanceId, {
                lineSmooth: value,
              })
            }
            lineStep={(() => {
              const settings = getChartSettings(selectedChartInstanceId);
              return "lineStep" in settings ? settings.lineStep : undefined;
            })()}
            setLineStep={(value) =>
              updateChartSettings(selectedChartInstanceId, { lineStep: value })
            }
            lineArea={(() => {
              const settings = getChartSettings(selectedChartInstanceId);
              return "lineArea" in settings ? settings.lineArea : undefined;
            })()}
            setLineArea={(value) =>
              updateChartSettings(selectedChartInstanceId, { lineArea: value })
            }
            selectedChartType={
              charts.find((c) => c.instanceId === selectedChartInstanceId)?.type
            }
            dataOrientation={selectedChartDataOrientation}
            setDataOrientation={handleChangeDataOrientation}
            pieSettings={getPieSettings(selectedChartInstanceId)}
            setPieSettings={(updates) =>
              updatePieSettings(selectedChartInstanceId, updates)
            }
            mapSettings={getMapSettings(selectedChartInstanceId)}
            setMapSettings={(updates) =>
              updateMapSettings(selectedChartInstanceId, updates)
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
            title="Chart Data"
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
          title="Chart Data"
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
