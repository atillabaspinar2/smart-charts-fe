import type { FC } from "react";
import type { DataOrientation } from "@/utils/spreadsheetImport";

interface BarChartStylesTabContentProps {
  dataOrientation?: DataOrientation;
  setDataOrientation?: (orientation: DataOrientation) => void;
}

export const BarChartStylesTabContent: FC<BarChartStylesTabContentProps> = ({
  dataOrientation,
  setDataOrientation,
}) => {
  if (!dataOrientation || !setDataOrientation) {
    return null;
  }

  return (
    <div className="space-y-4 pb-3">
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
          Columns mode: first column values are x-axis labels. Rows mode: first
          row values are x-axis labels.
        </p>
      </div>
    </div>
  );
};
