import React from "react";
import type { MapChartData } from "../chartTypes";

interface MapChartDataPanelProps {
  data: MapChartData;
  onChange: (data: MapChartData) => void;
  availableMaps: string[];
}

export const MapChartDataPanel: React.FC<MapChartDataPanelProps> = ({
  data,
  onChange,
  availableMaps,
}) => {
  return (
    <div>
      <label htmlFor="map-select">Map:</label>
      <select
        id="map-select"
        value={data.mapName}
        onChange={(e) => onChange({ ...data, mapName: e.target.value })}
      >
        {availableMaps.map((map) => (
          <option key={map} value={map}>
            {map}
          </option>
        ))}
      </select>
    </div>
  );
};
