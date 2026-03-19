import type { FC } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CommonLegendTabContentProps {
  showLegend: boolean;
  setShowLegend: (v: boolean) => void;
  legendTop: "top" | "bottom";
  setLegendTop: (v: "top" | "bottom") => void;
  legendLeft: "left" | "right" | "center";
  setLegendLeft: (v: "left" | "right" | "center") => void;
  legendOrient: "horizontal" | "vertical";
  setLegendOrient: (v: "horizontal" | "vertical") => void;
}

export const CommonLegendTabContent: FC<CommonLegendTabContentProps> = ({
  showLegend,
  setShowLegend,
  legendTop,
  setLegendTop,
  legendLeft,
  setLegendLeft,
  legendOrient,
  setLegendOrient,
}) => {
  return (
    <div className="space-y-4 pb-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Legend</Label>
        <Switch checked={showLegend} onCheckedChange={setShowLegend} />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Legend Position</Label>
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium ${
              legendTop === "top"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setLegendTop("top")}
          >
            Top
          </button>
          <button
            type="button"
            className={`border-l border-border px-3 py-1 text-xs font-medium ${
              legendTop === "bottom"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setLegendTop("bottom")}
          >
            Bottom
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Legend Align</Label>
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          {(["left", "center", "right"] as const).map((val, i) => (
            <button
              key={val}
              type="button"
              className={`${i > 0 ? "border-l border-border" : ""} px-3 py-1 text-xs font-medium capitalize ${
                legendLeft === val
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
              onClick={() => setLegendLeft(val)}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Legend Orient</Label>
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium ${
              legendOrient === "horizontal"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setLegendOrient("horizontal")}
          >
            Horizontal
          </button>
          <button
            type="button"
            className={`border-l border-border px-3 py-1 text-xs font-medium ${
              legendOrient === "vertical"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setLegendOrient("vertical")}
          >
            Vertical
          </button>
        </div>
      </div>
    </div>
  );
};
