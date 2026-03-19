import { useEffect, useState, type FC } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ECHARTS_THEMES } from "../assets/themes/registerThemes";
import type { DataOrientation } from "../utils/spreadsheetImport";

interface ChartSettingsPanelProps {
  animationDuration: number;
  setAnimationDuration: (v: number) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  mediaType: string;
  setMediaType: (v: string) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  selectedChartType?: string;
  onClose?: () => void;
  workspaceTheme?: string;
  setWorkspaceTheme?: (theme: string) => void;
  onApplyThemeColors?: () => void;
  onApplyThemeColorsToAll?: () => void;
  dataOrientation?: DataOrientation;
  setDataOrientation?: (orientation: DataOrientation) => void;
}

export const ChartSettingsPanel: FC<ChartSettingsPanelProps> = ({
  animationDuration,
  setAnimationDuration,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  mediaType,
  setMediaType,
  backgroundColor,
  setBackgroundColor,
  title,
  setTitle,
  selectedChartType,
  onClose,
  workspaceTheme,
  setWorkspaceTheme,
  onApplyThemeColors,
  onApplyThemeColorsToAll,
  dataOrientation,
  setDataOrientation,
}) => {
  const [animationInput, setAnimationInput] = useState(
    String(animationDuration),
  );
  const [fontSizeInput, setFontSizeInput] = useState(String(fontSize));

  useEffect(() => {
    setAnimationInput(String(animationDuration));
  }, [animationDuration]);

  useEffect(() => {
    setFontSizeInput(String(fontSize));
  }, [fontSize]);

  const handleAnimationChange = (value: string = "1000") => {
    if (!/^\d*$/.test(value)) return;
    setAnimationInput(value);
  };

  const handleFontSizeChange = (value: string = "12") => {
    if (!/^\d*$/.test(value)) return;
    setFontSizeInput(value);
  };

  useEffect(() => {
    if (animationInput === "") return;
    const parsed = Number(animationInput);
    if (parsed === animationDuration) return;
    const timeout = setTimeout(() => {
      setAnimationDuration(parsed);
    }, 500);
    return () => clearTimeout(timeout);
  }, [animationInput, animationDuration, setAnimationDuration]);

  useEffect(() => {
    if (fontSizeInput === "") return;
    const parsed = Number(fontSizeInput);
    if (parsed === fontSize) return;
    const timeout = setTimeout(() => {
      setFontSize(Math.max(8, parsed));
    }, 500);
    return () => clearTimeout(timeout);
  }, [fontSizeInput, fontSize, setFontSize]);

  const panelTitle = selectedChartType
    ? `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Settings`
    : "Canvas Options";

  const FONT_FAMILIES = ["Noto Sans", "Georgia", "Courier New", "Trebuchet MS"];
  const DEFAULT_THEME_SELECT_VALUE = "__default_theme__";

  return (
    <div className="chart-options p-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{panelTitle}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded"
            title="Close settings"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={20}
              className="text-gray-600"
            />
          </button>
        )}
      </div>

      <div className="mb-4">
        <Label
          htmlFor="settings-title"
          className="mb-1 block text-sm font-medium"
        >
          {selectedChartType ? "Chart Title" : "Title"}
        </Label>
        <Input
          id="settings-title"
          type="text"
          placeholder={
            selectedChartType ? "Enter chart title" : "Enter workspace title"
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-4">
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
          onChange={(e) => handleAnimationChange(e.target.value)}
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
          onChange={(e) => handleFontSizeChange(e.target.value)}
        />
      </div>

      {!selectedChartType && (
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
      )}
      <div className="mb-4">
        <Label className="block text-sm font-medium mb-1">
          Background Color
        </Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            aria-label="Background color"
            title="Pick background color"
            className="h-10 w-10 p-1 border border-gray-300 rounded-md cursor-pointer bg-white"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
          <span className="text-sm text-gray-600 uppercase">
            {backgroundColor}
          </span>
        </div>
      </div>

      {(selectedChartType === "line" || selectedChartType === "bar") &&
        dataOrientation &&
        setDataOrientation && (
          <div className="mb-4 rounded-md border border-border bg-background p-3">
            <p className="mb-2 text-sm font-medium">Data Orientation</p>
            <div className="inline-flex overflow-hidden rounded-md border border-border">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-medium ${
                  dataOrientation === "columns-as-series"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => setDataOrientation("columns-as-series")}
              >
                Columns as Series
              </button>
              <button
                type="button"
                className={`border-l border-border px-3 py-1.5 text-xs font-medium ${
                  dataOrientation === "rows-as-series"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => setDataOrientation("rows-as-series")}
              >
                Rows as Series
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Columns mode: first column values are x-axis labels. Rows mode:
              first row values are x-axis labels.
            </p>
          </div>
        )}

      {(selectedChartType === "line" || selectedChartType === "bar") &&
        onApplyThemeColors && (
          <div className="mb-4 rounded-md border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Series Colors</p>
              <Button size="sm" onClick={onApplyThemeColors}>
                Apply Theme Colors
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Applies current theme palette to all series in order. You can
              still override individual series colors from the Chart Data panel.
            </p>
          </div>
        )}

      {!selectedChartType && (
        <>
          <div className="mb-4">
            <Label className="mb-1 block text-sm font-medium">
              Chart Theme
            </Label>
            <Select
              value={
                workspaceTheme ? workspaceTheme : DEFAULT_THEME_SELECT_VALUE
              }
              onValueChange={(theme) =>
                setWorkspaceTheme?.(
                  theme === DEFAULT_THEME_SELECT_VALUE ? "" : theme,
                )
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
                <Button size="sm" onClick={onApplyThemeColorsToAll}>
                  Apply to All Charts
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Applies the current theme palette and background to all charts
                on the canvas.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
