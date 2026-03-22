import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
// import icelandGeoJson from "../assets/maps/iceland.geo.json";
import { Spinner } from "./UILibrary/Spinner";

interface MapChartProps {
  keyMap: string;
  theme?: string;
  option: any;
  mapName: string;
  seriesData: any;
}

export const MapChart: React.FC<MapChartProps> = ({
  keyMap,
  theme,
  option,
  seriesData,
}) => {
  // default map, can be made dynamic later
  // Use a unique map key per chart instance to avoid ECharts cache issues, but reuse if already registered

  const [mapReady, setMapReady] = useState(false);
  const [optionWithDataReady, setOptionWithDataReady] = useState(false);
  const chartRef = React.useRef<ReactECharts>(null);

  console.log("MapChart received option:", option);
  const mapData = seriesData || [];

  useEffect(() => {
    const registered = echarts.getMap(option.series[0].map);
    if (registered && registered.geoJson) {
      setMapReady(true);
      return;
    }
    // Otherwise, register with the original map name
    import(`../assets/maps/${option.series[0].map}.geo.json`)
      .then((geoJson) => {
        echarts.registerMap(option.series[0].map, geoJson.default || geoJson);

        setMapReady(true);
      })
      .catch(() => setMapReady(false));
  }, [option.series[0].map]);

  useEffect(() => {
    const echartsInstance = chartRef?.current?.getEchartsInstance();
    if (echartsInstance) {
      const min =
        mapData && mapData.length > 0
          ? Math.min(...mapData.map((d) => d.value))
          : 0;
      const max =
        mapData && mapData.length > 0
          ? Math.max(...mapData.map((d) => d.value))
          : 1000;

      option.visualMap.min = min;
      option.visualMap.max = max;
      option.series[0].data = mapData;
      echartsInstance.setOption(option, false);
      setOptionWithDataReady(true);
    }
  }, [option]);

  const triggerAnimate = () => {
    // First, set opacity to 0 (forces rerender with transparent map)
    const echartsInstance = chartRef?.current?.getEchartsInstance();

    const options = (echartsInstance?.getOption() as any)?.series?.[0]
      ?.itemStyle;
    console.log("Current options:", options);

    setTimeout(() => {
      if (chartRef?.current) {
        echartsInstance?.setOption(
          {
            series: [
              {
                itemStyle: { opacity: 1 },
              },
            ],
          },
          false,
        );
      }
    }, 50); // delay to ensure the first update with opacity 0 is applied
  };

  // useEffect(() => {
  //   triggerAnimate();
  // }, [optionWithDataReady]);
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
