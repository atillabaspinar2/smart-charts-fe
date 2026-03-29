import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import debounce from "lodash/debounce";
import { recordCanvas } from "./record";
import {
  type ChartData,
  type ChartItemData,
  type ChartSettingsBase,
  type LineChartSettings,
  type BarChartSettings,
  type PieChartSettings,
  type MapChartSettings,
  type ReanimateSignal,
  defaultPieChartSettings,
  defaultMapChartSettings,
  type MapChartData,
} from "./chartTypes";
import { getOptionsByType } from "./chartOptionTemplates";
import { ChartContextMenu } from "./chartContextMenu";
import { MapChart } from "./MapChart";
import { colorRanges } from "./mapChartOptions";
import { useAnnotations } from "@/hooks/useAnnotation";
import type { AnyAnnotation } from "@/hooks/useAnnotation";
import { AnnotationStylePanel } from "@/components/annotations/AnnotationStylePanel";

interface ChartItemProps {
  data: ChartItemData;
  reanimateSignal: ReanimateSignal | null;
  settings:
    | LineChartSettings
    | BarChartSettings
    | PieChartSettings
    | MapChartSettings;
  /** Timeline clip for this chart. When present, clip duration drives animationDuration for each series. */
  timelineClip?: { startMs: number; endMs: number };
  /** When true, the chart container is hidden (waiting for its timeline startMs). */
  isHidden?: boolean;
  chartData?: ChartData;
  onSelectChart: (instanceId: string) => void;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onMove: (instanceId: string, x: number, y: number) => void;
  onResize: (instanceId: string, width: number, height: number) => void;
  zIndex: number;
  onExpandToFullWidth: () => void;
  onMoveToTop: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToBottom: () => void;
  isSelected: boolean;
  onRequestRemoveChart: (id: number) => void;
  onImportData: (instanceId: string) => void;
  mediaType: string;
  theme?: string;
  annotations: AnyAnnotation[];
  onAnnotationsChange: (annotations: AnyAnnotation[]) => void;
}

