import {
  BarChart,
  PieChart,
  ChartScatterIcon,
  LineChart,
  ChartRadarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const Sidebar: React.FC<{
  setChartType: (chartType: string) => void;
}> = ({ setChartType: createNewChart }) => {
  return (
    <ul className="space-y-2 col-1">
      <li>
        <a
          href="#"
          className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
        >
          <HugeiconsIcon
            icon={LineChart}
            onClick={() => createNewChart("line")}
          />
        </a>
      </li>

      <li>
        <a
          href="#"
          className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
        >
          <HugeiconsIcon
            icon={BarChart}
            onClick={() => createNewChart("bar")}
          />
        </a>
      </li>
      <li>
        <a
          href="#"
          className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
        >
          <HugeiconsIcon
            icon={PieChart}
            onClick={() => createNewChart("pie")}
          />
        </a>
      </li>
      <li>
        <a
          href="#"
          className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
        >
          <HugeiconsIcon
            icon={ChartScatterIcon}
            onClick={() => createNewChart("scatter")}
          />
        </a>
      </li>
      <li>
        <a
          href="#"
          className="flex items-center p-2 rounded hover:bg-slate-700 transition-colors"
        >
          <HugeiconsIcon
            icon={ChartRadarIcon}
            onClick={() => createNewChart("radar")}
          />
        </a>
      </li>
    </ul>
  );
};
