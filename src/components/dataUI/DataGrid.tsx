import { type FC, useCallback, useEffect, useMemo, useRef } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DEFAULT_THEME_COLORS } from "../../assets/themes/registerThemes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SeriesColorSource } from "../chartTypes";

export interface GridSeriesRow {
  id: string;
  name: string;
  color: string;
  colorSource?: SeriesColorSource;
  themeColorIndex?: number | null;
  values: number[];
}

interface DataGridProps {
  categories: string[];
  series: GridSeriesRow[];
  onCategoriesChange: (categories: string[]) => void;
  onSeriesChange: (series: GridSeriesRow[]) => void;
  onDataChange?: (categories: string[], series: GridSeriesRow[]) => void;
  registerApplyHandler?: (
    handler: (() => { categories: string[]; series: GridSeriesRow[] }) | null,
  ) => void;
  themeColors?: string[];
  minSeries?: number;
}

export const DataGrid: FC<DataGridProps> = ({
  categories,
  series,
  onCategoriesChange,
  onSeriesChange,
  onDataChange,
  registerApplyHandler,
  themeColors = DEFAULT_THEME_COLORS,
  minSeries = 1,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef(categories);
  const seriesRef = useRef(series);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  useEffect(() => {
    seriesRef.current = series;
  }, [series]);

  const collectGridSnapshot = useCallback(() => {
    const gridElement = gridRef.current;
    const currentSeries = seriesRef.current;
    const currentCategories = categoriesRef.current;

    if (!gridElement) {
      return {
        categories: currentCategories,
        series: currentSeries,
      };
    }

    const nextCategories = currentCategories.map((category, index) => {
      const input = gridElement.querySelector<HTMLInputElement>(
        `[data-grid-kind="category"][data-col-index="${index}"]`,
      );
      return input?.value ?? category;
    });

    const nextSeries = currentSeries.map((row, rowIndex) => {
      const colorInput = gridElement.querySelector<HTMLInputElement>(
        `[data-grid-kind="series-color"][data-row-index="${rowIndex}"]`,
      );
      const nameInput = gridElement.querySelector<HTMLInputElement>(
        `[data-grid-kind="series-name"][data-row-index="${rowIndex}"]`,
      );

      const values = nextCategories.map((_, colIndex) => {
        const valueInput = gridElement.querySelector<HTMLInputElement>(
          `[data-grid-kind="value"][data-row-index="${rowIndex}"][data-col-index="${colIndex}"]`,
        );
        let raw = valueInput?.value ?? "0";
        // Remove commas and spaces, handle empty string as 0
        raw = raw.replace(/,/g, "").trim();
        const parsed = Number.parseFloat(raw);
        return Number.isFinite(parsed) ? parsed : 0;
      });

      return {
        ...row,
        color: colorInput?.value ?? row.color,
        name: nameInput?.value ?? row.name,
        values,
      };
    });

    return {
      categories: nextCategories,
      series: nextSeries,
    };
  }, []);

  const applyGridChange = useCallback(
    (nextCategories: string[], nextSeries: GridSeriesRow[]) => {
      if (onDataChange) {
        onDataChange(nextCategories, nextSeries);
        return;
      }

      onCategoriesChange(nextCategories);
      onSeriesChange(nextSeries);
    },
    [onCategoriesChange, onDataChange, onSeriesChange],
  );

  const addCategory = useCallback(() => {
    const { categories: currentCategories, series: currentSeries } =
      collectGridSnapshot();
    const nextCategories = [...currentCategories, ""];
    const nextSeries = currentSeries.map((row) => ({
      ...row,
      values: [...row.values, 0],
    }));
    applyGridChange(nextCategories, nextSeries);
  }, [applyGridChange, collectGridSnapshot]);

  const removeCategory = useCallback(
    (index: number) => {
      const { categories: currentCategories, series: currentSeries } =
        collectGridSnapshot();
      if (currentCategories.length <= 1) return;
      const nextCategories = currentCategories.filter((_, i) => i !== index);
      const nextSeries = currentSeries.map((row) => ({
        ...row,
        values: row.values.filter((_, i) => i !== index),
      }));
      applyGridChange(nextCategories, nextSeries);
    },
    [applyGridChange, collectGridSnapshot],
  );

  const getNextThemeColorIndex = useCallback(() => {
    const currentSeries = seriesRef.current;
    if (!themeColors.length) return 0;
    const used = new Set(
      currentSeries
        .filter(
          (row) =>
            row.colorSource === "theme" &&
            typeof row.themeColorIndex === "number" &&
            row.themeColorIndex >= 0,
        )
        .map((row) => row.themeColorIndex as number),
    );

    for (let i = 0; i < themeColors.length; i += 1) {
      if (!used.has(i)) return i;
    }
    return currentSeries.length;
  }, [themeColors]);

  const addSeries = useCallback(() => {
    const { categories: currentCategories, series: currentSeries } =
      collectGridSnapshot();
    const nextIndex = currentSeries.length;
    const themeColorIndex = getNextThemeColorIndex();
    const color = themeColors[themeColorIndex % themeColors.length];
    onSeriesChange([
      ...currentSeries,
      {
        id: `series-${Date.now()}-${nextIndex}`,
        name: `Series ${nextIndex + 1}`,
        color,
        colorSource: "theme",
        themeColorIndex,
        values: Array.from({ length: currentCategories.length }, () => 0),
      },
    ]);
  }, [
    collectGridSnapshot,
    getNextThemeColorIndex,
    onSeriesChange,
    themeColors,
  ]);

  const removeSeries = useCallback(
    (id: string) => {
      const currentSeries = collectGridSnapshot().series;
      if (currentSeries.length <= minSeries) return;
      onSeriesChange(currentSeries.filter((row) => row.id !== id));
    },
    [collectGridSnapshot, minSeries, onSeriesChange],
  );

  useEffect(() => {
    if (!registerApplyHandler) return;

    registerApplyHandler(collectGridSnapshot);
    return () => registerApplyHandler(null);
  }, [collectGridSnapshot, registerApplyHandler]);

  const columns = useMemo<ColumnDef<GridSeriesRow>[]>(() => {
    const seriesColumn: ColumnDef<GridSeriesRow> = {
      id: "series",
      header: () => <span>Series</span>,
      cell: ({ row }) => {
        const rowData = row.original;
        const rowIndex = row.index;
        return (
          <div className="flex items-center gap-2">
            <input
              data-grid-kind="series-color"
              data-row-index={rowIndex}
              type="color"
              defaultValue={rowData.color}
              className="size-6 shrink-0 cursor-pointer rounded border border-input bg-background p-0.5"
              title={`Color for ${rowData.name}`}
            />
            <input
              data-grid-kind="series-name"
              data-row-index={rowIndex}
              type="text"
              defaultValue={rowData.name}
              className="min-w-0 flex-1 rounded bg-transparent px-1 py-0.5 text-xs font-medium text-foreground outline-none focus:bg-background focus:ring-1 focus:ring-ring"
              aria-label="Series name"
            />
            <button
              type="button"
              onClick={() => removeSeries(rowData.id)}
              disabled={series.length <= minSeries}
              title="Remove series"
              className="shrink-0 leading-none text-muted-foreground hover:text-destructive disabled:pointer-events-none"
            >
              ×
            </button>
          </div>
        );
      },
      size: 240,
    };

    const categoryColumns: ColumnDef<GridSeriesRow>[] = categories.map(
      (cat, ci) => ({
        id: `category-${ci}`,
        header: () => (
          <div className="flex items-center gap-0.5">
            <input
              data-grid-kind="category"
              data-col-index={ci}
              type="text"
              defaultValue={cat}
              className="w-full min-w-0 rounded bg-transparent px-1 py-1 text-center text-xs font-medium text-foreground outline-none focus:bg-background focus:ring-1 focus:ring-ring"
              aria-label={`Category ${ci + 1}`}
            />
            {categories.length > 1 && (
              <button
                type="button"
                onClick={() => removeCategory(ci)}
                title="Remove column"
                className="shrink-0 leading-none text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            )}
          </div>
        ),
        cell: ({ row }) => (
          <input
            data-grid-kind="value"
            data-row-index={row.index}
            data-col-index={ci}
            type="number"
            defaultValue={row.original.values[ci] ?? 0}
            className="w-full rounded bg-transparent px-1 py-0.5 text-center text-xs text-foreground outline-none focus:bg-background focus:ring-1 focus:ring-ring"
            aria-label={`${row.original.name} — ${categories[ci]}`}
          />
        ),
        size: 100,
      }),
    );

    const addColumn: ColumnDef<GridSeriesRow> = {
      id: "add-column",
      header: () => (
        <button
          type="button"
          onClick={addCategory}
          title="Add column"
          className="mx-auto flex size-5 items-center justify-center rounded bg-muted text-xs font-bold text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          +
        </button>
      ),
      cell: () => null,
      size: 32,
    };

    return [seriesColumn, ...categoryColumns, addColumn];
  }, [
    addCategory,
    categories,
    minSeries,
    removeCategory,
    removeSeries,
    series.length,
    addSeries,
  ]);

  const table = useReactTable({
    data: series,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      ref={gridRef}
      className="overflow-x-auto rounded-md border border-border bg-card shadow-sm"
      onBlur={(e) => {
        // Flush the grid snapshot to the draft when focus leaves the entire grid
        // (not when moving between cells within the grid)
        if (!gridRef.current?.contains(e.relatedTarget as Node)) {
          const { categories: nextCats, series: nextSeries } = collectGridSnapshot();
          applyGridChange(nextCats, nextSeries);
        }
      }}
    >
      <Table
        className=""
        style={{ minWidth: `${260 + categories.length * 100}px` }}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/60">
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className={
                    index === 0
                      ? "sticky left-0 z-10 border-b border-r border-border bg-muted/60 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      : "border-b border-r border-border px-1 py-1 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="group hover:bg-accent/30">
              {row.getVisibleCells().map((cell, index) => (
                <TableCell
                  key={cell.id}
                  className={
                    index === 0
                      ? "sticky left-0 z-10 border-b border-r border-border bg-card px-2 py-1 group-hover:bg-accent/30"
                      : "border-b border-r border-border px-1 py-1"
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={categories.length + 2} className="px-3 py-1.5">
              <button
                type="button"
                onClick={addSeries}
                className="text-xs font-medium text-primary hover:text-primary/80"
              >
                + Add series
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
