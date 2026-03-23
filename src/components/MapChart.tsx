import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { cloneDeep } from "lodash";
// import icelandGeoJson from "../assets/maps/iceland.geo.json";
import { Spinner } from "./UILibrary/Spinner";

interface MapChartProps {
  keyMap: string;
  theme?: string;
  option: any;
  mapName: string;
  seriesData: any;
  chartRef?: React.RefObject<ReactECharts>;
}

export const MapChart: React.FC<MapChartProps> = ({
  keyMap,
  theme,
  option,
  seriesData,
  chartRef,
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [registeredMapName, setRegisteredMapName] = useState<string | null>(
    null,
  );
  const [readyForAnimate, setReadyForAnimate] = useState(false);
  const [finalOption, setFinalOption] = useState(option);
  const internalChartRef = chartRef ?? React.useRef<ReactECharts>(null);

  const mapName = option.series[0].map;
  const mapData: { name: string; value: number }[] = seriesData || [];

  useEffect(() => {
    setMapReady(false);
    setReadyForAnimate(false);

    let isMounted = true;
    const registered = echarts.getMap(mapName);
    if (registered && registered.geoJson) {
      if (isMounted) {
        setMapReady(true);
        setRegisteredMapName(mapName);
      }
      return;
    }
    import(`../assets/maps/${mapName}.geo.json`)
      .then((geoJson) => {
        echarts.registerMap(mapName, geoJson.default || geoJson);
        if (isMounted) {
          setMapReady(true);
          setRegisteredMapName(mapName);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMapReady(false);
          setReadyForAnimate(false);
        }
        console.error(`Map ${mapName} not found`);
      });
    return () => {
      isMounted = false;
    };
  }, [mapName]);

  useEffect(() => {
    if (!mapReady || registeredMapName !== mapName) return;
    // Deep clone the option to avoid mutating props and preserve functions
    const newOption = cloneDeep(option);
    if (mapData.length === 0) {
      const registered = echarts.getMap(mapName);
      const regions =
        registered && registered.geoJson
          ? registered.geoJson.features.map((f: any) => f.properties.name)
          : [];
      newOption.series[0].data = regions.map((name: string) => ({
        name,
        value: 0,
      }));
    } else {
      newOption.series[0].data = mapData;
    }
    const min =
      mapData && mapData.length > 0
        ? Math.min(...mapData.map((d: { value: number }) => d.value))
        : 0;
    const max =
      mapData && mapData.length > 0
        ? Math.max(...mapData.map((d: { value: number }) => d.value))
        : 1000;
    newOption.visualMap.min = min;
    newOption.visualMap.max = max;
    newOption.series[0].itemStyle.opacity = 0;
    setFinalOption(newOption);
    setReadyForAnimate(true);
  }, [option, mapReady, mapData, mapName, registeredMapName]);

  const triggerAnimate = () => {
    // First, set opacity to 0 (forces rerender with transparent map)
    const echartsInstance = internalChartRef?.current?.getEchartsInstance();
    setTimeout(() => {
      if (internalChartRef?.current) {
        echartsInstance?.setOption(
          {
            series: [
              {
                itemStyle: { opacity: 1 },
                animationDelayUpdate:
                  option.series[0].animationDelayUpdate ??
                  ((idx: number) => idx * 100),
              },
            ],
          },
          false,
        );
      }
    }, 50); // delay to ensure the first update with opacity 0 is applied
  };

  useEffect(() => {
    if (!readyForAnimate) return;

    // Try again after a short delay
    setTimeout(triggerAnimate, 50);

    return;
  }, [option, readyForAnimate]);

  if (!mapReady || registeredMapName !== mapName) {
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
        ref={internalChartRef}
        theme={theme}
        option={finalOption}
        echarts={echarts}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};