export const ChartItem: React.FC<ChartItemProps> = React.memo(
  ({
    data,
    reanimateSignal,
    settings,
    timelineClip,
    isHidden = false,
    chartData,
    onSelectChart,
    position,
    size,
    onMove,
    onResize,
    zIndex,
    onExpandToFullWidth,
    onMoveToTop,
    onMoveUp,
    onMoveDown,
    onMoveToBottom,
    isSelected,
    onRequestRemoveChart,
    onImportData,
    mediaType,
    theme,
    annotations,
    onAnnotationsChange,
  }) => {
    const { id, type } = data;

    // Clip duration is the single source of truth for animation length.
    // Falls back to settings.animationDuration for charts without a timeline clip (e.g. map).
    const animationDurationMs =
      timelineClip != null
        ? timelineClip.endMs - timelineClip.startMs
        : (settings.animationDuration ?? 1000);

    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const mapChartRef = useRef<any>(null);
    const dragPreviewRef = useRef({ dx: 0, dy: 0 });
    const dragRafRef = useRef<number | null>(null);
    const didDragRef = useRef(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordKey, setRecordKey] = useState<number>(0);
    const [animateOnNextMount, setAnimateOnNextMount] = useState(false);
    const reanimateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastAppliedReanimateKeyRef = useRef<number>(0);
    const echartsInstanceRef = useRef<any>(null);

    // annotations (line-only for step 1)
    const {
      selectedAnnotation,
      selectedId,
      addAnnotation,
      selectAnnotation,
      clearSelection,
      moveAnnotation,
      moveHandle1,
      moveHandle2,
      annotations: currentAnnotations,
      updateAnnotationStyle,
      updateAnnotationShape,
      deleteAnnotation,
      buildGraphicElements,
    } = useAnnotations(annotations);

    const onAnnotationsChangeRef = useRef(onAnnotationsChange);
    useEffect(() => {
      onAnnotationsChangeRef.current = onAnnotationsChange;
    }, [onAnnotationsChange]);

    // Persist annotation changes into the workspace store.
    // Dragging and slider interactions can fire many state updates in a short time.
    // Debounce store writes so we only persist after user "finishes" interacting.
    const persistAnnotationsDebounced = useMemo(
      () =>
        debounce((next: AnyAnnotation[]) => {
          onAnnotationsChangeRef.current(next);
        }, 250, { maxWait: 1000 }),
      [],
    );

    useEffect(() => {
      // Prevent infinite loop: when store pushes the same annotation set back
      // as `initialAnnotations`, `useAnnotations` re-hydrates local state and we
      // should not write it back again.
      const propStr = JSON.stringify(annotations);
      const nextStr = JSON.stringify(currentAnnotations);
      if (propStr === nextStr) return;

      persistAnnotationsDebounced(currentAnnotations);
    }, [annotations, currentAnnotations, persistAnnotationsDebounced]);

    useEffect(() => {
      return () => {
        persistAnnotationsDebounced.cancel();
      };
    }, [persistAnnotationsDebounced]);

    // Throttle live-resize persistence + echarts resizing to avoid excessive
    // IndexedDB writes / heavy re-renders (map charts are especially sensitive).
    const persistResizeDebounced = useMemo(() => {
      const waitMs = type === "map" ? 200 : 80;

      const safeResizeEcharts = () => {
        try {
          const host = containerRef.current;
          if (!host || !host.isConnected) return;

          if (type === "map") {
            const inst = mapChartRef.current?.getEchartsInstance?.();
            inst?.resize?.();
            return;
          }

          const inst = chartRef.current?.getEchartsInstance?.();
          inst?.resize?.();
        } catch {
          // ECharts-for-React can throw if called while DOM is mid-update.
          // Throttling + try/catch keeps the app stable.
        }
      };

      return debounce(
        (width: number, height: number) => {
          onResize(data.instanceId, width, height);
          safeResizeEcharts();
        },
        waitMs,
        // Avoid `leading` so we don't write to the store while ECharts is still mounting.
        { leading: false, trailing: true, maxWait: waitMs * 2 },
      );
    }, [data.instanceId, onResize, type]);

    // Clear annotation selection when clicking non-annotation chart area.
    // We attach via `onChartReady` since the instance may not exist in early effects.
    const attachZrDeselectHandlers = (echartsInstance: any) => {
      const zr = echartsInstance?.getZr?.();
      if (!zr) return;

      const shouldClear = (evt: any) => {
        let node = evt?.target as any;
        let clickedAnnotationGraphic = false;
        while (node) {
          const nodeId = node?.id as string | undefined;
          if (typeof nodeId === "string" && nodeId.startsWith("ann_")) {
            clickedAnnotationGraphic = true;
            break;
          }
          node = node?.parent;
        }
        if (!clickedAnnotationGraphic) clearSelection();
      };

      // avoid duplicates if chart re-inits
      zr.off("click", shouldClear);
      zr.off("mousedown", shouldClear);

      zr.on("click", shouldClear);
      zr.on("mousedown", shouldClear);
    };

    // Clear annotation selection when clicking outside this chart item entirely.
    useEffect(() => {
      if (!selectedId) return;

      const onDocMouseDown = (e: MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;
        if (!container.contains(e.target as Node)) {
          clearSelection();
        }
      };

      document.addEventListener("mousedown", onDocMouseDown, true);
      return () => {
        document.removeEventListener("mousedown", onDocMouseDown, true);
      };
    }, [clearSelection, selectedId]);

    useEffect(() => {
      if (!containerRef.current) return;
      const observer = new ResizeObserver(() => {
        const node = containerRef.current;
        if (node) {
          persistResizeDebounced(node.offsetWidth, node.offsetHeight);
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, [persistResizeDebounced]);

    useEffect(() => {
      return () => {
        persistResizeDebounced.cancel();
      };
    }, [persistResizeDebounced]);

    const reanimateChart = () => {
      const inst: any =
        echartsInstanceRef.current ??
        chartRef.current?.getEchartsInstance?.() ??
        mapChartRef.current?.getEchartsInstance?.();
      inst?.clear?.();

      if (reanimateTimerRef.current !== null) clearTimeout(reanimateTimerRef.current);
      reanimateTimerRef.current = setTimeout(() => {
        reanimateTimerRef.current = null;
        setAnimateOnNextMount(true);
        setRecordKey(Date.now());
      }, 10);
    };

    useEffect(() => {
      if (!animateOnNextMount) return;
      const timer = window.setTimeout(
        () => {
          setAnimateOnNextMount(false);
        },
        Math.max(50, animationDurationMs + 50),
      );
      return () => window.clearTimeout(timer);
    }, [animateOnNextMount, animationDurationMs]);

    useEffect(() => {
      if (!reanimateSignal) return;
      if (reanimateSignal.instanceId !== data.instanceId) return;
      if (lastAppliedReanimateKeyRef.current === reanimateSignal.key) return;

      lastAppliedReanimateKeyRef.current = reanimateSignal.key;
      reanimateChart();
    }, [reanimateSignal, data.instanceId]);

    useEffect(() => {
      return () => {
        if (dragRafRef.current !== null) {
          cancelAnimationFrame(dragRafRef.current);
        }
      };
    }, []);

    const startRecording = async () => {
      reanimateChart();
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );

      let echartsInstance: any = chartRef.current?.getEchartsInstance?.();
      if (!echartsInstance && mapChartRef.current?.getEchartsInstance) {
        echartsInstance = mapChartRef.current.getEchartsInstance();
      }
      const canvas = echartsInstance?.getDom()?.querySelector("canvas");

      if (canvas) {
        setIsRecording(true);
        try {
          const buffer = 500;
          const durationMs = animationDurationMs + buffer;
          await recordCanvas(canvas, durationMs, mediaType);
        } catch (err) {
          console.error("Recording failed", err);
        } finally {
          setIsRecording(false);
        }
      }
    };

    const captureImage = () => {
      let echartsInstance: any = chartRef.current?.getEchartsInstance?.();
      if (!echartsInstance && mapChartRef.current?.getEchartsInstance) {
        echartsInstance = mapChartRef.current.getEchartsInstance();
      }
      const canvas: HTMLCanvasElement | null = echartsInstance
        ?.getDom()
        ?.querySelector("canvas");
      if (canvas) {
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `chart-${id}.png`;
        link.click();
      }
    };

    const opts: any = getOptionsByType(type);
    const hasTheme = Boolean(theme);
    const shouldUseSeriesColor = (
      colorSource: "theme" | "custom" | undefined,
      color: string,
    ) => {
      if (!hasTheme) return true;
      if (colorSource === "custom") return true;
      if (colorSource === "theme") return false;
      return color.length > 0;
    };
    const effectiveBackgroundColor = (() => {
      if (type === "map") {
        const bg = (settings as MapChartSettings).backgroundColor?.trim() ?? "";
        return bg === "" ? "#ffffff" : bg;
      }
      return hasTheme && settings.backgroundColor === "#ffffff"
        ? undefined
        : settings.backgroundColor;
    })();

    // For map charts, ensure option.series[0].map is set to chartData.mapName and inject style panel settings
    let chartOption = {
      ...opts,
      // Root-level animationDuration is intentionally omitted for line/bar/pie —
      // animation duration is controlled per-series so ECharts applies it precisely.
      animationDuration: undefined,
      title: {
        ...(opts.title || {}),
        text: settings.title,
        textStyle: {
          ...(opts.title?.textStyle || {}),
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
        },
      },
      textStyle: {
        ...(opts.textStyle || {}),
        fontFamily: settings.fontFamily,
        // fontSize intentionally omitted from global textStyle
      },
      backgroundColor: effectiveBackgroundColor,
    };
    if (type === "map" && chartData && chartData.type === "map") {
      const updatedMapSettings =
        (settings as MapChartSettings) ?? defaultMapChartSettings;

      const mapChartData = chartData as MapChartData;
      if (mapChartData.series && mapChartData.series.data) {
        // Derive per-item delay from timeline clip duration ÷ data length.
        // Falls back to animationDelayUpdateValue setting when no clip is set.
        const dataLength = mapChartData.series.data.length || 1;
        const clipDuration =
          timelineClip != null
            ? timelineClip.endMs - timelineClip.startMs
            : (updatedMapSettings?.animationDelayUpdateValue || 20) * dataLength;
        const perItemDelayMs = clipDuration / dataLength;

        chartOption = {
          mapName: chartData.mapName,
          ...chartOption,
          visualMap: {
            ...chartOption.visualMap,
            inRange: {
              color:
                colorRanges[
                  updatedMapSettings.visualMapColorRange || "Indigo"
                ] || colorRanges.Indigo,
            },
          },
          series: [
            {
              ...chartOption.series[0],
              map: chartData.mapName,
              animationDelayUpdate: (idx: number) => idx * perItemDelayMs,

              label: {
                show: updatedMapSettings.showLabel,
                color:
                  updatedMapSettings.labelFontColor ||
                  chartOption.series[0].label?.color,
                fontSize:
                  updatedMapSettings.labelFontSize ||
                  chartOption.series[0].label?.fontSize,
              },
              data: chartData.series.data,
            },
          ],
        };
      }
    }

    const {
      left: _legendLeft,
      right: _legendRight,
      top: _legendTop,
      bottom: _legendBottom,
      orient: _legendOrient,
      show: _legendShow,
      ...baseLegend
    } = opts.legend || {};
    // Type guards for settings
    const isLineSettings = (
      s: typeof settings,
    ): s is import("./chartTypes").LineChartSettings =>
      (s as any).lineShowLabels !== undefined;
    const isBarSettings = (
      s: typeof settings,
    ): s is import("./chartTypes").BarChartSettings =>
      (s as any).barShowBackground !== undefined;

    // Legend position helpers
    const legendVerticalPosition =
      isLineSettings(settings) || isBarSettings(settings)
        ? settings.legendTop === "top"
          ? { top: 12 }
          : { bottom: 12 }
        : {};
    const legendHorizontalPosition =
      isLineSettings(settings) || isBarSettings(settings)
        ? settings.legendLeft === "left"
          ? { left: 12 }
          : settings.legendLeft === "right"
            ? { right: 12 }
            : { left: "center" }
        : {};

    if (
      type === "line" &&
      chartData?.type === "line" &&
      isLineSettings(settings)
    ) {
      const categories = chartData.categories;
      const showEndValueLabels = Boolean(settings.lineShowLabels);
      chartOption.tooltip = opts.tooltip || { trigger: "axis" };
      chartOption.legend = {
        ...baseLegend,
        show: settings.showLegend,
        orient: settings.legendOrient,
        ...legendVerticalPosition,
        ...legendHorizontalPosition,
        data: chartData.series.map((series) => series.name || "Series"),
      };
      chartOption.xAxis = {
        ...(opts.xAxis || {}),
        type: "category",
        data: categories,
      };
      chartOption.yAxis = opts.yAxis || { type: "value" };
      chartOption.series = chartData.series.map((series, index) => {
        const templateSeries = Array.isArray(opts.series)
          ? opts.series[index] || opts.series[0] || {}
          : {};
        return {
          ...templateSeries,
          type: "line",
          name: series.name || `Series ${index + 1}`,
          data: categories.map(
            (_, valueIndex) => series.values[valueIndex] ?? null,
          ),
          smooth: settings.lineSmooth,
          step: settings.lineStep ? "end" : false,
          stack: settings.lineStack ? "total" : undefined,
          symbol: settings.lineSymbol ?? "circle",
          symbolSize: settings.lineSymbolSize ?? 4,
          endLabel: showEndValueLabels
            ? {
                show: true,
                valueAnimation: animateOnNextMount,
                formatter: (params: any) =>
                  `${params.seriesName}: ${params.value ?? ""}`,
              }
            : { show: false },
          labelLayout: showEndValueLabels
            ? { moveOverlap: "shiftY" }
            : undefined,
          emphasis: showEndValueLabels
            ? {
                focus: "series",
                label: {
                  show: true,
                },
              }
            : undefined,
          lineStyle: shouldUseSeriesColor(series.colorSource, series.color)
            ? {
                ...(templateSeries.lineStyle || {}),
                color: series.color,
              }
            : templateSeries.lineStyle,
          itemStyle: shouldUseSeriesColor(series.colorSource, series.color)
            ? {
                ...(templateSeries.itemStyle || {}),
                color: series.color,
              }
            : templateSeries.itemStyle,
          areaStyle: settings.lineArea
            ? {
                ...(templateSeries.areaStyle || {}),
                ...(shouldUseSeriesColor(series.colorSource, series.color)
                  ? { color: series.color }
                  : {}),
                opacity: 0.2,
              }
            : undefined,
          // Animation duration driven by timeline clip for this chart instance
          animation: animateOnNextMount,
          animationDuration: animateOnNextMount ? animationDurationMs : 0,
        };
      });
    }

    if (
      type === "bar" &&
      chartData?.type === "bar" &&
      isBarSettings(settings)
    ) {
      const categories = chartData.categories;
      const isHorizontalBar = settings.barAxisOrientation === "horizontal";
      chartOption.tooltip = opts.tooltip || { trigger: "axis" };
      chartOption.legend = {
        ...baseLegend,
        show: settings.showLegend,
        orient: settings.legendOrient,
        ...legendVerticalPosition,
        ...legendHorizontalPosition,
        data: chartData.series.map((series) => series.name || "Series"),
      };

      chartOption.xAxis = isHorizontalBar
        ? {
            ...(opts.xAxis || {}),
            type: "value",
          }
        : {
            ...(opts.xAxis || {}),
            type: "category",
            data: categories,
          };
      chartOption.yAxis = isHorizontalBar
        ? {
            ...(opts.yAxis || {}),
            type: "category",
            data: categories,
          }
        : {
            ...(opts.yAxis || {}),
            type: "value",
          };

      chartOption.series = chartData.series.map((series, index) => {
        const templateSeries = Array.isArray(opts.series)
          ? opts.series[index] || opts.series[0] || {}
          : {};
        return {
          ...templateSeries,
          type: "bar",
          name: series.name || `Series ${index + 1}`,
          data: categories.map(
            (_, valueIndex) => series.values[valueIndex] ?? null,
          ),
          itemStyle: shouldUseSeriesColor(series.colorSource, series.color)
            ? {
                ...(templateSeries.itemStyle || {}),
                color: series.color,
              }
            : templateSeries.itemStyle,
          showBackground: settings.barShowBackground,
          backgroundStyle: {
            ...(templateSeries.backgroundStyle || {}),
            color: settings.barBackgroundColor,
          },
          stack: settings.barStackEnabled ? "x" : undefined,
          // Animation duration driven by timeline clip for this chart instance
          animation: animateOnNextMount,
          animationDuration: animateOnNextMount ? animationDurationMs : 0,
        };
      });
    }

    if (type === "pie") {
      const ps = (settings as PieChartSettings) ?? defaultPieChartSettings;
      const templateSeries = Array.isArray(opts.series)
        ? opts.series[0] || {}
        : {};
      const pieSeriesData =
        chartData?.type === "pie"
          ? chartData.data.map((point) => ({
              name: point.name,
              value: point.value,
            }))
          : templateSeries.data;
      const pieLegend = settings as ChartSettingsBase;
      const legendSliceNames = Array.isArray(pieSeriesData)
        ? pieSeriesData.map((d: { name?: string }) => String(d?.name ?? ""))
        : [];
      chartOption.legend = {
        ...baseLegend,
        show: pieLegend.showLegend,
        orient: pieLegend.legendOrient,
        ...(pieLegend.legendTop === "top" ? { top: 12 } : { bottom: 12 }),
        ...(pieLegend.legendLeft === "left"
          ? { left: 12 }
          : pieLegend.legendLeft === "right"
            ? { right: 12 }
            : { left: "center" }),
        data: legendSliceNames,
      };

      chartOption.series = [
        {
          ...templateSeries,
          type: ps.chartType,
          name:
            chartData?.type === "pie"
              ? chartData.seriesName || templateSeries.name
              : templateSeries.name,
          ...(ps.chartType === "pie"
            ? {
                radius: [`${ps.innerRadius}%`, `${ps.outerRadius}%`],
                padAngle: ps.padAngle,
                roseType: ps.roseType,
              }
            : {}),
          avoidLabelOverlap: false,
          itemStyle: {
            ...(templateSeries.itemStyle || {}),
            borderWidth: ps.borderWidth,
          },
          label: { show: ps.showLabel, position: "inside" },
          emphasis: {
            label: {
              show: ps.showLabel,
              position: "inside",
              fontSize: 12,
              fontWeight: "bold",
            },
          },
          labelLine: { show: false },
          data: pieSeriesData,
          // Animation duration driven by timeline clip for this chart instance
          animation: animateOnNextMount,
          animationDuration: animateOnNextMount ? animationDurationMs : 0,
        },
      ];
    }

    // merge annotations into option.graphic
    const annotationGraphic = buildGraphicElements({
      onSelect: selectAnnotation,
      onMove: moveAnnotation,
      onLineHandle1Drag: moveHandle1,
      onLineHandle2Drag: moveHandle2,
    });
    chartOption = {
      ...chartOption,
      // Fully control graphic so deleted annotations disappear.
      graphic: annotationGraphic,
    };

    const chartHighlighted = isSelected
      ? "border-slate-300 rounded-lg shadow-[0_3px_10px_rgba(15,23,42,0.35)]"
      : "border-slate-200 rounded shadow-[0_2px_6px_rgba(0,0,0,0.08)]";

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;

      const target = e.target as HTMLElement;
      if (target.closest("[data-no-drag='true']")) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const resizeHandleSize = 18;
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;
      const onResizeHandle =
        pointerX >= rect.width - resizeHandleSize &&
        pointerY >= rect.height - resizeHandleSize;
      if (onResizeHandle) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const originX = position.x;
      const originY = position.y;
      didDragRef.current = false;

      const applyPreviewTransform = () => {
        const node = containerRef.current;
        if (node) {
          node.style.transform = `translate(${dragPreviewRef.current.dx}px, ${dragPreviewRef.current.dy}px)`;
        }
        dragRafRef.current = null;
      };

      const onMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (!didDragRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          didDragRef.current = true;
        }

        dragPreviewRef.current = {
          dx: Math.max(-originX, dx),
          dy: Math.max(-originY, dy),
        };

        if (dragRafRef.current === null) {
          dragRafRef.current = requestAnimationFrame(applyPreviewTransform);
        }
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);

        if (dragRafRef.current !== null) {
          cancelAnimationFrame(dragRafRef.current);
          dragRafRef.current = null;
        }

        const finalX = Math.max(0, originX + dragPreviewRef.current.dx);
        const finalY = Math.max(0, originY + dragPreviewRef.current.dy);

        const node = containerRef.current;
        if (node) {
          node.style.transform = "";
        }

        dragPreviewRef.current = { dx: 0, dy: 0 };

        if (finalX !== originX || finalY !== originY) {
          onMove(data.instanceId, finalX, finalY);
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    const onDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const onDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const annotationType = e.dataTransfer.getData("annotationType");

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (
          annotationType === "line" ||
          annotationType === "circle" ||
          annotationType === "text" ||
          annotationType === "image"
        ) {
          addAnnotation(annotationType, { x, y });
        }
      }
    };

    return (
      <div
        ref={containerRef}
        data-instance-id={data.instanceId}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMouseDown={onMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          if (didDragRef.current) {
            didDragRef.current = false;
            return;
          }
          onSelectChart(data.instanceId);
        }}
        className={`group absolute h-75 w-100 cursor-move resize overflow-auto border border-border bg-card text-card-foreground ${chartHighlighted}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          zIndex,
          visibility: isHidden ? "hidden" : "visible",
          pointerEvents: isHidden ? "none" : "auto",
        }}
      >
        {type === "map" && chartData && chartData.type === "map" ? (
          <MapChart
            chartRef={mapChartRef}
            keyMap={`${type}-${recordKey}-${id}-${theme || "default"}`}
            mapName={chartData.mapName}
            option={chartOption}
            seriesData={chartData.series.data || []}
            theme={theme || undefined}
          />
        ) : (
          <ReactECharts
            ref={chartRef}
            key={`${type}-${recordKey}-${id}-${theme || "default"}`}
            option={chartOption}
            replaceMerge={["graphic"]}
            // @ts-ignore: preserveDrawingBuffer is valid for the underlying canvas
            opts={{ renderer: "canvas", preserveDrawingBuffer: true }}
            theme={theme || undefined}
            onChartReady={(instance: any) => {
              echartsInstanceRef.current = instance;
              attachZrDeselectHandlers(instance);
            }}
            onEvents={{
              click: (params: any) => {
                // Click on empty plot area clears annotation selection
                if (params?.componentType !== "graphic") {
                  clearSelection();
                }
              },
            }}
            style={{
              width: "100%",
              height: "100%",
              background: effectiveBackgroundColor || "transparent",
            }}
          />
        )}

        {selectedAnnotation && (
          <AnnotationStylePanel
            annotation={selectedAnnotation}
            onDelete={() => deleteAnnotation(selectedAnnotation.id)}
            onStyleChange={(styleUpdate) =>
              updateAnnotationStyle(selectedAnnotation.id, styleUpdate)
            }
            onShapeChange={(shapeUpdate) =>
              updateAnnotationShape(selectedAnnotation.id, shapeUpdate)
            }
          />
        )}
        <div
          data-no-drag="true"
          className={`absolute top-2 left-2 z-40 transition-opacity ${
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <ChartContextMenu
            id="cart-context-menu"
            className="transition-opacity"
            onRemove={() => onRequestRemoveChart(id)}
            onRecord={startRecording}
            onReanimate={reanimateChart}
            onDownload={captureImage}
            onImport={() => onImportData(data.instanceId)}
            onExpandToFullWidth={onExpandToFullWidth}
            onMoveToTop={onMoveToTop}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onMoveToBottom={onMoveToBottom}
            isRecording={isRecording}
          />
        </div>
      </div>
    );
  },
);
