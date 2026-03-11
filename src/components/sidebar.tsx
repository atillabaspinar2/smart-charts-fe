import {
  BarChart,
  PieChart,
  ChartScatterIcon,
  LineChart,
  ChartRadarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const Sidebar: React.FC<{
  addChart: (chartType: string) => void;
}> = ({ addChart }) => {
  return (
    <ul className="space-y-2 col-1">
      <li>
        <a
          href="#"
          draggable
          onDragStart={(e) => e.dataTransfer.setData("chartType", "line")}
          className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
        >
          <HugeiconsIcon icon={LineChart} onClick={() => addChart("line")} />
        </a>
      </li>

      <li>
        <a
          href="#"
          draggable
          onDragStart={(e) => e.dataTransfer.setData("chartType", "bar")}
          className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
        >
          <HugeiconsIcon icon={BarChart} onClick={() => addChart("bar")} />
        </a>
      </li>
      <li>
        <a
          href="#"
          draggable
          onDragStart={(e) => e.dataTransfer.setData("chartType", "pie")}
          className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
        >
          <HugeiconsIcon icon={PieChart} onClick={() => addChart("pie")} />
        </a>
      </li>
      <li>
        <a
          href="#"
          draggable
          onDragStart={(e) => e.dataTransfer.setData("chartType", "scatter")}
          className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
        >
          <HugeiconsIcon
            icon={ChartScatterIcon}
            onClick={() => addChart("scatter")}
          />
        </a>
      </li>
      <li>
        <a
          href="#"
          draggable
          onDragStart={(e) => e.dataTransfer.setData("chartType", "radar")}
          className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
        >
          <HugeiconsIcon
            icon={ChartRadarIcon}
            onClick={() => addChart("radar")}
          />
        </a>
      </li>
    </ul>
  );
};
