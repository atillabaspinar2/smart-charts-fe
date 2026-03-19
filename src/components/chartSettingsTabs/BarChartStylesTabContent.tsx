import type { FC } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { DataOrientation } from "@/utils/spreadsheetImport";

export interface BarChartStylesTabContentProps {
  dataOrientation?: DataOrientation;
  setDataOrientation?: (orientation: DataOrientation) => void;
  barShowBackground: boolean;
  setBarShowBackground: (value: boolean) => void;
  barBackgroundColor: string;
  setBarBackgroundColor: (value: string) => void;
  barAxisOrientation: "vertical" | "horizontal";
  setBarAxisOrientation: (value: "vertical" | "horizontal") => void;
  barStackEnabled: boolean;
  setBarStackEnabled: (value: boolean) => void;
}

export const BarChartStylesTabContent: FC<BarChartStylesTabContentProps> = ({
  dataOrientation,
  setDataOrientation,
  barShowBackground,
  setBarShowBackground,
  barBackgroundColor,
  setBarBackgroundColor,
  barAxisOrientation,
  setBarAxisOrientation,
  barStackEnabled,
  setBarStackEnabled,
}) => {
  return (
    <div className="space-y-4 pb-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Bar Background</Label>
        <Switch
          checked={barShowBackground}
          onCheckedChange={setBarShowBackground}
        />
      </div>

      <div>
        <Label className="mb-1 block text-sm font-medium">
          Bar Background Color
        </Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            aria-label="Bar background color"
            title="Pick bar background color"
            className="h-10 w-10 rounded-md border border-gray-300 bg-white p-1 cursor-pointer"
            value={barBackgroundColor}
            onChange={(e) => setBarBackgroundColor(e.target.value)}
          />
          <span className="text-sm text-gray-600 uppercase">
            {barBackgroundColor}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Orientation</Label>
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium ${
              barAxisOrientation === "vertical"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setBarAxisOrientation("vertical")}
          >
            Vertical
          </button>
          <button
            type="button"
            className={`border-l border-border px-3 py-1 text-xs font-medium ${
              barAxisOrientation === "horizontal"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setBarAxisOrientation("horizontal")}
          >
            Horizontal
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Stack Bars</Label>
        <Switch
          checked={barStackEnabled}
          onCheckedChange={setBarStackEnabled}
        />
      </div>

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

      <p className="text-xs text-muted-foreground">
        Horizontal orientation maps x-axis to value and y-axis to category data.
      </p>
    </div>
  );
};
