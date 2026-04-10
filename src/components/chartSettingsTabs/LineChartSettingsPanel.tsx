import type { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LineChartStylesTabContent } from "./LineChartStylesTabContent";
import { CommonLegendTabContent } from "./CommonLegendTabContent";
import { CommonChartSettingsTabContent } from "./CommonChartSettingsTabContent";
import type { DataOrientation } from "../../utils/spreadsheetImport";
import type { LineSymbol } from "../chartTypes";

export interface LineChartSettingsPanelProps {
  activeChartAccordionItem: string;
  setActiveChartAccordionItem: (v: string) => void;
  dataOrientation?: DataOrientation;
  setDataOrientation?: (orientation: DataOrientation) => void;
  lineShowLabels?: boolean;
  setLineShowLabels?: (value: boolean) => void;
  lineSmooth?: boolean;
  setLineSmooth?: (value: boolean) => void;
  lineStep?: boolean;
  setLineStep?: (value: boolean) => void;
  lineArea?: boolean;
  setLineArea?: (value: boolean) => void;
  lineStack?: boolean;
  setLineStack?: (value: boolean) => void;
  lineSymbol?: LineSymbol;
  setLineSymbol?: (value: LineSymbol) => void;
  lineSymbolSize?: number;
  setLineSymbolSize?: (value: number) => void;
  lineSketchEnabled?: boolean;
  setLineSketchEnabled?: (value: boolean) => void;
  lineSketchIntensity?: number;
  setLineSketchIntensity?: (value: number) => void;
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
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
}

export const LineChartSettingsPanel: FC<LineChartSettingsPanelProps> = ({
  activeChartAccordionItem,
  setActiveChartAccordionItem,
  dataOrientation,
  setDataOrientation,
  lineShowLabels,
  setLineShowLabels,
  lineSmooth,
  setLineSmooth,
  lineStep,
  setLineStep,
  lineArea,
  setLineArea,
  lineStack,
  setLineStack,
  lineSymbol,
  setLineSymbol,
  lineSymbolSize,
  setLineSymbolSize,
  lineSketchEnabled,
  setLineSketchEnabled,
  lineSketchIntensity,
  setLineSketchIntensity,
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
        Line Data Style
      </AccordionTrigger>
      <AccordionContent>
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
    <AccordionItem value="line-settings">
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
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
        />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
