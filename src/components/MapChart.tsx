import React, { useEffect, useState } from "react";
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
  // Use a unique map key per chart instance to avoid ECharts cache issues, but reuse if already registered
  const [currentMapName, setCurrentMapName] = useState(mapName);
  const [mapReady, setMapReady] = useState(false);

  // get regions from geomap
  const getRegionsFromGeoJson = (geoJson: any) => {
    if (!geoJson || !geoJson.features) return [];
    return geoJson.features.map((feature: any) => ({
      name: feature.properties.name,
      value: Math.round(Math.random() * 1000), // default value, can be updated with actual data later
    }));
  };

  const option = {
    title: {
      text: `${mapName.charAt(0).toUpperCase() + mapName.slice(1)} Map`,
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

        data: getRegionsFromGeoJson(echarts.getMap(currentMapName)?.geoJson),

        // data: [
        //   { name: "Vesturland", value: 500 },
        //   { name: "Vestfirðir", value: 300 },
        //   { name: "Norðurland vestra", value: 200 },
        //   { name: "Norðurland eystra", value: 400 },
        //   { name: "Austurland", value: 600 },
        //   { name: "Suðurland", value: 700 },
        //   { name: "Reykjavík", value: 800 },
        // ],
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
