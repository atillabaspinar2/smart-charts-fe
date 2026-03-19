import { useEffect, useState, type FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ECHARTS_THEMES } from "../assets/themes/registerThemes";
import type { DataOrientation } from "../utils/spreadsheetImport";
import type { PieChartSettings } from "./chartTypes";

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
  showLegend?: boolean;
  setShowLegend?: (v: boolean) => void;
  legendTop?: "top" | "bottom";
  setLegendTop?: (v: "top" | "bottom") => void;
  legendLeft?: "left" | "right" | "center";
  setLegendLeft?: (v: "left" | "right" | "center") => void;
  legendOrient?: "horizontal" | "vertical";
  setLegendOrient?: (v: "horizontal" | "vertical") => void;
  selectedChartType?: string;
  workspaceTheme?: string;
  setWorkspaceTheme?: (theme: string) => void;
  onApplyThemeColorsToAll?: () => void;
  dataOrientation?: DataOrientation;
  setDataOrientation?: (orientation: DataOrientation) => void;
  pieSettings?: PieChartSettings;
  setPieSettings?: (updates: Partial<PieChartSettings>) => void;
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
  showLegend = true,
  setShowLegend = () => {},
  legendTop = "bottom",
  setLegendTop = () => {},
  legendLeft = "center",
  setLegendLeft = () => {},
  legendOrient = "horizontal",
  setLegendOrient = () => {},
  selectedChartType,
  workspaceTheme,
  setWorkspaceTheme,
  onApplyThemeColorsToAll,
  dataOrientation,
  setDataOrientation,
  pieSettings,
  setPieSettings,
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

  const FONT_FAMILIES = ["Noto Sans", "Georgia", "Courier New", "Trebuchet MS"];
  const DEFAULT_THEME_SELECT_VALUE = "__default_theme__";
  const isPieChart = selectedChartType === "pie";
  const isLineOrBarChart =
    selectedChartType === "line" || selectedChartType === "bar";

  return (
    <div className="chart-options p-1">
      {!isPieChart && !isLineOrBarChart && (
        <>
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
                selectedChartType
                  ? "Enter chart title"
                  : "Enter workspace title"
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
            <Label className="mb-1 block text-sm font-medium">
              Font Family
            </Label>
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
        </>
      )}

      {isLineOrBarChart && (
        <Accordion
          type="multiple"
          defaultValue={[
            `${selectedChartType}-settings`,
            "chart-data-styles",
            "chart-legend",
          ]}
          className="mb-4"
        >
          <AccordionItem value={`${selectedChartType}-settings`}>
            <AccordionTrigger className="text-sm font-medium capitalize">
              {selectedChartType} Settings
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-3">
              <div>
                <Label
                  htmlFor="settings-title"
                  className="mb-1 block text-sm font-medium"
                >
                  Chart Title
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
                  onChange={(e) => handleAnimationChange(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-1 block text-sm font-medium">
                  Font Family
                </Label>
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
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                />
              </div>

              <div>
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="chart-data-styles">
            <AccordionTrigger className="text-sm font-medium">
              Chart Data Styles
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-3">
              {dataOrientation && setDataOrientation && (
                <div>
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
                    Columns mode: first column values are x-axis labels. Rows
                    mode: first row values are x-axis labels.
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="chart-legend">
            <AccordionTrigger className="text-sm font-medium">
              Legend
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Legend</Label>
                <div className="inline-flex overflow-hidden rounded-md border border-border">
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-medium ${
                      showLegend
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setShowLegend(true)}
                  >
                    True
                  </button>
                  <button
                    type="button"
                    className={`border-l border-border px-3 py-1 text-xs font-medium ${
                      !showLegend
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setShowLegend(false)}
                  >
                    False
                  </button>
                </div>
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
                      className={`${
                        i > 0 ? "border-l border-border" : ""
                      } px-3 py-1 text-xs font-medium capitalize ${
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

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
      {!isPieChart && !isLineOrBarChart && (
        <>
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
        </>
      )}

      {isPieChart && pieSettings && setPieSettings && (
        <Accordion
          type="multiple"
          defaultValue={["pie-settings", "pie-data-styles", "pie-legend"]}
          className="mb-4"
        >
          <AccordionItem value="pie-settings">
            <AccordionTrigger className="text-sm font-medium">
              Pie Settings
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-3">
              <div>
                <Label
                  htmlFor="settings-title"
                  className="mb-1 block text-sm font-medium"
                >
                  Chart Title
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
                  onChange={(e) => handleAnimationChange(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-1 block text-sm font-medium">
                  Font Family
                </Label>
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
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                />
              </div>

              <div>
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pie-data-styles">
            <AccordionTrigger className="text-sm font-medium">
              Chart Data Styles
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Inner Radius</Label>
                  <span className="text-xs text-muted-foreground w-8 text-right">
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
                  <span className="text-xs text-muted-foreground w-8 text-right">
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
                  <span className="text-xs text-muted-foreground w-8 text-right">
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
                  <span className="text-xs text-muted-foreground w-8 text-right">
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
                <div className="inline-flex overflow-hidden rounded-md border border-border">
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-medium ${
                      pieSettings.showLabel
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setPieSettings({ showLabel: true })}
                  >
                    True
                  </button>
                  <button
                    type="button"
                    className={`border-l border-border px-3 py-1 text-xs font-medium ${
                      !pieSettings.showLabel
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setPieSettings({ showLabel: false })}
                  >
                    False
                  </button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pie-legend">
            <AccordionTrigger className="text-sm font-medium">
              Legend
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Legend</Label>
                <div className="inline-flex overflow-hidden rounded-md border border-border">
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-medium ${
                      showLegend
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setShowLegend(true)}
                  >
                    True
                  </button>
                  <button
                    type="button"
                    className={`border-l border-border px-3 py-1 text-xs font-medium ${
                      !showLegend
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setShowLegend(false)}
                  >
                    False
                  </button>
                </div>
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
                      className={`${
                        i > 0 ? "border-l border-border" : ""
                      } px-3 py-1 text-xs font-medium capitalize ${
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
