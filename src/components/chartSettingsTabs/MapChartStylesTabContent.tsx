import { type FC } from "react";

import { SKETCH_ANIMATION_HINT } from "@/components/chartSettingsTabs/sketchAnimationHint";
import type { MapChartSettings } from "@/components/chartTypes";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { ColorPicker } from "../ui/colorpicker";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { colorRanges } from "../mapChartOptions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface MapChartStylesTabContentProps {
  mapSettings: MapChartSettings;
  setMapSettings: (updates: Partial<MapChartSettings>) => void;
}

export const MapChartStylesTabContent: FC<MapChartStylesTabContentProps> = ({
  mapSettings,
  setMapSettings,
}) => {
  const mapIntensity = Number.isFinite(mapSettings.mapSketchIntensity ?? NaN)
    ? Math.min(100, Math.max(0, mapSettings.mapSketchIntensity ?? 50))
    : 50;

  return (
    <div className="space-y-4 pb-3">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Sketchy</Label>
          <Switch
            checked={Boolean(mapSettings.mapSketchEnabled)}
            onCheckedChange={(checked) =>
              setMapSettings({ mapSketchEnabled: checked })
            }
          />
        </div>
        {mapSettings.mapSketchEnabled && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Sketch intensity</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {mapIntensity}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[mapIntensity]}
              onValueChange={([v]) => setMapSettings({ mapSketchIntensity: v })}
            />
          </div>
        )}
        {mapSettings.mapSketchEnabled && (
          <p className="text-[11px] text-muted-foreground leading-snug">
            {SKETCH_ANIMATION_HINT}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Animation speed</Label>
          <span className="w-8 text-right text-xs text-muted-foreground">
            {mapSettings.animationDelayUpdateValue || 20}
          </span>
        </div>
        <Slider
          min={0}
          max={500}
          step={1}
          value={[mapSettings.animationDelayUpdateValue || 20]}
          onValueChange={([v]) =>
            setMapSettings({ animationDelayUpdateValue: v })
          }
        />
      </div>
      <div>
        <Label className="mb-1 block text-sm font-medium">Label Color</Label>
        <div className="flex items-center gap-3">
          <ColorPicker
            color={mapSettings.labelFontColor || "#000"}
            onChange={(color) => setMapSettings({ labelFontColor: color })}
          />
          <span className="text-sm text-gray-600 uppercase">
            {mapSettings.labelFontColor || "#000"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Label</Label>
        <Switch
          checked={mapSettings.showLabel || false}
          onCheckedChange={(checked) => setMapSettings({ showLabel: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show values</Label>
        <Switch
          checked={Boolean(mapSettings.showMapValues)}
          onCheckedChange={(checked) =>
            setMapSettings({ showMapValues: checked })
          }
        />
      </div>
      <div>
        <Label
          htmlFor="settings-font-size"
          className="mb-1 block text-sm font-medium"
        >
          Font Size (px)
        </Label>
        <Input
          id="settings-font-size"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={mapSettings.labelFontSize || 12}
          placeholder="12"
          onChange={(e) =>
            setMapSettings({ labelFontSize: Number(e.target.value) })
          }
        />
      </div>
      <div>
        <Label
          htmlFor="settings-font-size"
          className="mb-1 block text-sm font-medium"
        >
          Color range
        </Label>

        <Select
          value={mapSettings.visualMapColorRange}
          onValueChange={(value) =>
            setMapSettings({ visualMapColorRange: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select color range" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(colorRanges).map((range) => (
              <SelectItem key={range} value={range}>
                {/* show actual colors before the name, as a gradient from first color to last color */}
                <div
                  className="flex-1 h-4 w-8 rounded-xs "
                  style={{
                    background: `linear-gradient(to right, ${colorRanges[range].join(", ")})`,
                  }}
                >
                  {" "}
                </div>

                <span>{range}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
