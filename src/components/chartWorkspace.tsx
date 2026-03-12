import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChartSettingsPanel } from "./ChartSettingsPanel";
import { ChartItem } from "./chartItem";
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
  const [selectedChartInstanceId, setSelectedChartInstanceId] = useState<
    string | null
  >(null);

  const initializeChartSettings = (instanceId: string, type: string) => {
    const templateOptions: any = getOptionsByType(type);
    setChartSettingsMap((prev) => ({
      ...prev,
      [instanceId]: {
        animationDuration: templateOptions.animationDuration || 1000,
        backgroundColor: "#ffffff",
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
        } as ChartSettingsData);
      const next = { ...current, ...updates };

      const animationChanged =
        typeof updates.animationDuration === "number" &&
        updates.animationDuration !== current.animationDuration;
      const backgroundChanged =
        typeof updates.backgroundColor === "string" &&
        updates.backgroundColor !== current.backgroundColor;

      if (!animationChanged && !backgroundChanged) return prev;

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
    setSelectedChartInstanceId(instanceId);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("chartType");
    if (type) addChart(type);
  };

  return (
    <div
      className="chart-workspace grid grid-cols-1 md:grid-cols-[80%_1fr] gap-4"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <PanelView title="Chart Items" className="relative">
        <div
          ref={containerRef}
          className="multi-chart-container"
          style={{
            resize: "both",
            overflow: "auto",
            padding: "8px",
            width: "800px",
            maxWidth: "100%",
            height: "600px",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {charts.map((c) => (
            <ChartItem
              key={c.id}
              data={c}
              reanimateSignal={reanimateSignal}
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
            selectedChartType={
              charts.find((c) => c.instanceId === selectedChartInstanceId)
                ?.type || ""
            }
            onClose={() => setSelectedChartInstanceId(null)}
          />
        ) : (
          <p className="text-sm text-gray-500">
            Select a chart to edit settings.
          </p>
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
