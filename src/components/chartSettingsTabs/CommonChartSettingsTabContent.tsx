import type { FC } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "../ui/colorpicker";

export interface CommonChartSettingsTabContentProps {
  chartLabel: string;
  title: string;
  setTitle: (v: string) => void;
  fontSizeInput: string;
  onFontSizeChange: (value: string) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
}

export const CommonChartSettingsTabContent: FC<
  CommonChartSettingsTabContentProps
> = ({
  chartLabel,
  title,
  setTitle,
  fontSizeInput,
  onFontSizeChange,
  backgroundColor,
  setBackgroundColor,
}) => {
  return (
    <div className="space-y-4 pb-3">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="settings-title"
          className="mb-1 block text-xs font-medium"
        >
          {chartLabel} Title
        </Label>
        <Input
          id="settings-title"
          type="text"
          placeholder="Enter chart title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Label
          htmlFor="settings-font-size"
          className="mb-1 block text-xs font-medium"
        >
          Font Size (px)
        </Label>
        <Input
          id="settings-font-size"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={fontSizeInput}
          placeholder="12"
          onChange={(e) => onFontSizeChange(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="mb-1 block text-xs font-medium">
          Background Color
        </Label>
        <div className="flex items-center gap-3">
          <ColorPicker
            color={backgroundColor}
            onChange={(color) => setBackgroundColor(color)}
          />
         
        </div>
      </div>
    </div>
  );
};
