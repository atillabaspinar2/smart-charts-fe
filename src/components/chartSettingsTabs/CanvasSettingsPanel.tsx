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

// Base type for all settings panels
export interface BaseSettingsPanelProps {
  title: string;
  setTitle: (v: string) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
}

// Canvas-specific settings panel props
export interface CanvasSettingsPanelProps extends BaseSettingsPanelProps {
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
    <div className="mb-4">
      <Label
        htmlFor="settings-title"
        className="mb-1 block text-sm font-medium"
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
    <div className="mb-4">
      <Label className="mb-1 block text-sm font-medium">Font Family</Label>
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
    <div className="mb-4">
      <Label className="mb-1 block text-sm font-medium">Background Color</Label>
      <div className="flex items-center gap-3">
        <ColorPicker color={backgroundColor} onChange={setBackgroundColor} />
        <span className="text-sm text-gray-600 uppercase">
          {backgroundColor}
        </span>
      </div>
    </div>
    <div className="mb-4">
      <Label className="mb-1 block text-sm font-medium">Media Format</Label>
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
    <div className="mb-4">
      <Label className="mb-1 block text-sm font-medium">Chart Theme</Label>
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
      <div className="mb-4 rounded-md border border-border bg-background p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Series Colors</p>
          <button className="btn btn-sm" onClick={onApplyThemeColorsToAll}>
            Apply to All Charts
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Applies the current theme palette and background to all charts on the
          canvas.
        </p>
      </div>
    )}
  </>
);
