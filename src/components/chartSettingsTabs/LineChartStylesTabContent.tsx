import type { FC } from "react";
import type { DataOrientation } from "@/utils/spreadsheetImport";

interface LineChartStylesTabContentProps {
  dataOrientation?: DataOrientation;
  setDataOrientation?: (orientation: DataOrientation) => void;
  lineShowLabels?: boolean;
  setLineShowLabels?: (value: boolean) => void;
  lineSmooth?: boolean;
  setLineSmooth?: (value: boolean) => void;
  lineStep?: boolean;
  setLineStep?: (value: boolean) => void;
  lineArea?: boolean;
  setLineArea?: (value: boolean) => void;
}

export const LineChartStylesTabContent: FC<LineChartStylesTabContentProps> = ({
  dataOrientation,
  setDataOrientation,
  lineShowLabels = false,
  setLineShowLabels,
  lineSmooth = false,
  setLineSmooth,
  lineStep = false,
  setLineStep,
  lineArea = false,
  setLineArea,
}) => {
  return (
    <div className="space-y-4 pb-3">
      {dataOrientation && setDataOrientation && (
        <div>
          <p className="mb-2 text-sm font-medium">Data Orientation</p>
          <div className="inline-flex overflow-hidden rounded-md border border-border">
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-medium ${
                dataOrientation === "columns-as-series"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
              onClick={() => setDataOrientation("columns-as-series")}
            >
              Columns as Series
            </button>
            <button
              type="button"
              className={`border-l border-border px-3 py-1.5 text-xs font-medium ${
                dataOrientation === "rows-as-series"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
              onClick={() => setDataOrientation("rows-as-series")}
            >
              Rows as Series
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Columns mode: first column values are x-axis labels. Rows mode:
            first row values are x-axis labels.
          </p>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium">Show Series Name / Value</p>
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium ${
              lineShowLabels
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setLineShowLabels?.(true)}
          >
            True
          </button>
          <button
            type="button"
            className={`border-l border-border px-3 py-1.5 text-xs font-medium ${
              !lineShowLabels
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setLineShowLabels?.(false)}
          >
            False
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Series Style</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lineSmooth}
              onChange={(e) => setLineSmooth?.(e.target.checked)}
            />
            Smooth
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lineStep}
              onChange={(e) => setLineStep?.(e.target.checked)}
            />
            Step
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lineArea}
              onChange={(e) => setLineArea?.(e.target.checked)}
            />
            Area
          </label>
        </div>
      </div>
    </div>
  );
};
