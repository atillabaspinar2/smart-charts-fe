import type { FC } from "react";
import { DataGrid, type GridSeriesRow } from "./DataGrid";
import { type LineChartData } from "../chartTypes";

interface LineChartDataPanelProps {
  data: LineChartData;
  onChange: (next: LineChartData) => void;
}

export const LineChartDataPanel: FC<LineChartDataPanelProps> = ({
  data,
  onChange,
}) => {
  const handleSeriesChange = (rows: GridSeriesRow[]) => {
    onChange({
      ...data,
      series: rows.map((row) => {
        const existing = data.series.find((s) => s.id === row.id);
        return {
          ...row,
          smooth: existing?.smooth ?? false,
          step: existing?.step ?? false,
          areaStyle: existing?.areaStyle ?? null,
        };
      }),
    });
  };

  const updateSeriesStyle = (
    seriesId: string,
    updates: Partial<LineChartData["series"][number]>,
  ) => {
    onChange({
      ...data,
      series: data.series.map((series) =>
        series.id === seriesId ? { ...series, ...updates } : series,
      ),
    });
  };

  return (
    <div className="space-y-3">
      <DataGrid
        categories={data.categories}
        series={data.series}
        onCategoriesChange={(cats) => onChange({ ...data, categories: cats })}
        onSeriesChange={handleSeriesChange}
      />

      <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Series Style
        </p>
        <div className="space-y-2">
          {data.series.map((series) => (
            <div
              key={series.id}
              className="flex flex-wrap items-center gap-3 rounded border border-gray-100 px-2 py-2"
            >
              <span className="min-w-24 text-xs font-medium text-gray-700">
                {series.name || "Untitled"}
              </span>
              <label className="flex items-center gap-1.5 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={series.smooth}
                  onChange={(e) =>
                    updateSeriesStyle(series.id, { smooth: e.target.checked })
                  }
                />
                Smooth
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={series.step}
                  onChange={(e) =>
                    updateSeriesStyle(series.id, { step: e.target.checked })
                  }
                />
                Step
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={series.areaStyle !== null}
                  onChange={(e) =>
                    updateSeriesStyle(series.id, {
                      areaStyle: e.target.checked ? {} : null,
                    })
                  }
                />
                Area
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
