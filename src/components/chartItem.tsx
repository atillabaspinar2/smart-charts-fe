import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  FileVideoCameraIcon,
  ImageDownload02Icon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";
import { recordCanvas } from "./record";
import {
  type ChartItemData,
  type ChartSettingsData,
  type ReanimateSignal,
} from "./chartTypes";
import { getOptionsByType } from "./chartOptionTemplates";

interface ChartItemProps {
  data: ChartItemData;
  reanimateSignal: ReanimateSignal | null;
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
      backgroundColor: settings.backgroundColor,
      animationDuration: settings.animationDuration ?? opts.animationDuration,
    };

    return (
      <div
        ref={containerRef}
        onClick={() => onSelectChart(data.instanceId)}
        className={`m-2 group relative cursor-pointer transition-shadow duration-200 ${
          isSelected ? "shadow-lg rounded-lg" : ""
        }`}
        style={{
          resize: "both",
          overflow: "auto",
          border: isSelected ? "1px solid #d1d5db" : "1px solid #e5e7eb",
          borderRadius: isSelected ? "0.5rem" : "0.25rem",
          backgroundColor: "white",
          width: "400px",
          height: "300px",
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
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 drop-shadow-lg bg-white/90 rounded p-1 flex space-x-2">
          <span data-tooltip="Remove chart" className="tooltip">
            <HugeiconsIcon
              icon={Delete02Icon}
              size={16}
              className="text-gray-500 hover:text-red-800 cursor-pointer"
              onClick={() => removeChart(id)}
            />
          </span>
          <span data-tooltip="Record video" className="tooltip">
            <HugeiconsIcon
              icon={FileVideoCameraIcon}
              size={16}
              className={`cursor-pointer hover:text-red-600 ${
                isRecording ? "text-red-500 animate-pulse" : "text-gray-500"
              }`}
              onClick={startRecording}
            />
          </span>
          <span data-tooltip="Reanimate chart" className="tooltip">
            <HugeiconsIcon
              icon={Refresh01Icon}
              size={16}
              className="text-gray-500 hover:text-emerald-600 cursor-pointer"
              onClick={reanimateChart}
            />
          </span>
          <span data-tooltip="Download image" className="tooltip">
            <HugeiconsIcon
              icon={ImageDownload02Icon}
              size={16}
              className="text-gray-500 hover:text-blue-600 cursor-pointer"
              onClick={captureImage}
            />
          </span>
        </div>
      </div>
    );
  },
);
