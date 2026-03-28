import type { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PieChartStylesTabContent } from "./PieChartStylesTabContent";
import { CommonLegendTabContent } from "./CommonLegendTabContent";
import { CommonChartSettingsTabContent } from "./CommonChartSettingsTabContent";
import type { PieChartSettings } from "../chartTypes";

import type { BaseSettingsPanelProps } from "./CanvasSettingsPanel";

export interface PieChartSettingsPanelProps extends BaseSettingsPanelProps {
  activeChartAccordionItem: string;
  setActiveChartAccordionItem: (v: string) => void;
  pieSettings: PieChartSettings;
  setPieSettings: (updates: Partial<PieChartSettings>) => void;
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
  fontSize: number;
  setFontSize: (v: number) => void;
}

export const PieChartSettingsPanel: FC<PieChartSettingsPanelProps> = ({
  activeChartAccordionItem,
  setActiveChartAccordionItem,
  pieSettings,
  setPieSettings,
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
          fontSizeInput={String(fontSize)}
          onFontSizeChange={(value) => setFontSize(Number(value))}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
        />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
