import type { FC } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DataOrientation } from "@/utils/spreadsheetImport";
import type { LineSymbol, SketchTypographyPresetId } from "../chartTypes";
import { SketchChartOptionsSection } from "@/components/chartSettingsTabs/SketchChartOptionsSection";

const SYMBOL_OPTIONS: { value: LineSymbol; label: string }[] = [
  { value: "circle", label: "Circle" },
  { value: "rect", label: "Rectangle" },
  { value: "roundRect", label: "Rounded Rect" },
  { value: "triangle", label: "Triangle" },
  { value: "diamond", label: "Diamond" },
  { value: "pin", label: "Pin" },
  { value: "arrow", label: "Arrow" },
  { value: "none", label: "None" },
];

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
  lineStack?: boolean;
  setLineStack?: (value: boolean) => void;
  lineSymbol?: LineSymbol;
  setLineSymbol?: (value: LineSymbol) => void;
  lineSymbolSize?: number;
  setLineSymbolSize?: (value: number) => void;
  lineSketchEnabled?: boolean;
  setLineSketchEnabled?: (value: boolean) => void;
  lineSketchIntensity?: number;
  setLineSketchIntensity?: (value: number) => void;
  sketchTypographyPreset?: SketchTypographyPresetId;
  setSketchTypographyPreset?: (value: SketchTypographyPresetId) => void;
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
  lineStack = false,
  setLineStack,
  lineSymbol = "circle",
  setLineSymbol,
  lineSymbolSize = 4,
  setLineSymbolSize,
  lineSketchEnabled = false,
  setLineSketchEnabled,
  lineSketchIntensity = 50,
  setLineSketchIntensity,
  sketchTypographyPreset = "indie-flower",
  setSketchTypographyPreset,
}) => {
  const intensityValue = Number.isFinite(lineSketchIntensity)
    ? Math.min(100, Math.max(0, lineSketchIntensity))
    : 50;

  return (
    <div className="space-y-4 pb-3">
      {setLineSketchEnabled &&
        setLineSketchIntensity &&
        setSketchTypographyPreset && (
          <SketchChartOptionsSection
            sketchEnabled={lineSketchEnabled}
            onSketchEnabledChange={setLineSketchEnabled}
            sketchIntensity={intensityValue}
            onSketchIntensityChange={setLineSketchIntensity}
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
        <Label className="text-xs">Show Series Name / Value</Label>
        <Switch checked={lineShowLabels} onCheckedChange={setLineShowLabels} />
      </div>

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
      <div className="flex items-center justify-between">
        <Label className="text-xs">Stack</Label>
        <Switch checked={lineStack} onCheckedChange={setLineStack} />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Symbol</Label>
        <Select
          value={lineSymbol}
          onValueChange={(v) => setLineSymbol?.(v as LineSymbol)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SYMBOL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Symbol Size</Label>
          <span className="text-xs text-muted-foreground">{lineSymbolSize}</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[lineSymbolSize]}
          onValueChange={([v]) => setLineSymbolSize?.(v)}
        />
      </div>
    </div>
  );
};
