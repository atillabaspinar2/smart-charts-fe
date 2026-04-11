import type {
  MapChartData,
  LineChartData,
  BarChartData,
  PieChartData,
} from "../components/chartTypes";

export type ChartData = LineChartData | BarChartData | PieChartData | MapChartData;

/** RFC 4180 field quoting (handles commas, quotes, newlines, Unicode). */
function csvEscapeField(value: string): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// ── Low-level helpers ────────────────────────────────────────────────────────

function downloadCSVFile(csv: string, filename: string) {
  // UTF-8 BOM helps Excel and other tools recognize encoding on Windows.
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Per-type converters ──────────────────────────────────────────────────────

function mapChartDataToCSV(data: MapChartData): string {
  // Row 1 col1 must be map id (see buildChartDataFromSheetRows); col2 is value column label.
  const mapId = data.mapName || "usa";
  const rows = [`${csvEscapeField(mapId)},Value`];
  (data.series?.data || []).forEach((region) => {
    rows.push(`${csvEscapeField(region.name)},${region.value}`);
  });
  return rows.join("\n");
}

function lineOrBarChartDataToCSV(data: LineChartData | BarChartData): string {
  const seriesNames = data.series.map((s) => csvEscapeField(s.name)).join(",");
  const header = `Category,${seriesNames}`;
  const dataRows = data.categories.map((cat, catIdx) => {
    const values = data.series.map((s) => s.values[catIdx] ?? "").join(",");
    return `${csvEscapeField(cat)},${values}`;
  });
  return [header, ...dataRows].join("\n");
}

function pieChartDataToCSV(data: PieChartData): string {
  const rows = ["Name,Value"];
  data.data.forEach((point) => {
    rows.push(`${csvEscapeField(point.name)},${point.value}`);
  });
  return rows.join("\n");
}

// ── Public export entry point ────────────────────────────────────────────────

export function exportChartDataToCSV(data: ChartData, filename?: string) {
  let csv = "";
  let defaultName = "chart-data.csv";

  switch (data.type) {
    case "line":
      csv = lineOrBarChartDataToCSV(data);
      defaultName = "line-data.csv";
      break;
    case "bar":
      csv = lineOrBarChartDataToCSV(data);
      defaultName = "bar-data.csv";
      break;
    case "pie":
      csv = pieChartDataToCSV(data);
      defaultName = "pie-data.csv";
      break;
    case "map":
      csv = mapChartDataToCSV(data);
      defaultName = `${data.mapName || "map"}-data.csv`;
      break;
    default:
      return;
  }

  downloadCSVFile(csv, filename ?? defaultName);
}

// ── Legacy export kept for backward compatibility ────────────────────────────

export function exportMapChartDataToCSV(
  data: MapChartData,
  filename = "map-data.csv",
) {
  downloadCSVFile(mapChartDataToCSV(data), filename);
}
