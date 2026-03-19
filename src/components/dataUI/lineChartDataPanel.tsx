import type { FC } from "react";
import { DataGrid, type GridSeriesRow } from "./DataGrid";
import { type LineChartData } from "../chartTypes";

interface LineChartDataPanelProps {
  data: LineChartData;
  onChange: (next: LineChartData) => void;
  themeColors: string[];
  registerApplyHandler?: (handler: (() => LineChartData) | null) => void;
}

export const LineChartDataPanel: FC<LineChartDataPanelProps> = ({
  data,
  onChange,
  themeColors,
  registerApplyHandler,
}) => {
  const mapRowsToSeries = (rows: GridSeriesRow[]) =>
    rows.map((row) => {
      const existing = data.series.find((s) => s.id === row.id);
      return {
        ...row,
        colorSource: row.colorSource ?? existing?.colorSource ?? "custom",
        themeColorIndex:
          row.themeColorIndex ?? existing?.themeColorIndex ?? null,
      };
    });

  const handleSeriesChange = (rows: GridSeriesRow[]) => {
    onChange({
      ...data,
      series: mapRowsToSeries(rows),
    });
  };

  return (
    <div className="space-y-3">
      <DataGrid
        categories={data.categories}
        series={data.series}
        onCategoriesChange={(cats) => onChange({ ...data, categories: cats })}
        onSeriesChange={handleSeriesChange}
        onDataChange={(categories, rows) => {
          onChange({
            ...data,
            categories,
            series: mapRowsToSeries(rows),
          });
        }}
        registerApplyHandler={
          registerApplyHandler
            ? (handler) => {
                registerApplyHandler(
                  handler
                    ? () => {
                        const snapshot = handler();
                        return {
                          ...data,
                          categories: snapshot.categories,
                          series: mapRowsToSeries(snapshot.series),
                        };
                      }
                    : null,
                );
              }
            : undefined
        }
        themeColors={themeColors}
      />
    </div>
  );
};
