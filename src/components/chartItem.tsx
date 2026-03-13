import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { recordCanvas } from "./record";
import {
  type ChartItemData,
  type ChartSettingsData,
  type ReanimateSignal,
} from "./chartTypes";
import { getOptionsByType } from "./chartOptionTemplates";
import { ChartContextMenu } from "./chartContextMenu";

interface ChartItemProps {
  data: ChartItemData;
  reanimateSignal: ReanimateSignal | null;
  reanimateAllKey: number;
  settings: ChartSettingsData;
  onSelectChart: (instanceId: string) => void;
  position: { x: number; y: number };
  onMove: (instanceId: string, x: number, y: number) => void;
  zIndex: number;
  onMoveToTop: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToBottom: () => void;
  isSelected: boolean;
  removeChart: (id: number) => void;
  mediaType: string;
}

export const ChartItem: React.FC<ChartItemProps> = React.memo(
  ({
    data,
    reanimateSignal,
    reanimateAllKey,
    settings,
    onSelectChart,
    position,
    onMove,
    zIndex,
    onMoveToTop,
    onMoveUp,
    onMoveDown,
    onMoveToBottom,
    isSelected,
    removeChart,
    mediaType,
  }) => {
    const { id, type } = data;
    const chartRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragPreviewRef = useRef({ dx: 0, dy: 0 });
    const dragRafRef = useRef<number | null>(null);
    const didDragRef = useRef(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordKey, setRecordKey] = useState<number>(0);
    const lastAppliedReanimateKeyRef = useRef<number>(0);
    const lastAppliedReanimateAllKeyRef = useRef<number>(0);

    useEffect(() => {
      if (!containerRef.current) return;
      const observer = new ResizeObserver(() => {
        chartRef.current?.getEchartsInstance()?.resize();
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, []);

    const reanimateChart = () => {
      setRecordKey(Date.now());
    };

    useEffect(() => {
      if (!reanimateSignal) return;
      if (reanimateSignal.instanceId !== data.instanceId) return;
      if (lastAppliedReanimateKeyRef.current === reanimateSignal.key) return;

      lastAppliedReanimateKeyRef.current = reanimateSignal.key;
      reanimateChart();
    }, [reanimateSignal, data.instanceId]);

    useEffect(() => {
      if (!reanimateAllKey) return;
      if (lastAppliedReanimateAllKeyRef.current === reanimateAllKey) return;

      lastAppliedReanimateAllKeyRef.current = reanimateAllKey;
      reanimateChart();
    }, [reanimateAllKey]);

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

      const echartsInstance: any =
        chartRef.current && chartRef.current.getEchartsInstance();
      const canvas = echartsInstance?.getDom()?.querySelector("canvas");

      if (canvas) {
        setIsRecording(true);
        try {
          const buffer = 500;
          const durationMs = settings.animationDuration + buffer;
          await recordCanvas(canvas, durationMs, mediaType);
        } catch (err) {
          console.error("Recording failed", err);
        } finally {
          setIsRecording(false);
        }
      }
    };

    const captureImage = () => {
      const echartsInstance: any =
        chartRef.current && chartRef.current.getEchartsInstance();
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
    const chartOption = {
      ...opts,
      title: {
        ...(opts.title || {}),
        text: settings.title,
      },
      backgroundColor: settings.backgroundColor,
      animationDuration: settings.animationDuration ?? opts.animationDuration,
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

    return (
      <div
        ref={containerRef}
        data-instance-id={data.instanceId}
        onMouseDown={onMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          if (didDragRef.current) {
            didDragRef.current = false;
            return;
          }
          onSelectChart(data.instanceId);
        }}
        className={`group absolute cursor-move resize overflow-auto border bg-white w-100 h-75 ${chartHighlighted}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex,
        }}
      >
        <ReactECharts
          ref={chartRef}
          key={`${type}-${recordKey}-${id}`}
          option={chartOption}
          // @ts-ignore: preserveDrawingBuffer is valid for the underlying canvas
          opts={{ renderer: "canvas", preserveDrawingBuffer: true }}
          style={{
            width: "100%",
            height: "100%",
            background: settings.backgroundColor,
          }}
        />
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
            onRemove={() => removeChart(id)}
            onRecord={startRecording}
            onReanimate={reanimateChart}
            onDownload={captureImage}
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
