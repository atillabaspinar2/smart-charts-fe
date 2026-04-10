import { useEffect, useState, type FC } from "react";
// Removed unused UI imports after refactor
import { ECHARTS_THEMES } from "../assets/themes/registerThemes";
import {
  CanvasSettingsPanel,
  type CanvasSettingsPanelProps,
} from "./chartSettingsTabs/CanvasSettingsPanel";
import {
  LineChartSettingsPanel,
  type LineChartSettingsPanelProps,
} from "./chartSettingsTabs/LineChartSettingsPanel";
import {
  BarChartSettingsPanel,
  type BarChartSettingsPanelProps,
} from "./chartSettingsTabs/BarChartSettingsPanel";
import {
  PieChartSettingsPanel,
  type PieChartSettingsPanelProps,
} from "./chartSettingsTabs/PieChartSettingsPanel";
import MapChartSettingsPanel, {
  type MapChartSettingsPanelProps,
} from "./chartSettingsTabs/MapChartSettingsPanel";

// Compose the main ChartSettingsPanelProps from all relevant panel/tab types
export type ChartSettingsPanelProps = {
  animationDuration: number;
  setAnimationDuration: (v: number) => void;
  selectedChartType?: string;
  // Used for internal state
  workspaceTheme?: string;
  setWorkspaceTheme?: (theme: string) => void;
  onApplyThemeColorsToAll?: () => void;
} & Partial<CanvasSettingsPanelProps> &
  Partial<LineChartSettingsPanelProps> &
  Partial<BarChartSettingsPanelProps> &
  Partial<PieChartSettingsPanelProps> &
  Partial<MapChartSettingsPanelProps>;

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
    barSketchEnabled = false,
    setBarSketchEnabled = () => {},
    barSketchIntensity = 50,
    setBarSketchIntensity = () => {},
    lineShowLabels = false,
    setLineShowLabels = () => {},
    lineSmooth = false,
    setLineSmooth = () => {},
    lineStep = false,
    setLineStep = () => {},
    lineArea = false,
    setLineArea = () => {},
    lineStack = false,
    setLineStack = () => {},
    lineSymbol = "circle",
    setLineSymbol = () => {},
    lineSymbolSize = 4,
    setLineSymbolSize = () => {},
    lineSketchEnabled = false,
    setLineSketchEnabled = () => {},
    lineSketchIntensity = 50,
    setLineSketchIntensity = () => {},
    pieSettings,
    setPieSettings,
    mapSettings,
    setMapSettings,
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
  const isLineChart = selectedChartType === "line";
  const isBarChart = selectedChartType === "bar";
  const isMapChart = selectedChartType === "map";

  useEffect(() => {
    setAnimationInput(String(animationDuration));
  }, [animationDuration]);

  useEffect(() => {
    if (isLineChart || isBarChart) {
      setActiveChartAccordionItem("chart-data-styles");
      return;
    }
    if (isPieChart) {
      setActiveChartAccordionItem("pie-data-styles");
      return;
    }
    setActiveChartAccordionItem("");
  }, [isLineChart, isBarChart, isPieChart, selectedChartType]);

  useEffect(() => {
    if (animationInput === "") return;
    const parsed = Number(animationInput);
    if (parsed === animationDuration) return;
    const timeout = setTimeout(() => {
      setAnimationDuration(parsed);
    }, 500);
    return () => clearTimeout(timeout);
  }, [animationInput, animationDuration, setAnimationDuration]);

  return (
    <>
      {isMapChart &&
        mapSettings &&
        setMapSettings &&
        typeof fontSize === "number" &&
        typeof setFontSize === "function" && (
          <MapChartSettingsPanel
            activeChartAccordionItem={activeChartAccordionItem}
            setActiveChartAccordionItem={setActiveChartAccordionItem}
            title={title ?? ""}
            setTitle={setTitle ?? (() => {})}
            fontSize={fontSize}
            setFontSize={setFontSize}
            backgroundColor={backgroundColor ?? "#fff"}
            setBackgroundColor={setBackgroundColor ?? (() => {})}
            mapSettings={mapSettings}
            setMapSettings={setMapSettings}
          />
        )}
      {isLineChart &&
        typeof fontSize === "number" &&
        typeof setFontSize === "function" && (
          <LineChartSettingsPanel
            activeChartAccordionItem={activeChartAccordionItem}
            setActiveChartAccordionItem={setActiveChartAccordionItem}
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
            lineStack={lineStack}
            setLineStack={setLineStack}
            lineSymbol={lineSymbol}
            setLineSymbol={setLineSymbol}
            lineSymbolSize={lineSymbolSize}
            setLineSymbolSize={setLineSymbolSize}
            lineSketchEnabled={lineSketchEnabled}
            setLineSketchEnabled={setLineSketchEnabled}
            lineSketchIntensity={lineSketchIntensity}
            setLineSketchIntensity={setLineSketchIntensity}
            showLegend={showLegend}
            setShowLegend={setShowLegend}
            legendTop={legendTop}
            setLegendTop={setLegendTop}
            legendLeft={legendLeft}
            setLegendLeft={setLegendLeft}
            legendOrient={legendOrient}
            setLegendOrient={setLegendOrient}
            title={title ?? ""}
            setTitle={setTitle ?? (() => {})}
            fontSize={fontSize}
            setFontSize={setFontSize}
            backgroundColor={backgroundColor ?? "#fff"}
            setBackgroundColor={setBackgroundColor ?? (() => {})}
          />
        )}
      {isBarChart &&
        typeof fontSize === "number" &&
        typeof setFontSize === "function" && (
          <BarChartSettingsPanel
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
            barSketchEnabled={barSketchEnabled}
            setBarSketchEnabled={setBarSketchEnabled}
            barSketchIntensity={barSketchIntensity}
            setBarSketchIntensity={setBarSketchIntensity}
            showLegend={showLegend}
            setShowLegend={setShowLegend}
            legendTop={legendTop}
            setLegendTop={setLegendTop}
            legendLeft={legendLeft}
            setLegendLeft={setLegendLeft}
            legendOrient={legendOrient}
            setLegendOrient={setLegendOrient}
            title={title ?? ""}
            setTitle={setTitle ?? (() => {})}
            fontSize={fontSize}
            setFontSize={setFontSize}
            backgroundColor={backgroundColor ?? "#fff"}
            setBackgroundColor={setBackgroundColor ?? (() => {})}
          />
        )}
      {isPieChart &&
        pieSettings &&
        setPieSettings &&
        typeof fontSize === "number" &&
        typeof setFontSize === "function" && (
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
            title={title ?? ""}
            setTitle={setTitle ?? (() => {})}
            fontSize={fontSize}
            setFontSize={setFontSize}
            backgroundColor={backgroundColor ?? "#fff"}
            setBackgroundColor={setBackgroundColor ?? (() => {})}
          />
        )}
      {!isMapChart && !isLineChart && !isBarChart && !isPieChart && (
        <div className="chart-options p-1">
          <CanvasSettingsPanel
            title={title ?? ""}
            setTitle={setTitle ?? (() => {})}
            fontFamily={fontFamily ?? "Noto Sans"}
            setFontFamily={setFontFamily ?? (() => {})}
            backgroundColor={backgroundColor ?? "#fff"}
            setBackgroundColor={setBackgroundColor ?? (() => {})}
            mediaType={mediaType ?? "webm"}
            setMediaType={setMediaType ?? (() => {})}
            workspaceTheme={workspaceTheme || ""}
            setWorkspaceTheme={setWorkspaceTheme || (() => {})}
            onApplyThemeColorsToAll={onApplyThemeColorsToAll}
            FONT_FAMILIES={FONT_FAMILIES}
            ECHARTS_THEMES={ECHARTS_THEMES}
            DEFAULT_THEME_SELECT_VALUE={DEFAULT_THEME_SELECT_VALUE}
          />
        </div>
      )}
    </>
  );
};
