import type {
  MapChartData,
  LineChartData,
  BarChartData,
  PieChartData,
} from "../components/chartTypes";

export type ChartData = LineChartData | BarChartData | PieChartData | MapChartData;

// ── Low-level helpers ────────────────────────────────────────────────────────

function downloadCSVFile(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv" });
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
  const rows = ["Region,Value"];
  (data.series?.data || []).forEach((region) => {
    rows.push(`"${region.name}",${region.value}`);
  });
  return rows.join("\n");
}

function lineOrBarChartDataToCSV(data: LineChartData | BarChartData): string {
  const seriesNames = data.series.map((s) => `"${s.name}"`).join(",");
  const header = `Category,${seriesNames}`;
  const dataRows = data.categories.map((cat, catIdx) => {
    const values = data.series.map((s) => s.values[catIdx] ?? "").join(",");
    return `"${cat}",${values}`;
  });
  return [header, ...dataRows].join("\n");
}

function pieChartDataToCSV(data: PieChartData): string {
  const rows = ["Name,Value"];
  data.data.forEach((point) => {
    rows.push(`"${point.name}",${point.value}`);
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
