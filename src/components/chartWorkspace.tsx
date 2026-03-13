import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChartSettingsPanel } from "./ChartSettingsPanel";
import { ChartItem } from "./chartItem";
import { CanvasContextMenu } from "./canvasContextMenu";
import { PanelView } from "./PanelView";
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

  const onSelectChart = useCallback((instanceId: string) => {
    setSelectedChartInstanceId((prev) =>
      prev === instanceId ? null : instanceId,
    );
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

    ctx.fillStyle = "#ffffff";
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

  return (
    <div
      className="chart-workspace grid grid-cols-1 md:grid-cols-[80%_1fr] gap-2"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <PanelView
        title="Chart Items"
        className="relative"
        headerRight={
          <CanvasContextMenu
            id="canvas-context-menu"
            className="bg-transparent p-0 drop-shadow-none"
            onRemoveAll={handleRemoveAll}
            onCaptureAll={handleCaptureAll}
            onRefreshAll={handleRefreshAll}
            onDownloadAll={handleDownloadAll}
            isCapturing={isCapturingAll}
          />
        }
      >
        <div
          id="chart-container"
          ref={containerRef}
          className="resize overflow-auto p-1 flex flex-wrap border border-theme-bg rounded-md bg-white/50 shadow-lg"
          style={{
            width: "800px",
            maxWidth: "100%",
            height: "600px",
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
