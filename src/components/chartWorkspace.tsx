import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChartSettingsPanel } from "./ChartSettingsPanel";
import { ChartItem } from "./chartItem";
import { CanvasContextMenu } from "./canvasContextMenu";
import { PanelView } from "./UILibrary/PanelView";
import { getOptionsByType } from "./chartOptionTemplates";
import {
  type ChartItemData,
  type ChartSettingsData,
  type ReanimateSignal,
} from "./chartTypes";

export const ChartWorkspace: React.FC<{
  charts: ChartItemData[];
  addChart: (type: string) => void;
  removeChart: (id: number) => void;
}> = ({ charts, addChart, removeChart }) => {
  const [chartPositionMap, setChartPositionMap] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [chartStackOrder, setChartStackOrder] = useState<string[]>([]);
  const [chartSettingsMap, setChartSettingsMap] = useState<
    Record<string, ChartSettingsData>
  >({});
  const [mediaType, setMediaType] = useState<string>("webm");
  const [reanimateSignal, setReanimateSignal] =
    useState<ReanimateSignal | null>(null);
  const [reanimateAllKey, setReanimateAllKey] = useState<number>(0);
  const [isCapturingAll, setIsCapturingAll] = useState(false);
  const [selectedChartInstanceId, setSelectedChartInstanceId] = useState<
    string | null
  >(null);
  const [canvasSettings, setCanvasSettings] = useState({
    animationDuration: 1000,
    backgroundColor: "#ffffff",
    title: "Workspace",
  });

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

  useEffect(() => {
    charts.forEach((chart) => {
      if (!chartSettingsMap[chart.instanceId]) {
        initializeChartSettings(chart.instanceId, chart.type);
      }
    });
  }, [charts, chartSettingsMap]);

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
    setSelectedChartInstanceId((prev) =>
      prev === instanceId ? null : instanceId,
    );
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

  const handleAutoArrange = () => {
    const container = containerRef.current;
    if (!container || charts.length === 0) return;

    const orderedIds = chartStackOrder.length
      ? chartStackOrder.filter((id) => charts.some((c) => c.instanceId === id))
      : charts.map((c) => c.instanceId);

    const defaultSize = { width: 400, height: 300 };
    const chartRects = new Map<string, { width: number; height: number }>();

    Array.from(container.children).forEach((child) => {
      const el = child as HTMLDivElement;
      const instanceId = el.dataset.instanceId;
      if (!instanceId) return;
      chartRects.set(instanceId, {
        width: el.offsetWidth || defaultSize.width,
        height: el.offsetHeight || defaultSize.height,
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
      const rect = chartRects.get(id) || defaultSize;

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

  return (
    <div
      className="chart-workspace grid grid-cols-1 md:grid-cols-[80%_1fr] gap-2"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <PanelView
        title="Workspace"
        className="relative"
        headerRight={
          <CanvasContextMenu
            id="canvas-context-menu"
            className="bg-transparent p-0 drop-shadow-none"
            onRemoveAll={handleRemoveAll}
            onCaptureAll={handleCaptureAll}
            onRefreshAll={handleRefreshAll}
            onDownloadAll={handleDownloadAll}
            onAutoArrange={handleAutoArrange}
            isCapturing={isCapturingAll}
          />
        }
      >
        <div
          id="chart-container"
          ref={containerRef}
          className="relative resize overflow-auto p-1 border border-theme-bg rounded-md bg-white/50 shadow-lg"
          style={{
            width: "800px",
            maxWidth: "100%",
            height: "600px",
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
              onSelectChart={onSelectChart}
              position={chartPositionMap[c.instanceId] || { x: 20, y: 20 }}
              onMove={onMoveChart}
              zIndex={
                selectedChartInstanceId === c.instanceId
                  ? 9999
                  : (chartStackOrder.indexOf(c.instanceId) + 1) * 10
              }
              onMoveToTop={() => moveChartToTop(c.instanceId)}
              onMoveUp={() => moveChartForward(c.instanceId)}
              onMoveDown={() => moveChartBackward(c.instanceId)}
              onMoveToBottom={() => moveChartToBottom(c.instanceId)}
              isSelected={selectedChartInstanceId === c.instanceId}
              removeChart={removeChart}
              mediaType={mediaType}
            />
          ))}
        </div>
      </PanelView>

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
          />
        )}
      </PanelView>

      <PanelView title="Chart Data" className="md:col-span-2">
        <p className="text-sm text-gray-600">
          Placeholder for data / editors. Multiple tabs or charts will be added
          here later.
        </p>
      </PanelView>
    </div>
  );
};
