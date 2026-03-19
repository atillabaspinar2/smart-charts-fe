import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

interface MapChartSettings {
  mapName: string; // e.g., "world", "usa", "china", etc.
}

interface MapChartData {
  regions: { name: string; value: number }[];
}

interface MapChartProps {
  settings: MapChartSettings;
  data: MapChartData;
}

export const MapChart: React.FC<MapChartProps> = ({ settings }) => {
  const [geoJson, setGeoJson] = useState<any>(null);

  useEffect(() => {
    import(`../assets/maps/${settings.mapName}.geo.json`).then((mod) => {
      setGeoJson(mod.default || mod);
    });
  }, [settings.mapName]);

  if (!geoJson) return <div>Loading map...</div>;

  const option = {
    geo: {
      map: settings.mapName,
      roam: true,
      itemStyle: {
        areaColor: "#e7e8ea",
      },
    },
  };

  const onChartReady = (echarts: any) => {
    echarts.registerMap(settings.mapName, geoJson);
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: "100%", width: "100%" }}
      onChartReady={onChartReady}
    />
  );
};
