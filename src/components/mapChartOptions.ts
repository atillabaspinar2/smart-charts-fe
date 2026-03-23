import * as echarts from "echarts";

// Helper to extract region names from geoJson
export function getRegionsFromGeoJson(
  geoJson: any,
): { name: string; value: number }[] {
  if (!geoJson || !geoJson.features) return [];
  return geoJson.features.map((feature: any) => ({
    name: feature.properties.name,
    value: 0,
  }));
}

export const getMapData = async (
  mapName: string,
): Promise<{ name: string; value: number }[]> => {
  try {
    const registered = echarts.getMap(mapName);
    if (registered && registered.geoJson) {
      return getRegionsFromGeoJson(registered.geoJson);
    } else {
      const geoJson = (await import(`../assets/maps/${mapName}.geo.json`))
        .default;
      return getRegionsFromGeoJson(geoJson);
    }
  } catch (e) {
    return [];
  }
};

export const colorRanges: { [key: string]: string[] } = {
  Blue: ["#e0f2fe", "#0369a1"],
  Yellow: ["#fef3c7", "#b45309"],
  Indigo: ["#dbeafe", "#1e40af"],
  Green: ["#f0fdf4", "#166534"],
  Red: ["#fef2f2", "#991b1b"],
};

export const defaultMapOptions = (mapName?: string) => {
  // Default to 'iceland' if not provided
  const effectiveMapName = mapName || "iceland";

  return {
    title: {
      text: `${effectiveMapName.charAt(0).toUpperCase() + effectiveMapName.slice(1) || "Map"} Map`,
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
        color: colorRanges.Indigo, // Default color range
      },
    },
    animation: true,

    universalTransition: true,
    series: [
      {
        // geoIndex: 0,
        name: `${effectiveMapName.charAt(0).toUpperCase() + effectiveMapName.slice(1)} Map`,
        type: "map",
        map: effectiveMapName,
        roam: true,
        label: {
          color: "red",
          fontSize: 25,
          show: true,
          // show val in tooltip instead of label
          // formatter: "{b}: {c}",
          formatter: "{c}",
        },
        animationDelayUpdate: (idx: number) => idx * 100,
        universalTransition: true,
        itemStyle: {
          borderColor: "#4B5563", // dark grey border
          borderWidth: 1, // Border thickness
          borderType: "solid", // 'solid', 'dashed', or 'dotted'
          shadowBlur: 4, // Glow/Shadow effect
          shadowColor: "rgba(0,0,0,0.2)",
          opacity: 0, // Control opacity for animation
        },

        data: [], // Data will be set dynamically
      },
    ],
  };
};
