import type { FC } from "react";
import { DataGrid, type GridSeriesRow } from "./DataGrid";
import { type BarChartData, type BarChartVariation } from "../chartTypes";

const BAR_VARIATIONS: { value: BarChartVariation; label: string }[] = [
  { value: "grouped", label: "Grouped" },
  { value: "stacked", label: "Stacked" },
  { value: "stacked-100", label: "100%" },
  { value: "horizontal", label: "Horizontal" },
];

interface BarChartDataPanelProps {
  data: BarChartData;
  onChange: (next: BarChartData) => void;
}

export const BarChartDataPanel: FC<BarChartDataPanelProps> = ({
  data,
  onChange,
}) => {
  const variation = data.variation ?? "grouped";

  return (
    <div className="space-y-3">
      {/* Variation picker */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Variation
        </p>
        <div className="flex flex-wrap gap-1.5">
          {BAR_VARIATIONS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => onChange({ ...data, variation: v.value })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                variation === v.value
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <DataGrid
        categories={data.categories}
        series={data.series}
        onCategoriesChange={(cats) => onChange({ ...data, categories: cats })}
        onSeriesChange={(series) =>
          onChange({ ...data, series: series as BarChartData["series"] })
        }
      />
    </div>
  );
};
