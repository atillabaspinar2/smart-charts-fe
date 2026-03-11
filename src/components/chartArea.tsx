//create a new chart area component that will be used to display the charts
import React from "react";
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
import {
  ComputerVideoIcon,
  Download,
  Image01Icon,
  Video02Icon,
} from "@hugeicons/core-free-icons";

export const ChartArea: React.FC<{ type: string }> = ({ type }) => {
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

  return (
    <div className="chart-area grid grid-cols-1 md:grid-cols-[80%_1fr] gap-4">
      <div className="relative">
        <ReactECharts
          key={type}
          option={options}
          style={{ width: "100%", height: "400px" }}
        />
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
      <ChartOptions />
    </div>
  );
};
