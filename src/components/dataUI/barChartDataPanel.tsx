import type { FC } from "react";
import { DataGrid } from "./DataGrid";
import { type BarChartData } from "../chartTypes";

interface BarChartDataPanelProps {
  data: BarChartData;
  onChange: (next: BarChartData) => void;
  themeColors: string[];
  registerApplyHandler?: (handler: (() => BarChartData) | null) => void;
}

export const BarChartDataPanel: FC<BarChartDataPanelProps> = ({
  data,
  onChange,
  themeColors,
  registerApplyHandler,
}) => {
  const mapRowsToSeries = (rows: BarChartData["series"]) =>
    rows.map((row) => {
      const existing = data.series.find((s) => s.id === row.id);
      return {
        ...row,
        colorSource: row.colorSource ?? existing?.colorSource ?? "custom",
        themeColorIndex:
          row.themeColorIndex ?? existing?.themeColorIndex ?? null,
      };
    }) as BarChartData["series"];

  return (
    <div className="space-y-3">
      <DataGrid
        categories={data.categories}
        series={data.series}
        onCategoriesChange={(cats) => onChange({ ...data, categories: cats })}
        onSeriesChange={(series) => {
          onChange({
            ...data,
            series: mapRowsToSeries(series as BarChartData["series"]),
          });
        }}
        onDataChange={(categories, rows) => {
          onChange({
            ...data,
            categories,
            series: mapRowsToSeries(rows as BarChartData["series"]),
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
                          series: mapRowsToSeries(
                            snapshot.series as BarChartData["series"],
                          ),
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
