import type { FC } from "react";

const DEFAULT_SERIES_COLORS = [
  "#2563eb",
  "#dc2626",
  "#059669",
  "#d97706",
  "#7c3aed",
];

export interface GridSeriesRow {
  id: string;
  name: string;
  color: string;
  values: number[];
}

interface DataGridProps {
  categories: string[];
  series: GridSeriesRow[];
  onCategoriesChange: (categories: string[]) => void;
  onSeriesChange: (series: GridSeriesRow[]) => void;
  minSeries?: number;
}

export const DataGrid: FC<DataGridProps> = ({
  categories,
  series,
  onCategoriesChange,
  onSeriesChange,
  minSeries = 1,
}) => {
  const updateCategory = (index: number, value: string) => {
    const next = [...categories];
    next[index] = value;
    onCategoriesChange(next);
  };

  const addCategory = () => {
    onCategoriesChange([...categories, `Col ${categories.length + 1}`]);
    onSeriesChange(
      series.map((row) => ({ ...row, values: [...row.values, 0] })),
    );
  };

  const removeCategory = (index: number) => {
    if (categories.length <= 1) return;
    onCategoriesChange(categories.filter((_, i) => i !== index));
    onSeriesChange(
      series.map((row) => ({
        ...row,
        values: row.values.filter((_, i) => i !== index),
      })),
    );
  };

  const updateSeriesName = (id: string, name: string) => {
    onSeriesChange(
      series.map((row) => (row.id === id ? { ...row, name } : row)),
    );
  };

  const updateSeriesColor = (id: string, color: string) => {
    onSeriesChange(
      series.map((row) => (row.id === id ? { ...row, color } : row)),
    );
  };

  const updateValue = (seriesId: string, colIndex: number, raw: string) => {
    const value = parseFloat(raw);
    onSeriesChange(
      series.map((row) => {
        if (row.id !== seriesId) return row;
        const next = [...row.values];
        next[colIndex] = Number.isFinite(value) ? value : 0;
        return { ...row, values: next };
      }),
    );
  };

  const addSeries = () => {
    const nextIndex = series.length;
    onSeriesChange([
      ...series,
      {
        id: `series-${Date.now()}-${nextIndex}`,
        name: `Series ${nextIndex + 1}`,
        color: DEFAULT_SERIES_COLORS[nextIndex % DEFAULT_SERIES_COLORS.length],
        values: Array.from({ length: categories.length }, () => 0),
      },
    ]);
  };

  const removeSeries = (id: string) => {
    if (series.length <= minSeries) return;
    onSeriesChange(series.filter((row) => row.id !== id));
  };

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
      <table
        className="w-full border-collapse text-sm"
        style={{ minWidth: `${200 + categories.length * 80}px` }}
      >
        <thead>
          <tr className="bg-gray-50">
            {/* Series column header */}
            <th className="sticky left-0 z-10 w-48 min-w-48 border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Series
            </th>

            {/* Category column headers (editable) */}
            {categories.map((cat, ci) => (
              <th
                key={ci}
                className="min-w-18 border-b border-r border-gray-200 px-1 py-1"
              >
                <div className="flex items-center gap-0.5">
                  <input
                    type="text"
                    value={cat}
                    onChange={(e) => updateCategory(ci, e.target.value)}
                    className="w-full min-w-0 rounded bg-transparent px-1 py-1 text-center text-xs font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-blue-400"
                    aria-label={`Category ${ci + 1}`}
                  />
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCategory(ci)}
                      title="Remove column"
                      className="shrink-0 leading-none text-gray-300 hover:text-red-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              </th>
            ))}

            {/* Add column button */}
            <th className="w-8 border-b border-gray-200 px-2 py-1">
              <button
                type="button"
                onClick={addCategory}
                title="Add column"
                className="flex size-5 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-600 hover:bg-blue-100 hover:text-blue-600"
              >
                +
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          {series.map((row) => (
            <tr key={row.id} className="group hover:bg-blue-50/30">
              {/* Series name + color (sticky) */}
              <td className="sticky left-0 z-10 border-b border-r border-gray-200 bg-white px-2 py-1 group-hover:bg-blue-50/30">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={row.color}
                    onChange={(e) => updateSeriesColor(row.id, e.target.value)}
                    className="size-6 shrink-0 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
                    title={`Color for ${row.name}`}
                  />
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateSeriesName(row.id, e.target.value)}
                    className="min-w-0 flex-1 rounded bg-transparent px-1 py-0.5 text-xs font-medium text-gray-800 outline-none focus:bg-white focus:ring-1 focus:ring-blue-400"
                    aria-label="Series name"
                  />
                  <button
                    type="button"
                    onClick={() => removeSeries(row.id)}
                    disabled={series.length <= minSeries}
                    title="Remove series"
                    className="shrink-0 leading-none text-gray-300 hover:text-red-400 disabled:pointer-events-none"
                  >
                    ×
                  </button>
                </div>
              </td>

              {/* Value cells */}
              {categories.map((_, ci) => (
                <td
                  key={ci}
                  className="border-b border-r border-gray-200 px-1 py-1"
                >
                  <input
                    type="number"
                    value={row.values[ci] ?? 0}
                    onChange={(e) => updateValue(row.id, ci, e.target.value)}
                    className="w-full rounded bg-transparent px-1 py-0.5 text-center text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-400"
                    aria-label={`${row.name} — ${categories[ci]}`}
                  />
                </td>
              ))}

              {/* Empty cell under the add-column header */}
              <td className="border-b border-gray-200 px-1 py-1" />
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td
              colSpan={categories.length + 2}
              className="border-t border-gray-100 px-3 py-1.5"
            >
              <button
                type="button"
                onClick={addSeries}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                + Add series
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
