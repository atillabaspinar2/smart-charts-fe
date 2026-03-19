import { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BarChartStylesTabContent } from "./BarChartStylesTabContent";
import { LineChartStylesTabContent } from "./LineChartStylesTabContent";
import { CommonLegendTabContent } from "./CommonLegendTabContent";
import { CommonChartSettingsTabContent } from "./CommonChartSettingsTabContent";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DataOrientation } from "../../utils/spreadsheetImport";

interface LineBarChartSettingsPanelProps {
  selectedChartType: string;
  activeChartAccordionItem: string;
  setActiveChartAccordionItem: (v: string) => void;
  // Line/Bar chart specific props
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
  // Common props
  showLegend: boolean;
  setShowLegend: (v: boolean) => void;
  legendTop: "top" | "bottom";
  setLegendTop: (v: "top" | "bottom") => void;
  legendLeft: "left" | "right" | "center";
  setLegendLeft: (v: "left" | "right" | "center") => void;
  legendOrient: "horizontal" | "vertical";
  setLegendOrient: (v: "horizontal" | "vertical") => void;
  title: string;
  setTitle: (v: string) => void;
  animationInput: string;
  onAnimationChange: (value: string) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
}

export const LineBarChartSettingsPanel: FC<LineBarChartSettingsPanelProps> = ({
  selectedChartType,
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
  lineShowLabels,
  setLineShowLabels,
  lineSmooth,
  setLineSmooth,
  lineStep,
  setLineStep,
  lineArea,
  setLineArea,
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
  animationInput,
  onAnimationChange,
  fontSize,
  setFontSize,
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
        {selectedChartType === "line" ? "Line Data Style" : "Bar Data Style"}
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
          onAnimationChange={onAnimationChange}
          fontSizeInput={String(fontSize)}
          onFontSizeChange={(value) => setFontSize(Number(value))}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
        />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
