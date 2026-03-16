import React, { useCallback, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { ChartSettingsPanel } from "./ChartSettingsPanel";
import { ChartItem } from "./chartItem";
import { CanvasContextMenu } from "./canvasContextMenu";
import { Modal } from "./UILibrary/Modal";
import { Tooltip } from "./UILibrary/Tooltip";
import { PanelView } from "./UILibrary/PanelView";
import { CustomButton } from "./UILibrary/CustomButton";
import {
  getThemeBackground,
  getThemePalette,
} from "../assets/themes/registerThemes";
import { getOptionsByType } from "./chartOptionTemplates";
import { LineChartDataPanel } from "./dataUI/lineChartDataPanel";
import { BarChartDataPanel } from "./dataUI/barChartDataPanel";
import {
  type BarChartData,
  type ChartData,
  type ChartItemData,
  type ChartSettingsData,
  type LineChartData,
  type ReanimateSignal,
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

export const ChartWorkspace: React.FC<{
  charts: ChartItemData[];
  addChart: (type: string) => void;
  removeChart: (id: number) => void;
}> = ({ charts, addChart, removeChart }) => {
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
  const [chartSettingsMap, setChartSettingsMap] = useState<
    Record<string, ChartSettingsData>
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
  });
  const [workspaceTheme, setWorkspaceTheme] = useState<string>("");
  const activeThemeColors = getThemePalette(workspaceTheme);

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
      },
    }));
  };

  const initializeChartData = (instanceId: string, type: string) => {
    if (type !== "line" && type !== "bar") return;

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

      setChartDataMap((prev) => ({ ...prev, [instanceId]: nextData }));
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
            smooth: Boolean(series.smooth),
            step: Boolean(series.step),
            areaStyle: series.areaStyle ? {} : null,
          }))
        : [
            {
              id: `${instanceId}-series-1`,
              name: "Series 1",
              color: getThemeColor(0),
              colorSource: "theme",
              themeColorIndex: 0,
              values: [150, 230, 224, 218, 135, 147, 260],
              smooth: false,
              step: false,
              areaStyle: {},
            },
          ],
    };

    setChartDataMap((prev) => ({
      ...prev,
      [instanceId]: nextData,
    }));
  };

  const updateChartSettings = (
    instanceId: string,
    updates: Partial<ChartSettingsData>,
  ) => {
    setChartSettingsMap((prev) => {
      const current =
        prev[instanceId] ||
        ({
          animationDuration: 1000,
          backgroundColor: "#ffffff",
          title: "",
        } as ChartSettingsData);
      const next = { ...current, ...updates };

      const animationChanged =
        typeof updates.animationDuration === "number" &&
        updates.animationDuration !== current.animationDuration;
      const backgroundChanged =
        typeof updates.backgroundColor === "string" &&
        updates.backgroundColor !== current.backgroundColor;
      const titleChanged =
        typeof updates.title === "string" && updates.title !== current.title;

      if (!animationChanged && !backgroundChanged && !titleChanged) return prev;

      if (animationChanged) {
        setReanimateSignal({ instanceId, key: Date.now() });
      }

      return {
        ...prev,
        [instanceId]: next,
      };
    });
  };

  const getChartSettings = (instanceId: string): ChartSettingsData => {
    return (
      chartSettingsMap[instanceId] || {
        animationDuration: 1000,
        backgroundColor: "#ffffff",
        title: "",
      }
    );
  };

  const updateChartData = (instanceId: string, nextData: ChartData) => {
    setChartDataMap((prev) => ({
      ...prev,
      [instanceId]: nextData,
    }));
    setReanimateSignal({ instanceId, key: Date.now() });
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

      updateChartData(instanceId, {
        ...data,
        series: nextSeries,
      } as ChartData);

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
        (chart.type === "line" || chart.type === "bar") &&
        !chartDataMap[chart.instanceId]
      ) {
        initializeChartData(chart.instanceId, chart.type);
      }
    });
  }, [charts, chartSettingsMap, chartDataMap]);

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
    if (type) addChart(type);
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

  const selectedChart = selectedChartInstanceId
    ? charts.find((chart) => chart.instanceId === selectedChartInstanceId) ||
      null
    : null;

  const dataPanelHeaderRight = (
    <div className="flex items-center gap-1">
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
            className="text-theme-bg"
          />
        </button>
      </Tooltip>
    </div>
  );

  const dataPanelBody = (
    <>
      {!selectedChart && (
        <p className="text-sm text-gray-600">
          Select a chart to edit its data.
        </p>
      )}

      {selectedChart?.type === "line" && selectedChartInstanceId && (
        <LineChartDataPanel
          data={chartDataMap[selectedChartInstanceId] as LineChartData}
          onChange={(nextData) =>
            updateChartData(selectedChartInstanceId, nextData)
          }
          themeColors={activeThemeColors}
        />
      )}

      {selectedChart?.type === "bar" && selectedChartInstanceId && (
        <BarChartDataPanel
          data={chartDataMap[selectedChartInstanceId] as BarChartData}
          onChange={(nextData) =>
            updateChartData(selectedChartInstanceId, nextData)
          }
          themeColors={activeThemeColors}
        />
      )}

      {selectedChart &&
        selectedChart.type !== "line" &&
        selectedChart.type !== "bar" && (
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
      <PanelView
        title="Workspace"
        className="relative"
        onClick={() => setSelectedChartInstanceId(null)}
        headerRight={
          <CanvasContextMenu
            id="canvas-context-menu"
            className="bg-transparent p-0 drop-shadow-none"
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
          id="chart-container"
          ref={containerRef}
          className="relative resize overflow-auto p-1 border border-theme-bg rounded-md bg-white/50 shadow-lg"
          style={{
            width: `${containerSize.width}px`,
            maxWidth: "100%",
            height: `${containerSize.height}px`,
            backgroundColor: canvasSettings.backgroundColor,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedChartInstanceId(null);
          }}
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
                  ? 9999
                  : (chartStackOrder.indexOf(c.instanceId) + 1) * 10
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
              mediaType={mediaType}
              theme={workspaceTheme || undefined}
            />
          ))}
        </div>
      </PanelView>

      <Modal
        isOpen={pendingRemoval !== null}
        onClose={() => setPendingRemoval(null)}
      >
        <div>
          <h3 className="mb-3 text-lg font-semibold text-theme-text">
            Confirm removal
          </h3>
          <p className="text-sm text-theme-text">
            Are you sure you want to remove the selected chart(s)?
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <CustomButton
              variant="secondary"
              size="md"
              onClick={() => setPendingRemoval(null)}
            >
              Cancel
            </CustomButton>
            <CustomButton variant="primary" size="md" onClick={confirmRemoval}>
              Remove
            </CustomButton>
          </div>
        </div>
      </Modal>

      <PanelView title="Settings">
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
            selectedChartType={
              charts.find((c) => c.instanceId === selectedChartInstanceId)
                ?.type || ""
            }
            onApplyThemeColors={() =>
              applyThemeColorsToChartSeries(selectedChartInstanceId)
            }
            onClose={() => setSelectedChartInstanceId(null)}
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
        <div ref={gridDataPanelRef} className="md:col-span-2">
          <PanelView
            title="Chart Data"
            headerRight={dataPanelHeaderRight}
            onHeaderMouseDown={handleDataPanelHeaderMouseDown}
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
