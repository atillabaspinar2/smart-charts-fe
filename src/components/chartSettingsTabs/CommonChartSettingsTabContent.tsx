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
  titleFontColor: string;
  setTitleFontColor: (v: string) => void;
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
  titleFontColor,
  setTitleFontColor,
  backgroundColor,
  setBackgroundColor,
}) => {
  return (
    <div className="space-y-4 pb-3">
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor="settings-title"
          className="text-xs font-medium shrink-0"
        >
          {chartLabel} Title
        </Label>
        <Input
          id="settings-title"
          type="text"
          placeholder="Enter chart title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="max-w-[min(100%,14rem)]"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor="settings-font-size"
          className="text-xs font-medium shrink-0"
        >
          Title font size (px)
        </Label>
        <Input
          id="settings-font-size"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={fontSizeInput}
          placeholder="20"
          onChange={(e) => onFontSizeChange(e.target.value)}
          className="w-16 tabular-nums"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium shrink-0">Title font color</Label>
        <div className="flex items-center gap-2">
          <ColorPicker
            color={titleFontColor}
            onChange={setTitleFontColor}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label className="mb-1 block text-xs font-medium">
          Background Color
        </Label>
        <div className="flex items-center gap-3">
          <ColorPicker
            color={backgroundColor}
            onChange={setBackgroundColor}
          />
        </div>
      </div>
    </div>
  );
};
