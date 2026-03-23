import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CommonChartSettingsTabContent } from "./CommonChartSettingsTabContent";
import { MapChartStylesTabContent } from "./MapChartStylesTabContent";
import type { MapChartSettings } from "../chartTypes";

export interface MapChartSettingsPanelProps {
  activeChartAccordionItem: string;
  setActiveChartAccordionItem: (item: string) => void;
  title: string;
  setTitle: (v: string) => void;
  animationInput: string;
  handleAnimationChange: (v: string) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
  mapSettings: MapChartSettings;
  setMapSettings: (updates: Partial<MapChartSettings>) => void;
}

const MapChartSettingsPanel: React.FC<MapChartSettingsPanelProps> = ({
  activeChartAccordionItem,
  setActiveChartAccordionItem,
  title,
  setTitle,
  animationInput,
  handleAnimationChange,
  fontSize,
  setFontSize,
  backgroundColor,
  setBackgroundColor,
  mapSettings,
  setMapSettings,
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
          <MapChartStylesTabContent
            mapSettings={mapSettings}
            setMapSettings={setMapSettings}
          ></MapChartStylesTabContent>
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
