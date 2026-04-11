import type { FC } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { DataOrientation } from "@/utils/spreadsheetImport";
import { ColorPicker } from "../ui/colorpicker";
import type { SketchTypographyPresetId } from "../chartTypes";
import { SketchChartOptionsSection } from "@/components/chartSettingsTabs/SketchChartOptionsSection";

export interface BarChartStylesTabContentProps {
  dataOrientation?: DataOrientation;
  setDataOrientation?: (orientation: DataOrientation) => void;
  barSketchEnabled?: boolean;
  setBarSketchEnabled?: (value: boolean) => void;
  barSketchIntensity?: number;
  setBarSketchIntensity?: (value: number) => void;
  sketchTypographyPreset?: SketchTypographyPresetId;
  setSketchTypographyPreset?: (value: SketchTypographyPresetId) => void;
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
  sketchTypographyPreset = "indie-flower",
  setSketchTypographyPreset,
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
      {setBarSketchEnabled &&
        setBarSketchIntensity &&
        setSketchTypographyPreset && (
          <SketchChartOptionsSection
            sketchEnabled={barSketchEnabled}
            onSketchEnabledChange={setBarSketchEnabled}
            sketchIntensity={barIntensity}
            onSketchIntensityChange={setBarSketchIntensity}
            sketchTypographyPreset={sketchTypographyPreset}
            onSketchTypographyPresetChange={setSketchTypographyPreset}
          />
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
