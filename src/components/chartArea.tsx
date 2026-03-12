//create a new chart area component that will be used to display multiple charts
import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ChartOptions } from "./chartSettings";
import {
  barOptions,
  lineOptions,
  pieOptions,
  radarOptions,
  scatterOptions,
} from "./chartOptions";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  FileVideoCameraIcon,
  ImageDownload02Icon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";
import { recordCanvas } from "./record";
import { TabView } from "./TabView";

interface ChartItemData {
  id: number;
  type: string;
}

export const ChartArea: React.FC<{
  charts: ChartItemData[];
  addChart: (type: string) => void;
  removeChart: (id: number) => void;
}> = ({ charts, addChart, removeChart }) => {
  const [animationDuration, setAnimationDuration] = useState<number>(1000);
  const [mediaType, setMediaType] = useState<string>("webm");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [reanimateAllKey, setReanimateAllKey] = useState<number>(0);

  const applyAnimationDuration = (value: number) => {
    setAnimationDuration(value);
    setReanimateAllKey((prev) => prev + 1);
  };

  const getOptions = (type: string) => {
    switch (type) {
      case "line":
        return lineOptions;
      case "bar":
        return barOptions;
      case "pie":
        return pieOptions;
      case "scatter":
        return scatterOptions;
      case "radar":
        return radarOptions;
      default:
        return {};
    }
  };

  // component for a single chart inside the container
  const ChartItem: React.FC<{
    data: ChartItemData;
    reanimateAllKey: number;
  }> = ({ data, reanimateAllKey }) => {
    const { id, type } = data;
    const chartRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordKey, setRecordKey] = useState<number>(0);
    const lastAppliedReanimateKeyRef = useRef<number>(0);

    React.useEffect(() => {
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
      if (reanimateAllKey === 0) return;
      if (lastAppliedReanimateKeyRef.current === reanimateAllKey) return;

      lastAppliedReanimateKeyRef.current = reanimateAllKey;
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
          const durationMs = animationDuration + buffer;
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

    const opts: any = getOptions(type);
    const chartOption = {
      ...opts,
      backgroundColor,
      animationDuration: animationDuration ?? opts.animationDuration,
    };

    return (
      <div
        ref={containerRef}
        className="m-2 group relative"
        style={{
          resize: "both",
          overflow: "auto",
          border: "1px solid #ccc",
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
            background: backgroundColor,
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
  };

  const containerRef = useRef<HTMLDivElement>(null);

  // handle drag/drop from sidebar
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("chartType");
    if (type) addChart(type);
  };

  return (
    <div
      className="chart-area grid grid-cols-1 md:grid-cols-[80%_1fr] gap-4"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="relative">
        {/* multi-chart container */}
        <div
          ref={containerRef}
          className="multi-chart-container"
          style={{
            resize: "both",
            overflow: "auto",
            border: "1px solid #ccc",
            padding: "8px",
            width: "800px",
            maxWidth: "100%",
            height: "600px",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {charts.map((c) => (
            <ChartItem key={c.id} data={c} reanimateAllKey={reanimateAllKey} />
          ))}
        </div>
      </div>
      <ChartOptions
        animationDuration={animationDuration}
        setAnimationDuration={applyAnimationDuration}
        mediaType={mediaType}
        setMediaType={setMediaType}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />
      {/* collapsible tab area for additional chart data or controls */}
      <TabView title="Chart Data">
        <p className="text-sm text-gray-600">
          Placeholder for data / editors. Multiple tabs or charts will be added
          here later.
        </p>
      </TabView>
    </div>
  );
};
