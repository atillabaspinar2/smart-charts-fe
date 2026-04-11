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
import { ColorPicker } from "../ui/colorpicker";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

// Base type for all settings panels
export interface BaseSettingsPanelProps {
  title: string;
  setTitle: (v: string) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
}

// Canvas-specific settings panel props
export interface CanvasSettingsPanelProps extends BaseSettingsPanelProps {
  /** When no chart is selected: default title color for new charts / sync-all. */
  titleFontColor?: string;
  setTitleFontColor?: (v: string) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
  mediaType: string;
  setMediaType: (v: string) => void;
  workspaceTheme: string;
  setWorkspaceTheme: (theme: string) => void;
  onApplyThemeColorsToAll?: () => void;
  FONT_FAMILIES: string[];
  ECHARTS_THEMES: { value: string; label: string }[];
  DEFAULT_THEME_SELECT_VALUE: string;
}

export const CanvasSettingsPanel: FC<CanvasSettingsPanelProps> = ({
  title,
  setTitle,
  titleFontColor,
  setTitleFontColor,
  fontFamily,
  setFontFamily,
  backgroundColor,
  setBackgroundColor,
  mediaType,
  setMediaType,
  workspaceTheme,
  setWorkspaceTheme,
  onApplyThemeColorsToAll,
  FONT_FAMILIES,
  ECHARTS_THEMES,
  DEFAULT_THEME_SELECT_VALUE,
}) => (
  <>
  <div className="space-y-4 pb-3">
    <div className="space-y-1.5">
      <Label
        htmlFor="settings-title"
        className="text-xs"
      >
        Title
      </Label>
      <Input
        id="settings-title"
        type="text"
        placeholder="Enter workspace title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </div>
    <div className="space-y-1.5 flex items-center justify-between">
      <Label className="text-xs">Font Family</Label>
      <Select value={fontFamily} onValueChange={setFontFamily}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select font family" />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((family) => (
            <SelectItem key={family} value={family}>
              {family}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    {typeof titleFontColor === "string" && setTitleFontColor && (
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs shrink-0">Default chart title color</Label>
        <ColorPicker color={titleFontColor} onChange={setTitleFontColor} />
      </div>
    )}
    <div className="space-y-1.5 flex items-center justify-between">
      <Label className="text-xs ">Background Color</Label>
      <div className="flex items-center gap-3">
        <ColorPicker color={backgroundColor} onChange={setBackgroundColor} />
      </div>
    </div>
    <div className="space-y-1.5 flex items-center justify-between">
      <Label className="text-xs">Media Format</Label>
      <Select value={mediaType} onValueChange={setMediaType}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select media format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="webm">WebM</SelectItem>
          <SelectItem value="mp4">MP4</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-1.5 flex items-center justify-between">
      <Label className="text-xs">Chart Theme</Label>
      <Select
        value={workspaceTheme ? workspaceTheme : DEFAULT_THEME_SELECT_VALUE}
        onValueChange={(theme) =>
          setWorkspaceTheme(theme === DEFAULT_THEME_SELECT_VALUE ? "" : theme)
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select chart theme" />
        </SelectTrigger>
        <SelectContent>
          {ECHARTS_THEMES.map((theme) => (
            <SelectItem
              key={theme.value || DEFAULT_THEME_SELECT_VALUE}
              value={theme.value || DEFAULT_THEME_SELECT_VALUE}
            >
              {theme.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    {onApplyThemeColorsToAll && (
      <Card className="p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs">Series Colors</p>
          <Button  onClick={onApplyThemeColorsToAll}>
            Apply to All Charts
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Applies the current theme palette and background to all charts on the
          canvas.
        </p>
      </Card>
    )}
    </div>
  </>
);
