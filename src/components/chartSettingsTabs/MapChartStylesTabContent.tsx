import type { FC } from "react";

import type { MapChartSettings } from "@/components/chartTypes";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

export interface MapChartStylesTabContentProps {
  mapSettings: MapChartSettings;
  setMapSettings: (updates: Partial<MapChartSettings>) => void;
}

export const MapChartStylesTabContent: FC<MapChartStylesTabContentProps> = ({
  mapSettings,
  setMapSettings,
}) => {
  return (
    <div className="space-y-4 pb-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Animation speed</Label>
          <span className="w-8 text-right text-xs text-muted-foreground">
            {mapSettings.animationDelayUpdateValue || 50}
          </span>
        </div>
        <Slider
          min={0}
          max={mapSettings.animationDelayUpdateValue || 100 - 5}
          step={1}
          value={[mapSettings.animationDelayUpdateValue || 100]}
          onValueChange={([v]) =>
            setMapSettings({ animationDelayUpdateValue: v })
          }
        />
      </div>
    </div>
  );
};
