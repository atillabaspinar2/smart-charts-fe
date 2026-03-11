//create a new chart area component that will be used to display multiple charts
import React, { useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ChartOptions } from "./chartOptions";
import {
  barOptions,
  lineOptions,
  pieOptions,
  radarOptions,
  scatterOptions,
} from "./chartOptionSettings";

import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
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
  const ChartItem: React.FC<{ data: ChartItemData }> = ({ data }) => {
    const { id, type } = data;
    const chartRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordKey, setRecordKey] = useState<number>(0);

    React.useEffect(() => {
      if (!containerRef.current) return;
      const observer = new ResizeObserver(() => {
        chartRef.current?.getEchartsInstance()?.resize();
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, []);

    const startRecording = async () => {
      setRecordKey(Date.now());
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

    const opts = getOptions(type);

    return (
      <div
        ref={containerRef}
        className="m-2 group relative"
        style={{
          resize: "both",
          overflow: "auto",
          border: "1px solid #ccc",
          padding: "8px",
          width: "400px",
          height: "300px",
        }}
      >
        <ReactECharts
          ref={chartRef}
          key={`${type}-${recordKey}-${id}`}
          option={{ ...opts, animationDuration, backgroundColor }}
          // @ts-ignore: preserveDrawingBuffer is valid for the underlying canvas
          opts={{ renderer: "canvas", preserveDrawingBuffer: true }}
          style={{
            width: "100%",
            height: "100%",
            background: backgroundColor,
          }}
        />
        <HugeiconsIcon
          icon={Delete02Icon}
          size={16}
          className="absolute top-2 left-2 text-gray-500 opacity-0 group-hover:opacity-100 cursor-pointer"
          onClick={() => removeChart(id)}
        />
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`${
            isRecording ? "bg-red-500 animate-pulse" : "bg-blue-600"
          } text-white px-2 py-1 rounded absolute top-2 right-2`}
        >
          {isRecording ? "Rec..." : "Rec"}
        </button>
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
            <ChartItem key={c.id} data={c} />
          ))}
        </div>
      </div>
      <ChartOptions
        animationDuration={animationDuration}
        setAnimationDuration={setAnimationDuration}
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
