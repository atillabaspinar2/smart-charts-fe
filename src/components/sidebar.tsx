import {
  BarChart,
  PieChart,
  ChartScatterIcon,
  LineChart,
  ChartRadarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tooltip } from "./UILibrary/Tooltip";

export const Sidebar: React.FC<{
  isMobileMode: boolean;
  pendingMobileChartType: string | null;
  onSelectMobileChartType: (chartType: string | null) => void;
}> = ({ isMobileMode, pendingMobileChartType, onSelectMobileChartType }) => {
  const getItemClassName = (chartType: string) => {
    const isActive = isMobileMode && pendingMobileChartType === chartType;
    return `flex items-center p-2 rounded transition-colors ${
      isActive ? "bg-slate-600 ring-2 ring-white/70" : "hover:bg-slate-700"
    }`;
  };

  const onSelectForMobilePlacement = (chartType: string) => {
    if (!isMobileMode) return;
    onSelectMobileChartType(chartType);
  };

  return (
    <ul className="space-y-2 col-1">
      <li>
        <Tooltip content="Line chart">
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("chartType", "line")}
            onClick={() => onSelectForMobilePlacement("line")}
            className={getItemClassName("line")}
          >
            <HugeiconsIcon icon={LineChart} />
          </div>
        </Tooltip>
      </li>

      <li>
        <Tooltip content="Bar chart">
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("chartType", "bar")}
            onClick={() => onSelectForMobilePlacement("bar")}
            className={getItemClassName("bar")}
          >
            <HugeiconsIcon icon={BarChart} />
          </div>
        </Tooltip>
      </li>
      <li>
        <Tooltip content="Pie chart">
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("chartType", "pie")}
            onClick={() => onSelectForMobilePlacement("pie")}
            className={getItemClassName("pie")}
          >
            <HugeiconsIcon icon={PieChart} />
          </div>
        </Tooltip>
      </li>
      <li>
        <Tooltip content="Scatter chart">
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("chartType", "scatter")}
            onClick={() => onSelectForMobilePlacement("scatter")}
            className={getItemClassName("scatter")}
          >
            <HugeiconsIcon icon={ChartScatterIcon} />
          </div>
        </Tooltip>
      </li>
      <li>
        <Tooltip content="Radar chart">
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("chartType", "radar")}
            onClick={() => onSelectForMobilePlacement("radar")}
            className={getItemClassName("radar")}
          >
            <HugeiconsIcon icon={ChartRadarIcon} />
          </div>
        </Tooltip>
      </li>
    </ul>
  );
};
