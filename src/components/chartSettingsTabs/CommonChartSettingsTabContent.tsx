import type { FC } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CommonChartSettingsTabContentProps {
  chartLabel: string;
  title: string;
  setTitle: (v: string) => void;
  animationInput: string;
  onAnimationChange: (value: string) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
  fontFamilies: string[];
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
  animationInput,
  onAnimationChange,
  fontFamily,
  setFontFamily,
  fontFamilies,
  fontSizeInput,
  onFontSizeChange,
  backgroundColor,
  setBackgroundColor,
}) => {
  return (
    <div className="space-y-4 pb-3">
      <div>
        <Label
          htmlFor="settings-title"
          className="mb-1 block text-sm font-medium"
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
          htmlFor="settings-animation"
          className="mb-1 block text-sm font-medium"
        >
          Animation (ms)
        </Label>
        <Input
          id="settings-animation"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={animationInput}
          placeholder="1000"
          onChange={(e) => onAnimationChange(e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-1 block text-sm font-medium">Font Family</Label>
        <Select value={fontFamily} onValueChange={setFontFamily}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select font family" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((family) => (
              <SelectItem key={family} value={family}>
                {family}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          value={fontSizeInput}
          placeholder="12"
          onChange={(e) => onFontSizeChange(e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-1 block text-sm font-medium">
          Background Color
        </Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            aria-label="Background color"
            title="Pick background color"
            className="h-10 w-10 rounded-md border border-gray-300 bg-white p-1 cursor-pointer"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
          <span className="text-sm text-gray-600 uppercase">
            {backgroundColor}
          </span>
        </div>
      </div>
    </div>
  );
};
