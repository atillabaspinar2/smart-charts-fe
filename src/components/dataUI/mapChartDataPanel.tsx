import React from "react";
import { exportMapChartDataToCSV } from "../../utils/spreadsheetExport";
import type { MapChartData } from "../chartTypes";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { DataGrid } from "./DataGrid";
import { DataPanelUnavailable } from "./DataPanelUnavailable";

type Props = {
  data:
    | (MapChartData & {
        series: { data: { name: string; value: number }[] };
      })
    | undefined;
  onChange: (data: MapChartData) => void;
  onMapNameChange?: (mapName: string) => void;
  availableMaps: Record<string, string>[];
  registerApplyHandler?: (handler: (() => MapChartData) | null) => void;
};

export const MapChartDataPanel: React.FC<Props> = ({
  data,
  onChange,
  availableMaps,
  onMapNameChange,
  registerApplyHandler,
}) => {
  if (
    !data ||
    data.type !== "map" ||
    !data.mapName ||
    !data.series ||
    !Array.isArray(data.series.data)
  ) {
    return (
      <DataPanelUnavailable title="Map chart data not ready">
        The editor cannot display until valid map chart data is available.
      </DataPanelUnavailable>
    );
  }

  // Always one category: "Value"
  const categories = ["Value"];
  // Build series array for DataGrid
  const series = (data.series?.data || []).map((region, idx) => ({
    id: region.name || `region-${idx}`,
    name: region.name,
    color: "#ccc",
    values: [region.value],
  }));

  // Map DataGrid rows back to MapChartData
  const mapRowsToMapChartData = (rows: typeof series) => ({
    ...data,
    series: {
      data: rows.map((row) => ({
        name: row.name,
        value: row.values[0],
      })),
    },
  });

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          className="rounded bg-blue-500 text-white px-3 py-1 text-xs font-medium hover:bg-blue-600"
          onClick={() =>
            exportMapChartDataToCSV(
              mapRowsToMapChartData(series),
              `${data.mapName || "map"}-data.csv`,
            )
          }
        >
          Export
        </button>
        <label className="block mb-1 text-sm font-medium">Map:</label>
        <Select
          value={data.mapName}
          onValueChange={(value) => {
            if (onMapNameChange) {
              onMapNameChange(value);
            } else {
              onChange({ ...data, mapName: value });
            }
          }}
        >
          <SelectTrigger className="min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-9002">
            {availableMaps.map((map: Record<string, string>) => (
              <SelectItem key={map.name} value={map.value}>
                {map.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">Region Data:</label>
        <DataGrid
          categories={categories}
          series={series}
          onCategoriesChange={() => {}}
          onSeriesChange={(rows) => {
            onChange(mapRowsToMapChartData(rows));
          }}
          onDataChange={(_cats, rows) => {
            onChange(mapRowsToMapChartData(rows));
          }}
          minSeries={series.length}
          registerApplyHandler={
            registerApplyHandler
              ? (handler) => {
                  registerApplyHandler(
                    handler
                      ? () => {
                          const snapshot = handler();
                          return mapRowsToMapChartData(snapshot.series);
                        }
                      : null,
                  );
                }
              : undefined
          }
        />
      </div>
    </div>
  );
};
