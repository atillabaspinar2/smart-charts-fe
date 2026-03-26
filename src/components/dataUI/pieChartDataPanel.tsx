import type { FC } from "react";
import { DataGrid, type GridSeriesRow } from "./DataGrid";
import { type PieChartData } from "../chartTypes";
import { DataPanelUnavailable } from "./DataPanelUnavailable";

interface PieChartDataPanelProps {
  data: PieChartData | undefined;
  onChange: (next: PieChartData) => void;
  registerApplyHandler?: (handler: (() => PieChartData) | null) => void;
}

export const PieChartDataPanel: FC<PieChartDataPanelProps> = ({
  data,
  onChange,
  registerApplyHandler,
}) => {
  if (
    !data ||
    data.type !== "pie" ||
    !Array.isArray(data.data)
  ) {
    return (
      <DataPanelUnavailable title="Pie chart data not ready">
        The editor cannot display until valid pie chart data is available.
      </DataPanelUnavailable>
    );
  }

  const categories = data.data.map((point) => point.name);
  const gridSeries: GridSeriesRow[] = [
    {
      id: "pie-series",
      name: data.seriesName || "Pie Series",
      color: "#3b82f6",
      values: data.data.map((point) => point.value),
    },
  ];

  const handleCategoriesChange = (nextCategories: string[]) => {
    const nextData = nextCategories.map((name, index) => ({
      id: data.data[index]?.id || `slice-${Date.now()}-${index + 1}`,
      name,
      value: data.data[index]?.value ?? 0,
    }));

    onChange({
      ...data,
      data: nextData,
    });
  };

  const handleSeriesChange = (nextSeries: GridSeriesRow[]) => {
    const primary = nextSeries[0] || {
      name: data.seriesName || "Pie Series",
      values: [],
    };

    const nextData = categories.map((name, index) => ({
      id: data.data[index]?.id || `slice-${Date.now()}-${index + 1}`,
      name,
      value: Number(primary.values[index] ?? 0),
    }));

    onChange({
      ...data,
      seriesName: primary.name,
      data: nextData,
    });
  };

  const handleDataChange = (
    nextCategories: string[],
    nextSeries: GridSeriesRow[],
  ) => {
    const primary = nextSeries[0] || {
      name: data.seriesName || "Pie Series",
      values: [],
    };

    const nextData = nextCategories.map((name, index) => ({
      id: data.data[index]?.id || `slice-${Date.now()}-${index + 1}`,
      name,
      value: Number(primary.values[index] ?? 0),
    }));

    onChange({
      ...data,
      seriesName: primary.name,
      data: nextData,
    });
  };

  const mapSnapshotToPieData = (
    nextCategories: string[],
    nextSeries: GridSeriesRow[],
  ): PieChartData => {
    const primary = nextSeries[0] || {
      name: data.seriesName || "Pie Series",
      values: [],
    };

    return {
      ...data,
      seriesName: primary.name,
      data: nextCategories.map((name, index) => ({
        id: data.data[index]?.id || `slice-${Date.now()}-${index + 1}`,
        name,
        value: Number(primary.values[index] ?? 0),
      })),
    };
  };

  return (
    <DataGrid
      categories={categories}
      series={gridSeries}
      onCategoriesChange={handleCategoriesChange}
      onSeriesChange={handleSeriesChange}
      onDataChange={handleDataChange}
      registerApplyHandler={
        registerApplyHandler
          ? (handler) => {
              registerApplyHandler(
                handler
                  ? () => {
                      const snapshot = handler();
                      return mapSnapshotToPieData(
                        snapshot.categories,
                        snapshot.series,
                      );
                    }
                  : null,
              );
            }
          : undefined
      }
      minSeries={1}
    />
  );
};
