import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
// import icelandGeoJson from "../assets/maps/iceland.geo.json";
import { Spinner } from "./UILibrary/Spinner";

interface MapChartData {
  mapName: string;
  regions: { name: string; value: number }[];
}

interface MapChartProps {
  data: MapChartData;
}

export const MapChart: React.FC<MapChartProps> = ({ data }) => {
  const { mapName, regions = [] } = data;
  // Use a unique map key per chart instance to avoid ECharts cache issues
  const uniqueMapNameRef = useRef(`${mapName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const [currentMapName, setCurrentMapName] = useState(uniqueMapNameRef.current);
  const [mapReady, setMapReady] = useState(false);

  const option = {
    title: {
      text: `${mapName.charAt(0).toUpperCase() + mapName.slice(1)} Map`,
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    visualMap: {
      min: 0,
      max: 1000,
      left: "left",
      top: "bottom",
      text: ["High", "Low"],
      calculable: true,
    },
    series: [
      {
        name: `${mapName.charAt(0).toUpperCase() + mapName.slice(1)} Map`,
        type: "map",
        map: currentMapName,
        roam: true,
        data: regions,
      },
    ],
  };

  useEffect(() => {
    setMapReady(false);
    // Generate a new unique map name when mapName changes
    const newUniqueMapName = `${mapName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setCurrentMapName(newUniqueMapName);
    import(`../assets/maps/${mapName}.geo.json`)
      .then((geoJson) => {
        echarts.registerMap(newUniqueMapName, geoJson.default || geoJson);
        setMapReady(true);
      })
      .catch(() => setMapReady(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapName]);

  if (!mapReady) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <ReactECharts
      option={option}
      echarts={echarts}
      style={{ height: "100%", width: "100%" }}
    />
  );
};
