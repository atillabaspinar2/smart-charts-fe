import React from "react";
import type { MapChartData } from "../chartTypes";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { DataGrid } from "./DataGrid";

type Props = {
  data: MapChartData & { series: { data: { name: string; value: number }[] } };
  onChange: (data: MapChartData) => void;
  availableMaps: string[];
};

export const MapChartDataPanel: React.FC<Props> = ({
  data,
  onChange,
  availableMaps,
}) => {
  const regionRows = data.series?.data || [];
  const gridRows = regionRows.map((region) => ({
    id: region.name,
    name: region.name,
    color: "#ccc",
    values: [region.value],
  }));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="block mb-1 text-sm font-medium">Map:</label>
        <Select
          value={data.mapName}
          onValueChange={(value) => onChange({ ...data, mapName: value })}
        >
          <SelectTrigger className="min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableMaps.map((map: string) => (
              <SelectItem key={map} value={map}>
                {map}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">Region Data:</label>
        <DataGrid
          categories={["Value"]}
          series={gridRows}
          onCategoriesChange={() => {}}
          onSeriesChange={(rows) => {
            const newSeriesData = rows.map((row) => ({
              name: row.name,
              value: row.values[0],
            }));
            onChange({
              ...data,
              series: { ...data.series, data: newSeriesData },
            });
          }}
          minSeries={gridRows.length}
        />
      </div>
    </div>
  );
};
