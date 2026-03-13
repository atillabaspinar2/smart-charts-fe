import type { FC } from "react";
import { CustomInput } from "./UILibrary/customInput";
import { type LineChartData } from "./chartTypes";

const defaultSeriesColors = [
  "#2563eb",
  "#dc2626",
  "#059669",
  "#d97706",
  "#7c3aed",
];

const parseCategories = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseSeriesValues = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));

interface LineChartDataPanelProps {
  data: LineChartData;
  onChange: (next: LineChartData) => void;
}

export const LineChartDataPanel: FC<LineChartDataPanelProps> = ({
  data,
  onChange,
}) => {
  const updateSeries = (
    seriesId: string,
    updater: (
      series: LineChartData["series"][number],
    ) => LineChartData["series"][number],
  ) => {
    onChange({
      ...data,
      series: data.series.map((series) =>
        series.id === seriesId ? updater(series) : series,
      ),
    });
  };

  const addSeries = () => {
    const nextIndex = data.series.length;
    onChange({
      ...data,
      series: [
        ...data.series,
        {
          id: `series-${Date.now()}-${nextIndex}`,
          name: `Series ${nextIndex + 1}`,
          color: defaultSeriesColors[nextIndex % defaultSeriesColors.length],
          values: Array.from({ length: data.categories.length || 7 }, () => 0),
          areaStyle: false,
        },
      ],
    });
  };

  const removeSeries = (seriesId: string) => {
    if (data.series.length <= 1) return;
    onChange({
      ...data,
      series: data.series.filter((series) => series.id !== seriesId),
    });
  };

  return (
    <div className="space-y-4 p-1">
      <div>
        <CustomInput
          id="line-chart-categories"
          label="X-Axis Labels"
          type="text"
          value={data.categories.join(", ")}
          placeholder="Mon, Tue, Wed, Thu"
          onChange={(e) =>
            onChange({
              ...data,
              categories: parseCategories(e.target.value),
            })
          }
        />
        <p className="-mt-2 text-xs text-gray-500">
          Use comma-separated labels for the category axis.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Series</h3>
          <p className="text-xs text-gray-500">
            Each series can have its own values, color, and area style.
          </p>
        </div>
        <button
          type="button"
          onClick={addSeries}
          className="rounded-md border border-theme-primary px-3 py-1.5 text-sm font-medium text-theme-primary hover:bg-theme-primary hover:text-white transition-colors"
        >
          Add Series
        </button>
      </div>

      <div className="space-y-3">
        {data.series.map((series, index) => (
          <section
            key={series.id}
            className="rounded-md border border-gray-200 bg-white p-3 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-800">
                Series {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => removeSeries(series.id)}
                disabled={data.series.length <= 1}
                className="text-xs font-medium text-red-600 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                Remove
              </button>
            </div>

            <CustomInput
              id={`line-series-name-${series.id}`}
              label="Series Name"
              type="text"
              value={series.name}
              placeholder={`Series ${index + 1}`}
              onChange={(e) =>
                updateSeries(series.id, (current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
            />

            <CustomInput
              id={`line-series-values-${series.id}`}
              label="Series Values"
              type="text"
              value={series.values.join(", ")}
              placeholder="150, 230, 224, 218"
              onChange={(e) =>
                updateSeries(series.id, (current) => ({
                  ...current,
                  values: parseSeriesValues(e.target.value),
                }))
              }
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[auto_1fr] md:items-end">
              <div>
                <label className="mb-1 block text-sm font-medium">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={series.color}
                    aria-label={`Color for ${series.name || `Series ${index + 1}`}`}
                    className="h-10 w-10 cursor-pointer rounded-md border border-gray-300 bg-white p-1"
                    onChange={(e) =>
                      updateSeries(series.id, (current) => ({
                        ...current,
                        color: e.target.value,
                      }))
                    }
                  />
                  <span className="text-sm text-gray-600 uppercase">
                    {series.color}
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={series.areaStyle}
                  onChange={(e) =>
                    updateSeries(series.id, (current) => ({
                      ...current,
                      areaStyle: e.target.checked,
                    }))
                  }
                />
                Enable area style
              </label>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
