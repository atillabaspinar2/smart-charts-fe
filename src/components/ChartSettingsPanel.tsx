import { useEffect, useState, type FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { BarChartStylesTabContent } from "./chartSettingsTabs/BarChartStylesTabContent";
import { CommonChartSettingsTabContent } from "./chartSettingsTabs/CommonChartSettingsTabContent";
import { CommonLegendTabContent } from "./chartSettingsTabs/CommonLegendTabContent";
import { LineChartStylesTabContent } from "./chartSettingsTabs/LineChartStylesTabContent";
import { PieChartStylesTabContent } from "./chartSettingsTabs/PieChartStylesTabContent";

interface ChartSettingsPanelProps {
  animationDuration: number;
  setAnimationDuration: (v: number) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
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
  barShowBackground?: boolean;
  setBarShowBackground?: (value: boolean) => void;
  barBackgroundColor?: string;
  setBarBackgroundColor?: (value: string) => void;
  barAxisOrientation?: "vertical" | "horizontal";
  setBarAxisOrientation?: (value: "vertical" | "horizontal") => void;
  barStackEnabled?: boolean;
  setBarStackEnabled?: (value: boolean) => void;
  lineShowLabels?: boolean;
  setLineShowLabels?: (value: boolean) => void;
  lineSmooth?: boolean;
  setLineSmooth?: (value: boolean) => void;
  lineStep?: boolean;
  setLineStep?: (value: boolean) => void;
  lineArea?: boolean;
  setLineArea?: (value: boolean) => void;
  pieSettings?: PieChartSettings;
  setPieSettings?: (updates: Partial<PieChartSettings>) => void;
  // Only present for per-chart context
  fontSize?: number;
  setFontSize?: (v: number) => void;
}

export const ChartSettingsPanel: FC<ChartSettingsPanelProps> = ({
  animationDuration,
  setAnimationDuration,
  fontFamily,
  setFontFamily,
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
  barShowBackground = false,
  setBarShowBackground = () => {},
  barBackgroundColor = "#f3f4f6",
  setBarBackgroundColor = () => {},
  barAxisOrientation = "vertical",
  setBarAxisOrientation = () => {},
  barStackEnabled = false,
  setBarStackEnabled = () => {},
  lineShowLabels = false,
  setLineShowLabels = () => {},
  lineSmooth = false,
  setLineSmooth = () => {},
  lineStep = false,
  setLineStep = () => {},
  lineArea = false,
  setLineArea = () => {},
  pieSettings,
  setPieSettings,
  fontSize,
  setFontSize,
}) => {
  const [animationInput, setAnimationInput] = useState(
    String(animationDuration),
  );
  // fontSize removed from global settings
  const [activeChartAccordionItem, setActiveChartAccordionItem] =
    useState<string>("");

  const FONT_FAMILIES = ["Noto Sans", "Georgia", "Courier New", "Trebuchet MS"];
  const DEFAULT_THEME_SELECT_VALUE = "__default_theme__";
  const isPieChart = selectedChartType === "pie";
  const isLineOrBarChart =
    selectedChartType === "line" || selectedChartType === "bar";

  useEffect(() => {
    setAnimationInput(String(animationDuration));
  }, [animationDuration]);

  // fontSize effect removed

  useEffect(() => {
    if (isLineOrBarChart) {
      setActiveChartAccordionItem("chart-data-styles");
      return;
    }
    if (isPieChart) {
      setActiveChartAccordionItem("pie-data-styles");
      return;
    }
    setActiveChartAccordionItem("");
  }, [isLineOrBarChart, isPieChart, selectedChartType]);

  const handleAnimationChange = (value: string = "1000") => {
    if (!/^\d*$/.test(value)) return;
    setAnimationInput(value);
  };

  // fontSize handler removed

  useEffect(() => {
    if (animationInput === "") return;
    const parsed = Number(animationInput);
    if (parsed === animationDuration) return;
    const timeout = setTimeout(() => {
      setAnimationDuration(parsed);
    }, 500);
    return () => clearTimeout(timeout);
  }, [animationInput, animationDuration, setAnimationDuration]);

  // fontSize effect removed

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

          {/* Font size removed from global settings */}
        </>
      )}

      {isLineOrBarChart &&
        typeof fontSize === "number" &&
        typeof setFontSize === "function" && (
          <Accordion
            type="single"
            collapsible
            value={activeChartAccordionItem}
            onValueChange={setActiveChartAccordionItem}
            className="mb-4"
          >
            <AccordionItem value="chart-data-styles">
              <AccordionTrigger className="text-sm font-medium">
                {selectedChartType === "line"
                  ? "Line Data Style"
                  : "Bar Data Style"}
              </AccordionTrigger>
              <AccordionContent>
                {selectedChartType === "line" ? (
                  <LineChartStylesTabContent
                    dataOrientation={dataOrientation}
                    setDataOrientation={setDataOrientation}
                    lineShowLabels={lineShowLabels}
                    setLineShowLabels={setLineShowLabels}
                    lineSmooth={lineSmooth}
                    setLineSmooth={setLineSmooth}
                    lineStep={lineStep}
                    setLineStep={setLineStep}
                    lineArea={lineArea}
                    setLineArea={setLineArea}
                  />
                ) : (
                  <BarChartStylesTabContent
                    dataOrientation={dataOrientation}
                    setDataOrientation={setDataOrientation}
                    barShowBackground={barShowBackground}
                    setBarShowBackground={setBarShowBackground}
                    barBackgroundColor={barBackgroundColor}
                    setBarBackgroundColor={setBarBackgroundColor}
                    barAxisOrientation={barAxisOrientation}
                    setBarAxisOrientation={setBarAxisOrientation}
                    barStackEnabled={barStackEnabled}
                    setBarStackEnabled={setBarStackEnabled}
                  />
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="chart-legend">
              <AccordionTrigger className="text-sm font-medium">
                Legend
              </AccordionTrigger>
              <AccordionContent>
                <CommonLegendTabContent
                  showLegend={showLegend}
                  setShowLegend={setShowLegend}
                  legendTop={legendTop}
                  setLegendTop={setLegendTop}
                  legendLeft={legendLeft}
                  setLegendLeft={setLegendLeft}
                  legendOrient={legendOrient}
                  setLegendOrient={setLegendOrient}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value={`${selectedChartType}-settings`}>
              <AccordionTrigger className="text-sm font-medium">
                Common Settings
              </AccordionTrigger>
              <AccordionContent>
                <CommonChartSettingsTabContent
                  chartLabel="Chart"
                  title={title}
                  setTitle={setTitle}
                  animationInput={animationInput}
                  onAnimationChange={handleAnimationChange}
                  fontSizeInput={String(fontSize)}
                  onFontSizeChange={(value) => setFontSize(Number(value))}
                  backgroundColor={backgroundColor}
                  setBackgroundColor={setBackgroundColor}
                />
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
        <div className="mb-4">
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
      )}

      {isPieChart &&
        pieSettings &&
        setPieSettings &&
        typeof fontSize === "number" &&
        typeof setFontSize === "function" && (
          <Accordion
            type="single"
            collapsible
            value={activeChartAccordionItem}
            onValueChange={setActiveChartAccordionItem}
            className="mb-4"
          >
            <AccordionItem value="pie-data-styles">
              <AccordionTrigger className="text-sm font-medium">
                Pie Data Style
              </AccordionTrigger>
              <AccordionContent>
                <PieChartStylesTabContent
                  pieSettings={pieSettings}
                  setPieSettings={setPieSettings}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pie-legend">
              <AccordionTrigger className="text-sm font-medium">
                Legend
              </AccordionTrigger>
              <AccordionContent>
                <CommonLegendTabContent
                  showLegend={showLegend}
                  setShowLegend={setShowLegend}
                  legendTop={legendTop}
                  setLegendTop={setLegendTop}
                  legendLeft={legendLeft}
                  setLegendLeft={setLegendLeft}
                  legendOrient={legendOrient}
                  setLegendOrient={setLegendOrient}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pie-settings">
              <AccordionTrigger className="text-sm font-medium">
                Common Settings
              </AccordionTrigger>
              <AccordionContent>
                <CommonChartSettingsTabContent
                  chartLabel="Chart"
                  title={title}
                  setTitle={setTitle}
                  animationInput={animationInput}
                  onAnimationChange={handleAnimationChange}
                  fontSizeInput={String(fontSize)}
                  onFontSizeChange={(value) => setFontSize(Number(value))}
                  backgroundColor={backgroundColor}
                  setBackgroundColor={setBackgroundColor}
                />
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
