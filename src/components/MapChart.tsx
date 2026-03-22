import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
// import icelandGeoJson from "../assets/maps/iceland.geo.json";
import { Spinner } from "./UILibrary/Spinner";

interface MapChartProps {
  keyMap: string;
  theme?: string;
  mapName: string;
  regionData?: { name: string; value: number }[];
  mapDataGenerated?: (data: { name: string; value: number }[]) => void;
}

export const MapChart: React.FC<MapChartProps> = ({
  keyMap,
  theme,
  mapName,
  regionData,
  mapDataGenerated,
}) => {
  // default map, can be made dynamic later
  // Use a unique map key per chart instance to avoid ECharts cache issues, but reuse if already registered
  const [currentMapName, setCurrentMapName] = useState(mapName);
  const [mapReady, setMapReady] = useState(false);
  const [mapData, setMapData] = useState<{ name: string; value: number }[]>([]);
  const [opacity, setOpacity] = useState(0); // controls the map opacity in option
  const chartRef = React.useRef<ReactECharts>(null);

  const min =
    mapData && mapData.length > 0
      ? Math.min(...mapData.map((d) => d.value))
      : 0;
  const max =
    mapData && mapData.length > 0
      ? Math.max(...mapData.map((d) => d.value))
      : 1000;

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
    aspectScale: 1.0,

    visualMap: {
      type: "piecewise",
      left: "right",

      inRange: {
        color: ["#e0f2fe", "#0369a1"], // Light blue to Dark blue
        //color light green to dark green
        // color: ["#d1fae5", "#065f46"],
      },
      // pieces: [
      //   { gt: 600, label: "High Performance" },
      //   { gt: 300, lte: 600, label: "Average" },
      //   { lte: 100, label: "Low" },
      // ],
    },
    animationDelayUpdate: function (idx: number) {
      return idx * 10;
    },
    series: [
      {
        // geoIndex: 0,
        name: `${mapName.charAt(0).toUpperCase() + mapName.slice(1)} Map`,
        type: "map",
        map: currentMapName,
        roam: true,
        label: {
          textStyle: {
            // dark red color for better contrast on light blue map
            color: "black",
            fontSize: 16,
          },
          show: true,
          // show val in tooltip instead of label
          // formatter: "{b}: {c}",
          formatter: "{c}",
        },
        universalTransition: true,
        itemStyle: {
          borderColor: "blue", // Border color (e.g., Slate 300)
          borderWidth: 1, // Border thickness
          borderType: "solid", // 'solid', 'dashed', or 'dotted'
          shadowBlur: 4, // Glow/Shadow effect
          shadowColor: "rgba(0,0,0,0.2)",
          opacity: 0, // Control opacity for animation
        },

        data: mapData,
      },
    ],
  };

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

  const triggerAnimate = () => {
    // First, set opacity to 0 (forces rerender with transparent map)
    const echartsInstance = chartRef?.current?.getEchartsInstance();

    setTimeout(() => {
      if (chartRef?.current) {
        echartsInstance?.setOption(
          {
            visualMap: {
              min,
              max,
            },
            series: [
              {
                itemStyle: { opacity: 1 },
              },
            ],
          },
          false,
        );
      }
      setOpacity(0);
    }, 50); // delay to ensure the first update with opacity 0 is applied
  };

  // Call triggerAnimate on every render of the current map

  triggerAnimate();

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
    <div style={{ height: "100%", width: "100%" }}>
      <ReactECharts
        key={keyMap}
        ref={chartRef}
        theme={theme}
        option={option}
        echarts={echarts}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};
