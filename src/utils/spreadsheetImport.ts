import type {
  BarChartData,
  LineChartData,
  PieChartData,
} from "../components/chartTypes";

export type DataOrientation = "columns-as-series" | "rows-as-series";

export const readSheetRowsFromFile = async (
  file: File,
): Promise<unknown[][]> => {
  const XLSX = await import("xlsx");
  const fileData = await file.arrayBuffer();
  const workbook = XLSX.read(fileData, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("No sheets found in file.");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: true,
    defval: "",
  }) as unknown[][];
};

import type { MapChartData } from "../components/chartTypes";


export const buildChartDataFromSheetRows = (
  rows: unknown[][],
  chartType: "line" | "bar" | "pie" | "map",
  instanceId: string,
  getThemeColor: (index: number) => string,
  orientation: DataOrientation = "columns-as-series",
  _mapName?: string,
): LineChartData | BarChartData | PieChartData | MapChartData | null => {
  if (rows.length < 2) return null;

  const normalizedRows = rows
    .map((row) => (Array.isArray(row) ? row : []))
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));

  if (normalizedRows.length < 2) return null;

  const headers = normalizedRows[0].map((cell) => String(cell ?? "").trim());

  if (headers.length < 2) return null;

  const toNumber = (value: unknown): number => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const parsed = Number(String(value ?? "").trim());
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const bodyRows = normalizedRows.slice(1);
  if (bodyRows.length === 0) return null;

  const createLineData = (
    xAxisLabels: string[],
    series: Array<{
      id: string;
      name: string;
      color: string;
      colorSource: "theme";
      themeColorIndex: number;
      values: number[];
    }>,
  ): LineChartData => ({
    type: "line",
    categories: xAxisLabels,
    series,
  });

  const createBarData = (
    xAxisLabels: string[],
    series: Array<{
      id: string;
      name: string;
      color: string;
      colorSource: "theme";
      themeColorIndex: number;
      values: number[];
    }>,
  ): BarChartData => ({
    type: "bar",
    categories: xAxisLabels,
    series,
  });

  const createPieData = (items: Array<{ name: string; value: number }>) => {
    const data = items
      .filter((item) => item.name.trim() !== "")
      .map((item, index) => ({
        id: `${instanceId}-slice-${index + 1}`,
        name: item.name,
        value: item.value,
      }));

    if (data.length === 0) return null;

    return {
      type: "pie",
      data,
    } satisfies PieChartData;
  };

  if (chartType === "map") {
    // Use first cell of first row as map name, second as map title (optional)
    const mapName = headers[0] || "world";
    // const mapTitle = headers[1] || ""; // Not used, but available
    const items = bodyRows
      .map((row) => ({
        name: String(row[0] ?? "").trim(),
        value: toNumber(row[1]),
      }))
      .filter((item) => item.name !== "");
    if (items.length === 0) return null;
    return {
      type: "map",
      mapName,
      series: {
        data: items,
      },
    } satisfies MapChartData;
  }

  if (chartType === "pie") {
    if (orientation === "rows-as-series") {
      const labels = headers.slice(1).map((cell) => String(cell ?? "").trim());
      const valueRow = bodyRows[0] || [];
      const items = labels.map((name, index) => ({
        name,
        value: toNumber(valueRow[index + 1]),
      }));
      return createPieData(items);
    }

    const items = bodyRows.map((row) => ({
      name: String(row[0] ?? "").trim(),
      value: toNumber(row[1]),
    }));
    return createPieData(items);
  }

  if (orientation === "rows-as-series") {
    const xAxisLabels = headers.slice(1);
    if (xAxisLabels.length === 0) return null;

    const series = bodyRows.map((row, index) => ({
      id: `${instanceId}-series-${index + 1}`,
      name: String(row[0] ?? "").trim() || `Series ${index + 1}`,
      color: getThemeColor(index),
      colorSource: "theme" as const,
      themeColorIndex: index,
      values: xAxisLabels.map((_, valueIndex) => toNumber(row[valueIndex + 1])),
    }));

    if (series.length === 0) return null;
    return chartType === "line"
      ? createLineData(xAxisLabels, series)
      : createBarData(xAxisLabels, series);
  }

  const xAxisLabels = bodyRows.map((row) => String(row[0] ?? "").trim());
  const series = headers.slice(1).map((header, index) => ({
    id: `${instanceId}-series-${index + 1}`,
    name: header || `Series ${index + 1}`,
    color: getThemeColor(index),
    colorSource: "theme" as const,
    themeColorIndex: index,
    values: bodyRows.map((row) => toNumber(row[index + 1])),
  }));

  if (series.length === 0) return null;
  return chartType === "line"
    ? createLineData(xAxisLabels, series)
    : createBarData(xAxisLabels, series);
};
