import { useEffect, useState, type FC } from "react";
// Removed unused UI imports after refactor
import { ECHARTS_THEMES } from "../assets/themes/registerThemes";
import type { DataOrientation } from "../utils/spreadsheetImport";
import type { PieChartSettings } from "./chartTypes";
import { LineBarChartSettingsPanel } from "./chartSettingsTabs/LineBarChartSettingsPanel";
import { PieChartSettingsPanel } from "./chartSettingsTabs/PieChartSettingsPanel";
import { CanvasSettingsPanel } from "./chartSettingsTabs/CanvasSettingsPanel";

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

export const ChartSettingsPanel: FC<ChartSettingsPanelProps> = (props) => {
  const {
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
  } = props;

  const [animationInput, setAnimationInput] = useState(
    String(animationDuration),
  );
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

  useEffect(() => {
    if (animationInput === "") return;
    const parsed = Number(animationInput);
    if (parsed === animationDuration) return;
    const timeout = setTimeout(() => {
      setAnimationDuration(parsed);
    }, 500);
    return () => clearTimeout(timeout);
  }, [animationInput, animationDuration, setAnimationDuration]);

  if (
    isLineOrBarChart &&
    typeof fontSize === "number" &&
    typeof setFontSize === "function"
  ) {
    return (
      <LineBarChartSettingsPanel
        selectedChartType={selectedChartType!}
        activeChartAccordionItem={activeChartAccordionItem}
        setActiveChartAccordionItem={setActiveChartAccordionItem}
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
        lineShowLabels={lineShowLabels}
        setLineShowLabels={setLineShowLabels}
        lineSmooth={lineSmooth}
        setLineSmooth={setLineSmooth}
        lineStep={lineStep}
        setLineStep={setLineStep}
        lineArea={lineArea}
        setLineArea={setLineArea}
        showLegend={showLegend}
        setShowLegend={setShowLegend}
        legendTop={legendTop}
        setLegendTop={setLegendTop}
        legendLeft={legendLeft}
        setLegendLeft={setLegendLeft}
        legendOrient={legendOrient}
        setLegendOrient={setLegendOrient}
        title={title}
        setTitle={setTitle}
        animationInput={animationInput}
        onAnimationChange={handleAnimationChange}
        fontSize={fontSize}
        setFontSize={setFontSize}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />
    );
  }
  if (
    isPieChart &&
    pieSettings &&
    setPieSettings &&
    typeof fontSize === "number" &&
    typeof setFontSize === "function"
  ) {
    return (
      <PieChartSettingsPanel
        activeChartAccordionItem={activeChartAccordionItem}
        setActiveChartAccordionItem={setActiveChartAccordionItem}
        pieSettings={pieSettings}
        setPieSettings={setPieSettings}
        showLegend={showLegend}
        setShowLegend={setShowLegend}
        legendTop={legendTop}
        setLegendTop={setLegendTop}
        legendLeft={legendLeft}
        setLegendLeft={setLegendLeft}
        legendOrient={legendOrient}
        setLegendOrient={setLegendOrient}
        title={title}
        setTitle={setTitle}
        animationInput={animationInput}
        onAnimationChange={handleAnimationChange}
        fontSize={fontSize}
        setFontSize={setFontSize}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />
    );
  }
  // Canvas/global settings
  return (
    <div className="chart-options p-1">
      <CanvasSettingsPanel
        title={title}
        setTitle={setTitle}
        animationInput={animationInput}
        handleAnimationChange={handleAnimationChange}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        mediaType={mediaType}
        setMediaType={setMediaType}
        workspaceTheme={workspaceTheme || ""}
        setWorkspaceTheme={setWorkspaceTheme || (() => {})}
        onApplyThemeColorsToAll={onApplyThemeColorsToAll}
        FONT_FAMILIES={FONT_FAMILIES}
        ECHARTS_THEMES={ECHARTS_THEMES}
        DEFAULT_THEME_SELECT_VALUE={DEFAULT_THEME_SELECT_VALUE}
      />
    </div>
  );
};
