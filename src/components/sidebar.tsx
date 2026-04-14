import React from "react";
import {
  BarChart,
  PieChart,
  LineChart,
  GlobalSearchIcon,
  QuestionIcon,
  LinerIcon,
  CircleIcon,
  TextIcon,
  Image02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tooltip } from "./UILibrary/Tooltip";
import { Separator } from "./ui/separator";

export const Sidebar: React.FC<{
  isMobileMode: boolean;
  pendingMobileChartType: string | null;
  setAboutOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectMobileChartType: (chartType: string | null) => void;
  onOpenAssistant?: () => void;
}> = ({
  isMobileMode,
  pendingMobileChartType,
  setAboutOpen,
  onSelectMobileChartType,
  onOpenAssistant,
}) => {
  const getItemClassName = (chartType: string) => {
    const isActive = isMobileMode && pendingMobileChartType === chartType;
    return `flex justify-center items-center p-2 rounded transition-colors ${
      isActive ? "bg-slate-600 ring-2 ring-white/70" : "hover:bg-slate-700"
    }`;
  };

  const onSelectForMobilePlacement = (chartType: string) => {
    if (!isMobileMode) return;
    onSelectMobileChartType(chartType);
  };

  return (
    <ul className="flex flex-col h-full space-y-2 col-1 relative">
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
        <Tooltip content="Map chart">
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("chartType", "map")}
            onClick={() => onSelectForMobilePlacement("map")}
            className={getItemClassName("map")}
          >
            <HugeiconsIcon icon={GlobalSearchIcon} />
          </div>
        </Tooltip>
      </li>
      <li>
        <Separator></Separator>
      </li>
      <li>
        <Tooltip content="Add line">
          <div
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData("annotationType", "line")
            }
            onClick={() => onSelectForMobilePlacement("lineAnnotation")}
            className={getItemClassName("lineAnnotation")}
          >
            <HugeiconsIcon icon={LinerIcon} />
          </div>
        </Tooltip>
      </li>
      <li>
        <Tooltip content="Add circle">
          <div
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData("annotationType", "circle")
            }
            onClick={() => onSelectForMobilePlacement("circleAnnotation")}
            className={getItemClassName("circleAnnotation")}
          >
            <HugeiconsIcon icon={CircleIcon} className="rotate-45" />
          </div>
        </Tooltip>
      </li>
      <li>
        <Tooltip content="Add text">
          <div
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData("annotationType", "text")
            }
            onClick={() => onSelectForMobilePlacement("textAnnotation")}
            className={getItemClassName("textAnnotation")}
          >
            <HugeiconsIcon icon={TextIcon} />
          </div>
        </Tooltip>
      </li>
      <li>
        <Tooltip content="Add image">
          <div
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData("annotationType", "image")
            }
            onClick={() => onSelectForMobilePlacement("imageAnnotation")}
            className={getItemClassName("imageAnnotation")}
          >
            <HugeiconsIcon icon={Image02Icon} />
          </div>
        </Tooltip>
      </li>
      {/* <li>
          <Dialog>
            <Tooltip content="Help / About">
              <DialogTrigger asChild>
                <div
                  className="flex justify-center items-center p-2 rounded transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={QuestionIcon} />
                </div>
              </DialogTrigger>
            </Tooltip>
            <DialogContent>
              <DialogTitle>Help</DialogTitle>
              <DialogDescription>
                How can we help you?
              </DialogDescription>
            </DialogContent>
          </Dialog>
          </div>
        </Tooltip>
      </li> */}
      {/* <li>
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
      </li> */}
      <li className="mt-auto">
        <Tooltip content="Assistant">
          <div
            className={getItemClassName("assistant")}
            onClick={() => onOpenAssistant?.()}
          >
            <HugeiconsIcon icon={TextIcon} />
          </div>
        </Tooltip>
      </li>
      <li>
        <Tooltip content="Help / About">
          <div
            className={getItemClassName("help")}
            onClick={() => setAboutOpen(true)}
          >
            <HugeiconsIcon icon={QuestionIcon} />
          </div>
        </Tooltip>
      </li>
    </ul>
  );
};
