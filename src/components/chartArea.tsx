//create a new chart area component that will be used to display the charts
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
import { ComputerVideoIcon, Image01Icon } from "@hugeicons/core-free-icons";
import { recordCanvas } from "./record";

export const ChartArea: React.FC<{ type: string }> = ({ type }) => {
  const [recordKey, setRecordKey] = useState<number>(0);
  const [animationDuration, setAnimationDuration] = useState<number>(1000);
  const [mediaType, setMediaType] = useState<string>("webm");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  let options: any = {};

  switch (type) {
    case "line":
      options = lineOptions;
      break;
    case "bar":
      options = barOptions;
      break;
    case "pie":
      options = pieOptions;
      break;
    case "scatter":
      options = scatterOptions;
      break;
    case "radar":
      options = radarOptions;
      break;
    default:
      options = {};
  }

  const chartRef = useRef<any>(null); // echarts-for-react does not export a proper ref type
  const containerRef = useRef<HTMLDivElement>(null);

  const [isRecording, setIsRecording] = useState(false);

  // when the container is resized, tell echarts to adjust
  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      const ech = chartRef.current?.getEchartsInstance();
      ech?.resize();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [chartRef]);

  // also listen for window resize to force chart resize in case
  React.useEffect(() => {
    const handler = () => {
      chartRef.current?.getEchartsInstance()?.resize();
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const startRecording = async () => {
    // force React to remount the chart so any built-in animation runs again
    setRecordKey(Date.now());

    // wait two frames for the new chart to finish initial render
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );

    const echartsInstance: any =
      chartRef.current && chartRef.current.getEchartsInstance();
    const canvas = echartsInstance?.getDom()?.querySelector("canvas");

    if (canvas) {
      setIsRecording(true);
      try {
        // include a small buffer beyond the animation so the chart settles
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

  return (
    <div className="chart-area grid grid-cols-1 md:grid-cols-[80%_1fr] gap-4">
      <div className="relative">
        {/* resizable wrapper with visible borders */}
        <div
          ref={containerRef}
          className="resizable-container"
          style={{
            resize: "both",
            overflow: "auto",
            border: "1px solid #ccc",
            padding: "8px",
            width: "600px",
            maxWidth: "100%", // never wider than viewport
            height: "400px",
          }}
        >
          <ReactECharts
            ref={chartRef}
            key={`${type}-${recordKey}`}
            option={{ ...options, animationDuration, backgroundColor }}
            // @ts-ignore: preserveDrawingBuffer is valid for the underlying canvas
            opts={{ renderer: "canvas", preserveDrawingBuffer: true }}
            style={{
              width: "100%",
              height: "100%",
              background: backgroundColor,
            }}
          />
        </div>
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`${isRecording ? "bg-red-500 animate-pulse" : "bg-blue-600"} text-white px-4 py-2 rounded`}
        >
          {isRecording ? "Recording Frame by Frame..." : "Download Video"}
        </button>
        <div className="chart-context absolute flex gap-1 right-4 top-4">
          <div className="chart-context-menu  bg-white rounded shadow p-2">
            <HugeiconsIcon icon={Image01Icon} size={14} onClick={() => {}} />
          </div>
          <div className="chart-context-menu  bg-white rounded shadow p-2">
            <HugeiconsIcon
              icon={ComputerVideoIcon}
              size={14}
              onClick={() => {}}
            />
          </div>
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
    </div>
  );
};
