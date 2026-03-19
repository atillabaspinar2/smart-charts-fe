import type { FC } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { DataOrientation } from "@/utils/spreadsheetImport";

export interface LineChartStylesTabContentProps {
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

      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Series Name / Value</Label>
        <Switch checked={lineShowLabels} onCheckedChange={setLineShowLabels} />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Series Style</p>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Smooth</Label>
          <Switch checked={lineSmooth} onCheckedChange={setLineSmooth} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Step</Label>
          <Switch checked={lineStep} onCheckedChange={setLineStep} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Area</Label>
          <Switch checked={lineArea} onCheckedChange={setLineArea} />
        </div>
      </div>
    </div>
  );
};
