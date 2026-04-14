import type {
  BarChartData,
  LineChartData,
  PieChartData,
} from "../components/chartTypes";

export type DataOrientation = "columns-as-series" | "rows-as-series";

/** CP1252 bytes 0x80–0x9F → Unicode (reverse lookup for mojibake repair). */
const UNICODE_TO_CP1252_BYTE = new Map<number, number>([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

function unicodeCharToCp1252Byte(c: number): number | null {
  if (c < 0x80) return c;
  if (c >= 0xa0 && c <= 0xff) return c;
  return UNICODE_TO_CP1252_BYTE.get(c) ?? null;
}

function tryUtf8DecodeBytes(bytes: number[]): string | null {
  const recovered = new TextDecoder("utf-8", { fatal: false }).decode(
    Uint8Array.from(bytes),
  );
  if (recovered.includes("\uFFFD")) return null;
  return recovered;
}

/** UTF-8 file bytes mis-decoded as CP1252 (e.g. Î → Ã + Ž). */
function recoverUtf8MisreadAsCp1252(s: string): string | null {
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const b = unicodeCharToCp1252Byte(s.charCodeAt(i));
    if (b === null) return null;
    bytes.push(b);
  }
  return tryUtf8DecodeBytes(bytes);
}

/**
 * If UTF-8 bytes were misinterpreted as Latin-1 or Windows-1252, recover the original string.
 * Only runs when typical UTF-8 mojibake prefixes appear (Ã, Â), so valid text is unchanged.
 */
function normalizePossiblyMojibakedUtf8(s: string): string {
  const t = String(s ?? "").trim();
  if (!t) return t;
  if (!/[\u00c3\u00c2]/.test(t)) return t;

  // Path 1: UTF-8 misread as ISO-8859-1/Latin-1 (one byte per char, all ≤ U+00FF)
  const allLatin1 = [...t].every((ch) => ch.charCodeAt(0) <= 0xff);
  if (allLatin1) {
    const bytes = [...t].map((ch) => ch.charCodeAt(0));
    const r = tryUtf8DecodeBytes(bytes);
    if (r !== null) return r;
  }

  // Path 2: UTF-8 misread as Windows-1252 (e.g. "Î" → U+00C3 + U+017D)
  const r2 = recoverUtf8MisreadAsCp1252(t);
  return r2 ?? t;
}

function normalizeSheetCellStrings(rows: unknown[][]): unknown[][] {
  return rows.map((row) =>
    Array.isArray(row)
      ? row.map((cell) =>
          typeof cell === "string"
            ? normalizePossiblyMojibakedUtf8(cell)
            : cell,
        )
      : row,
  );
}

export const readSheetRowsFromFile = async (
  file: File,
): Promise<unknown[][]> => {
  const XLSX = await import("xlsx");
  const fileData = await file.arrayBuffer();
  const workbook = XLSX.read(fileData, { type: "array", codepage: 65001 });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("No sheets found in file.");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: true,
    defval: "",
  }) as unknown[][];
  return normalizeSheetCellStrings(rows);
};

export const buildChartDataFromSheetRows = (
  rows: unknown[][],
  chartType: "line" | "bar" | "pie",
  instanceId: string,
  getThemeColor: (index: number) => string,
  orientation: DataOrientation = "columns-as-series",
): LineChartData | BarChartData | PieChartData | null => {
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
