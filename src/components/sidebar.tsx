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
  addChart: (chartType: string) => void;
}> = () => {
  return (
    <ul className="space-y-2 col-1">
      <li>
        <Tooltip content="Line chart">
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("chartType", "line")}
            className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
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
            className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
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
            className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
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
            className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
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
            className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
          >
            <HugeiconsIcon icon={ChartRadarIcon} />
          </div>
        </Tooltip>
      </li>
    </ul>
  );
};
