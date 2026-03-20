import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
// import icelandGeoJson from "../assets/maps/iceland.geo.json";
import worldGeoJson from "../assets/maps/world.geo.json";
import { Spinner } from "./UILibrary/Spinner";

interface MapChartData {
  regions: { name: string; value: number }[];
}

interface MapChartProps {
  data: MapChartData;
}

export const MapChart: React.FC<MapChartProps> = ({ data }) => {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // echarts.registerMap("iceland", icelandGeoJson as any);
    echarts.registerMap("world", worldGeoJson as any);
    setTimeout(() => {
      setMapReady(true);
    }, 0); // Small delay to ensure map is registered before rendering
  }, []);

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

  const option = {
    title: {
      text: "World Map",
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
        name: "World Map",
        type: "map",
        map: "world", //this name should match the one used in registerMap
        roam: true,
        // label: {
        //   show: true,
        //   color: "#555",
        // },
        data: data?.regions || [],
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      echarts={echarts}
      style={{ height: "100%", width: "100%" }}
    />
  );
};
