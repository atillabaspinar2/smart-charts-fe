import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CommonChartSettingsTabContent } from "./CommonChartSettingsTabContent";
import { CommonLegendTabContent } from "./CommonLegendTabContent";

export interface MapChartSettingsPanelProps {
  activeChartAccordionItem: string;
  setActiveChartAccordionItem: (item: string) => void;
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
  handleAnimationChange: (v: string) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
}

const MapChartSettingsPanel: React.FC<MapChartSettingsPanelProps> = ({
  activeChartAccordionItem,
  setActiveChartAccordionItem,
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
  handleAnimationChange,
  fontSize,
  setFontSize,
  backgroundColor,
  setBackgroundColor,
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      value={activeChartAccordionItem}
      onValueChange={setActiveChartAccordionItem}
      className="mb-4"
    >
      <AccordionItem value="map-data-styles">
        <AccordionTrigger className="text-sm font-medium">
          Map Data Style
        </AccordionTrigger>
        <AccordionContent>
          {/* Map-specific style settings can go here */}
          <div>Map data style settings (TBD)</div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="legend">
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
      <AccordionItem value="common-settings">
        <AccordionTrigger className="text-sm font-medium">
          Common Settings
        </AccordionTrigger>
        <AccordionContent>
          <CommonChartSettingsTabContent
            chartLabel="Map"
            title={title}
            setTitle={setTitle}
            animationInput={animationInput}
            onAnimationChange={handleAnimationChange}
            fontSizeInput={String(fontSize)}
            onFontSizeChange={(v) => setFontSize(Number(v))}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default MapChartSettingsPanel;
