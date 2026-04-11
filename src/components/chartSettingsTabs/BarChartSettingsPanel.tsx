import type { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BarChartStylesTabContent } from "./BarChartStylesTabContent";
import { CommonLegendTabContent } from "./CommonLegendTabContent";
import { CommonChartSettingsTabContent } from "./CommonChartSettingsTabContent";
import type { DataOrientation } from "../../utils/spreadsheetImport";
import type { SketchTypographyPresetId } from "../chartTypes";

export interface BarChartSettingsPanelProps {
  activeChartAccordionItem: string;
  setActiveChartAccordionItem: (v: string) => void;
  dataOrientation?: DataOrientation;
  setDataOrientation?: (orientation: DataOrientation) => void;
  barShowBackground: boolean;
  setBarShowBackground: (value: boolean) => void;
  barBackgroundColor: string;
  setBarBackgroundColor: (value: string) => void;
  barAxisOrientation: "vertical" | "horizontal";
  setBarAxisOrientation: (value: "vertical" | "horizontal") => void;
  barStackEnabled: boolean;
  setBarStackEnabled: (value: boolean) => void;
  barSketchEnabled?: boolean;
  setBarSketchEnabled?: (value: boolean) => void;
  barSketchIntensity?: number;
  setBarSketchIntensity?: (value: number) => void;
  sketchTypographyPreset?: SketchTypographyPresetId;
  setSketchTypographyPreset?: (value: SketchTypographyPresetId) => void;
  // Legend tab
  showLegend: boolean;
  setShowLegend: (v: boolean) => void;
  legendTop: "top" | "bottom";
  setLegendTop: (v: "top" | "bottom") => void;
  legendLeft: "left" | "right" | "center";
  setLegendLeft: (v: "left" | "right" | "center") => void;
  legendOrient: "horizontal" | "vertical";
  setLegendOrient: (v: "horizontal" | "vertical") => void;
  // Common settings tab
  title: string;
  setTitle: (v: string) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  titleFontColor: string;
  setTitleFontColor: (v: string) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
}

export const BarChartSettingsPanel: FC<BarChartSettingsPanelProps> = ({
  activeChartAccordionItem,
  setActiveChartAccordionItem,
  dataOrientation,
  setDataOrientation,
  barShowBackground,
  setBarShowBackground,
  barBackgroundColor,
  setBarBackgroundColor,
  barAxisOrientation,
  setBarAxisOrientation,
  barStackEnabled,
  setBarStackEnabled,
  barSketchEnabled,
  setBarSketchEnabled,
  barSketchIntensity,
  setBarSketchIntensity,
  sketchTypographyPreset,
  setSketchTypographyPreset,
  showLegend,
  setShowLegend,
  legendTop,
  setLegendTop,
  legendLeft,
  setLegendLeft,
  legendOrient,
  setLegendOrient,
  title,
  setTitle,
  fontSize,
  setFontSize,
  titleFontColor,
  setTitleFontColor,
  backgroundColor,
  setBackgroundColor,
}) => (
  <Accordion
    type="single"
    collapsible
    value={activeChartAccordionItem}
    onValueChange={setActiveChartAccordionItem}
    className="mb-4"
  >
    <AccordionItem value="chart-data-styles">
      <AccordionTrigger className="text-sm font-medium">
        Bar Data Style
      </AccordionTrigger>
      <AccordionContent>
        <BarChartStylesTabContent
          dataOrientation={dataOrientation}
          setDataOrientation={setDataOrientation}
          barSketchEnabled={barSketchEnabled}
          setBarSketchEnabled={setBarSketchEnabled}
          barSketchIntensity={barSketchIntensity}
          setBarSketchIntensity={setBarSketchIntensity}
          sketchTypographyPreset={sketchTypographyPreset}
          setSketchTypographyPreset={setSketchTypographyPreset}
          barShowBackground={barShowBackground}
          setBarShowBackground={setBarShowBackground}
          barBackgroundColor={barBackgroundColor}
          setBarBackgroundColor={setBarBackgroundColor}
          barAxisOrientation={barAxisOrientation}
          setBarAxisOrientation={setBarAxisOrientation}
          barStackEnabled={barStackEnabled}
          setBarStackEnabled={setBarStackEnabled}
        />
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
    <AccordionItem value="bar-settings">
      <AccordionTrigger className="text-sm font-medium">
        Common Settings
      </AccordionTrigger>
      <AccordionContent>
        <CommonChartSettingsTabContent
          chartLabel="Chart"
          title={title}
          setTitle={setTitle}
          fontSizeInput={String(fontSize)}
          onFontSizeChange={(value) => setFontSize(Number(value))}
          titleFontColor={titleFontColor}
          setTitleFontColor={setTitleFontColor}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
        />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
