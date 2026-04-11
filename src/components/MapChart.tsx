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
  mapName: mapNameProp,
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

  const mapFromOption =
    option.geo && typeof option.geo === "object" && !Array.isArray(option.geo)
      ? (option.geo as { map?: string }).map
      : option.series?.[0]?.map;
  const effectiveMapName = mapFromOption || mapNameProp || option.mapName;
  const isRoughMapSketch =
    option.series?.[0]?.type === "custom" &&
    option.series?.[0]?.coordinateSystem === "geo";
  const mapData: { name: string; value: number }[] = seriesData || [];

  useEffect(() => {
    setMapReady(false);
    setReadyForAnimate(false);

    let isMounted = true;
    const registered = echarts.getMap(effectiveMapName);
    if (registered && registered.geoJson) {
      if (isMounted) {
        setMapReady(true);
        setRegisteredMapName(effectiveMapName);
      }
      return;
    }
    import(`../assets/maps/${effectiveMapName}.geo.json`)
      .then((geoJson) => {
        echarts.registerMap(effectiveMapName, geoJson.default || geoJson);
        if (isMounted) {
          setMapReady(true);
          setRegisteredMapName(effectiveMapName);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMapReady(false);
          setReadyForAnimate(false);
        }
        console.error(`Map ${effectiveMapName} not found`);
      });
    return () => {
      isMounted = false;
    };
  }, [effectiveMapName]);

  useEffect(() => {
    if (!mapReady || registeredMapName !== effectiveMapName) return;
    // Deep clone the option to avoid mutating props and preserve functions
    const newOption = cloneDeep(option);
    if (mapData.length === 0) {
      const registered = echarts.getMap(effectiveMapName);
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
    if (!isRoughMapSketch) {
      newOption.series[0].itemStyle = {
        ...newOption.series[0].itemStyle,
        opacity: 0,
      };
    }
    setFinalOption(newOption);
    setReadyForAnimate(true);
  }, [
    option,
    mapReady,
    mapData,
    effectiveMapName,
    registeredMapName,
    isRoughMapSketch,
  ]);

  const triggerAnimate = () => {
    if (isRoughMapSketch) return;
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
                  ((idx: number) => idx * 20),
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
    if (isRoughMapSketch) return;

    // Try again after a short delay
    setTimeout(triggerAnimate, 50);

    return;
  }, [option, readyForAnimate, isRoughMapSketch]);

  if (!mapReady || registeredMapName !== effectiveMapName) {
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
