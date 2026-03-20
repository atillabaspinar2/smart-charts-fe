import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
// import icelandGeoJson from "../assets/maps/iceland.geo.json";
import { Spinner } from "./UILibrary/Spinner";

interface MapChartProps {
  mapName: string;
  regionData?: { name: string; value: number }[];
  mapDataGenerated?: (data: { name: string; value: number }[]) => void;
}

export const MapChart: React.FC<MapChartProps> = ({
  mapName,
  regionData,
  mapDataGenerated,
}) => {
  // default map, can be made dynamic later
  // Use a unique map key per chart instance to avoid ECharts cache issues, but reuse if already registered
  const [currentMapName, setCurrentMapName] = useState(mapName);
  const [mapReady, setMapReady] = useState(false);
  const [mapData, setMapData] = useState<{ name: string; value: number }[]>([]);

  // get regions from geomap

  // Always use geoJson for region names, but preserve values from regionData if available
  useEffect(() => {
    const getRegionsFromGeoJson = (geoJson: any) => {
      if (!geoJson || !geoJson.features) return [];
      return geoJson.features.map((feature: any) => ({
        name: feature.properties.name,
        value: 0, // default value, can be updated with actual data later
      }));
    };
    const geoRegions = getRegionsFromGeoJson(
      echarts.getMap(currentMapName || "countries")?.geoJson,
    );
    // Merge values from regionData if present
    const merged = geoRegions.map((region: { name: string }) => {
      const found = regionData?.find((r) => r.name === region.name);
      return found ? { ...region, value: found.value } : region;
    });
    setMapData(merged);
    if (mapDataGenerated) {
      mapDataGenerated(merged);
    }
  }, [currentMapName, mapDataGenerated, regionData]);

  const option = {
    title: {
      text: `${mapName.charAt(0).toUpperCase() + mapName?.slice(1) || "Map"} Map`,
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    animationDurationUpdate: 5000,
    // visualMap: {
    //   min: 0,
    //   zoom: 1.5,
    //   max: 1000,
    //   left: "left",
    //   top: "bottom",
    //   text: ["High", "Low"],
    //   calculable: true,
    //   inRange: {
    //     color: ["#e0f2fe", "#0369a1"], // Light blue to Dark blue
    //   },
    // },

    visualMap: {
      type: "piecewise",
      inRange: {
        color: ["#e0f2fe", "#0369a1"], // Light blue to Dark blue
      },
      // pieces: [
      //   { gt: 600, label: "High Performance" },
      //   { gt: 300, lte: 600, label: "Average" },
      //   { lte: 100, label: "Low" },
      // ],
    },
    series: [
      {
        name: `${mapName.charAt(0).toUpperCase() + mapName.slice(1)} Map`,
        type: "map",
        map: currentMapName,
        roam: true,
        label: {
          textStyle: {
            // dark red color for better contrast on light blue map
            color: "#b91c1c",

            fontSize: 16,
          },
          show: true,
          // show val in tooltip instead of label
          // formatter: "{b}: {c}",
          formatter: "{c}",
        },
        itemStyle: {
          areaColor: "#ffffff", // Fill color of the region
          borderColor: "blue", // Border color (e.g., Slate 300)
          borderWidth: 1, // Border thickness
          borderType: "solid", // 'solid', 'dashed', or 'dotted'
          shadowBlur: 4, // Glow/Shadow effect
          shadowColor: "rgba(0,0,0,0.2)",
        },

        data: mapData,
      },
    ],
  };
  console.log("MapChart option:", option);

  useEffect(() => {
    setMapReady(false);
    // If the map is already registered, reuse the map name
    const registered = echarts.getMap(mapName);
    if (registered && registered.geoJson) {
      setCurrentMapName(mapName);
      setMapReady(true);
      return;
    }
    // Otherwise, register with the original map name
    import(`../assets/maps/${mapName}.geo.json`)
      .then((geoJson) => {
        echarts.registerMap(mapName, geoJson.default || geoJson);
        setCurrentMapName(mapName);
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
