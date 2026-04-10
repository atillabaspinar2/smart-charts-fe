import type { FC } from "react";
import { SKETCH_ANIMATION_HINT } from "@/components/chartSettingsTabs/sketchAnimationHint";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { DataOrientation } from "@/utils/spreadsheetImport";
import { ColorPicker } from "../ui/colorpicker";

export interface BarChartStylesTabContentProps {
  dataOrientation?: DataOrientation;
  setDataOrientation?: (orientation: DataOrientation) => void;
  barSketchEnabled?: boolean;
  setBarSketchEnabled?: (value: boolean) => void;
  barSketchIntensity?: number;
  setBarSketchIntensity?: (value: number) => void;
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
  barSketchEnabled = false,
  setBarSketchEnabled,
  barSketchIntensity = 50,
  setBarSketchIntensity,
  barShowBackground,
  setBarShowBackground,
  barBackgroundColor,
  setBarBackgroundColor,
  barAxisOrientation,
  setBarAxisOrientation,
  barStackEnabled,
  setBarStackEnabled,
}) => {
  const barIntensity = Number.isFinite(barSketchIntensity)
    ? Math.min(100, Math.max(0, barSketchIntensity))
    : 50;

  return (
    <div className="space-y-4 pb-3">
      {setBarSketchEnabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Sketchy</Label>
            <Switch
              checked={barSketchEnabled}
              onCheckedChange={setBarSketchEnabled}
            />
          </div>
          {barSketchEnabled && setBarSketchIntensity && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Sketch intensity</Label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {barIntensity}
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[barIntensity]}
                onValueChange={([v]) => setBarSketchIntensity(v)}
              />
            </div>
          )}
          {barSketchEnabled && (
            <p className="text-[11px] text-muted-foreground leading-snug">
              {SKETCH_ANIMATION_HINT}
            </p>
          )}
        </div>
      )}

            {dataOrientation && setDataOrientation && (
        <div className="flex items-center justify-between">
          <Label className="text-xs">Columns as Series</Label>
          <Switch
            checked={dataOrientation === "columns-as-series"}
            onCheckedChange={(checked) =>
              setDataOrientation(checked ? "columns-as-series" : "rows-as-series")
            }
          />
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Bar Background</Label>
        <Switch
          checked={barShowBackground}
          onCheckedChange={setBarShowBackground}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="mb-1 block text-xs">
          Bar Background Color
        </Label>
        <div className="flex items-center gap-3">
          <ColorPicker
            color={barBackgroundColor}
            onChange={(color) => setBarBackgroundColor(color)}
          />
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


    </div>
  );
};
