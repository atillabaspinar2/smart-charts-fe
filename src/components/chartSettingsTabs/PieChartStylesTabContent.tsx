import type { FC } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { PieChartSettings } from "@/components/chartTypes";

export interface PieChartStylesTabContentProps {
  pieSettings: PieChartSettings;
  setPieSettings: (updates: Partial<PieChartSettings>) => void;
}

export const PieChartStylesTabContent: FC<PieChartStylesTabContentProps> = ({
  pieSettings,
  setPieSettings,
}) => {
  return (
    <div className="space-y-4 pb-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Inner Radius</Label>
          <span className="w-8 text-right text-xs text-muted-foreground">
            {pieSettings.innerRadius}%
          </span>
        </div>
        <Slider
          min={0}
          max={pieSettings.outerRadius - 5}
          step={1}
          value={[pieSettings.innerRadius]}
          onValueChange={([v]) => setPieSettings({ innerRadius: v })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Outer Radius</Label>
          <span className="w-8 text-right text-xs text-muted-foreground">
            {pieSettings.outerRadius}%
          </span>
        </div>
        <Slider
          min={pieSettings.innerRadius + 5}
          max={90}
          step={1}
          value={[pieSettings.outerRadius]}
          onValueChange={([v]) => setPieSettings({ outerRadius: v })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Pad Angle</Label>
          <span className="w-8 text-right text-xs text-muted-foreground">
            {pieSettings.padAngle}
          </span>
        </div>
        <Slider
          min={0}
          max={20}
          step={1}
          value={[pieSettings.padAngle]}
          onValueChange={([v]) => setPieSettings({ padAngle: v })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Border Width</Label>
          <span className="w-8 text-right text-xs text-muted-foreground">
            {pieSettings.borderWidth}
          </span>
        </div>
        <Slider
          min={0}
          max={30}
          step={1}
          value={[pieSettings.borderWidth]}
          onValueChange={([v]) => setPieSettings({ borderWidth: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Type</Label>
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium ${
              pieSettings.chartType === "pie"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setPieSettings({ chartType: "pie" })}
          >
            Pie
          </button>
          <button
            type="button"
            className={`border-l border-border px-3 py-1 text-xs font-medium ${
              pieSettings.chartType === "funnel"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setPieSettings({ chartType: "funnel" })}
          >
            Funnel
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Style</Label>
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium ${
              pieSettings.roseType === "area"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setPieSettings({ roseType: "area" })}
          >
            Rose
          </button>
          <button
            type="button"
            className={`border-l border-border px-3 py-1 text-xs font-medium ${
              pieSettings.roseType === false
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setPieSettings({ roseType: false })}
          >
            Normal
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Label</Label>
        <Switch
          checked={pieSettings.showLabel}
          onCheckedChange={(checked) => setPieSettings({ showLabel: checked })}
        />
      </div>
    </div>
  );
};
