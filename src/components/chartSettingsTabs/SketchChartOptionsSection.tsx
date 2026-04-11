import type { FC } from "react";
import { SKETCH_ANIMATION_HINT } from "@/components/chartSettingsTabs/sketchAnimationHint";
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
import type { SketchTypographyPresetId } from "@/components/chartTypes";
import { SKETCH_TYPOGRAPHY_PRESET_OPTIONS } from "@/utils/sketchChartTypography";

export interface SketchChartOptionsSectionProps {
  sketchEnabled: boolean;
  onSketchEnabledChange: (value: boolean) => void;
  sketchIntensity: number;
  onSketchIntensityChange: (value: number) => void;
  sketchTypographyPreset: SketchTypographyPresetId;
  onSketchTypographyPresetChange: (value: SketchTypographyPresetId) => void;
}

/**
 * Shared sketch toggle, intensity, hand-drawn text preset, and animation hint.
 * Bottom border separates sketch from the rest of the style panel.
 */
export const SketchChartOptionsSection: FC<SketchChartOptionsSectionProps> = ({
  sketchEnabled,
  onSketchEnabledChange,
  sketchIntensity,
  onSketchIntensityChange,
  sketchTypographyPreset,
  onSketchTypographyPresetChange,
}) => {
  const intensityValue = Number.isFinite(sketchIntensity)
    ? Math.min(100, Math.max(0, sketchIntensity))
    : 50;

  return (
    <div className="space-y-3 border-b border-border/50 pb-4 mb-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Sketchy</Label>
        <Switch checked={sketchEnabled} onCheckedChange={onSketchEnabledChange} />
      </div>
      {sketchEnabled && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Sketch intensity</Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {intensityValue}
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[intensityValue]}
            onValueChange={([v]) => onSketchIntensityChange(v)}
          />
        </div>
      )}
      {sketchEnabled && (
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs shrink-0">Sketch text</Label>
          <Select
            value={sketchTypographyPreset}
            onValueChange={(v) =>
              onSketchTypographyPresetChange(v as SketchTypographyPresetId)
            }
          >
            <SelectTrigger className="h-8 text-xs max-w-[11rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SKETCH_TYPOGRAPHY_PRESET_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {sketchEnabled && (
        <p className="text-[11px] text-muted-foreground leading-snug">
          {SKETCH_ANIMATION_HINT}
        </p>
      )}
    </div>
  );
};
