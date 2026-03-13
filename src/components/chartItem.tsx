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
    isSelected,
    removeChart,
    mediaType,
  }) => {
    const { id, type } = data;
    const chartRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
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

    return (
      <div
        ref={containerRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectChart(data.instanceId);
        }}
        className={`m-2 group relative cursor-pointer transition-all duration-200 resize overflow-auto border bg-white w-100 h-75 ${chartHighlighted}`}
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
        <ChartContextMenu
          id="cart-context-menu"
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100"
          onRemove={() => removeChart(id)}
          onRecord={startRecording}
          onReanimate={reanimateChart}
          onDownload={captureImage}
          isRecording={isRecording}
        />
      </div>
    );
  },
);
