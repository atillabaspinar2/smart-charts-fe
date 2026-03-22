import type { MapChartData } from "../components/chartTypes";

// Utility to convert MapChartData to CSV string
export function mapChartDataToCSV(data: MapChartData): string {
  const rows = ["Region,Value"];
  (data.series?.data || []).forEach((region) => {
    rows.push(`"${region.name}",${region.value}`);
  });
  return rows.join("\n");
}

// Utility to trigger download of a CSV file from a string
export function downloadCSVFile(csv: string, filename: string) {
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

// Main export function for MapChartData
export function exportMapChartDataToCSV(
  data: MapChartData,
  filename = "map-data.csv",
) {
  const csv = mapChartDataToCSV(data);
  downloadCSVFile(csv, filename);
}
