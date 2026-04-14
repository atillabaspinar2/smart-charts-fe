import * as echarts from "echarts";

/** Default map: `usa` is lighter than world/countries GeoJSON for first paint. */
export const DEFAULT_MAP_NAME = "usa";

/** Map ids matching `src/assets/maps/<id>.geo.json` — single source for picker + import matching. */
export const AVAILABLE_MAP_OPTIONS: readonly { name: string; value: string }[] = [
  { name: "United States", value: "usa" },
  { name: "World (low resolution)", value: "world-lowres" },
  { name: "Continents", value: "continents" },
  { name: "Countries", value: "countries" },
  { name: "Africa", value: "africa" },
  { name: "Europe", value: "europe" },
  { name: "European Union", value: "european-union" },
  { name: "South America", value: "southamerica" },
  { name: "China", value: "cn-all" },
  { name: "France (mainland)", value: "fr-all-mainland" },
  { name: "Germany", value: "germany" },
  { name: "Germany (admin)", value: "de-all" },
  { name: "Spain", value: "es-all" },
  { name: "United Kingdom", value: "gb-all" },
  { name: "Netherlands", value: "nl-all" },
  { name: "Russia", value: "ru-all" },
  { name: "Iran", value: "ir-all" },
  { name: "Iceland", value: "iceland" },
  { name: "Türkiye", value: "turkiye" },
  { name: "United States (small)", value: "us-small" },
] as const;

export const KNOWN_MAP_IDS: readonly string[] = AVAILABLE_MAP_OPTIONS.map(
  (o) => o.value,
);

// Helper to extract region names from geoJson (Highcharts mapdata uses `name`; fallback `hc-key`)
export function getRegionsFromGeoJson(
  geoJson: any,
): { name: string; value: number }[] {
  if (!geoJson || !geoJson.features) return [];
  return geoJson.features.map((feature: any) => {
    const p = feature.properties ?? {};
    const name =
      (typeof p.name === "string" && p.name.trim()) ||
      (typeof p["hc-key"] === "string" && p["hc-key"]) ||
      (feature.id != null ? String(feature.id) : "");
    return { name, value: 0 };
  });
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

/**
 * Optional per-map defaults in `src/assets/mapPopulation/<mapName>.json`:
 * `{ "<region name from geo>": populationNumber }`. Keys must match `properties.name` from the geo file.
 */
export async function loadMapPopulationDefaults(
  mapName: string,
): Promise<Record<string, number>> {
  try {
    const mod = await import(`../assets/mapPopulation/${mapName}.json`);
    return (mod.default ?? mod) as Record<string, number>;
  } catch {
    return {};
  }
}

/** Region list with values from `mapPopulation` file when present, else 0. */
export async function getMapDataWithPopulationDefaults(
  mapName: string,
): Promise<{ name: string; value: number }[]> {
  const regions = await getMapData(mapName);
  const defaults = await loadMapPopulationDefaults(mapName);
  if (Object.keys(defaults).length === 0) return regions;
  return regions.map((r) => ({
    name: r.name,
    value: defaults[r.name] ?? 0,
  }));
}

export const colorRanges: { [key: string]: string[] } = {
  Blue: ["#e0f2fe", "#0369a1"],
  Yellow: ["#fef3c7", "#b45309"],
  Indigo: ["#dbeafe", "#1e40af"],
  Green: ["#f0fdf4", "#166534"],
  Red: ["#fef2f2", "#991b1b"],
};

/** Map series / geo label template: `{b}` region name, `{c}` value. */
export function mapSeriesLabelFormatter(
  showLabel: boolean,
  showMapValues: boolean,
): string {
  if (showLabel && showMapValues) return "{b} {c}";
  if (showLabel) return "{b}";
  if (showMapValues) return "{c}";
  return "{b}";
}

/** Sketch geo labels (no series context): same semantics as {@link mapSeriesLabelFormatter}. */
export function formatMapGeoLabelText(
  regionName: string,
  value: number | undefined,
  showLabel: boolean,
  showMapValues: boolean,
): string {
  const valueStr =
    value !== undefined && value !== null && !Number.isNaN(Number(value))
      ? String(value)
      : "";
  if (!showLabel && !showMapValues) return "";
  if (showLabel && showMapValues) {
    const parts: string[] = [];
    if (regionName) parts.push(regionName);
    if (valueStr) parts.push(valueStr);
    return parts.join(" ");
  }
  if (showLabel) return regionName;
  return valueStr;
}

export const defaultMapOptions = (mapName?: string) => {
  const effectiveMapName = mapName || DEFAULT_MAP_NAME;
  const mapTitle =
    effectiveMapName === "usa"
      ? "USA"
      : effectiveMapName.charAt(0).toUpperCase() + effectiveMapName.slice(1);

  return {
    title: {
      text: `${mapTitle || "Map"} Map`,
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


    series: [
      {
        // geoIndex: 0,
        name: `${mapTitle} Map`,
        type: "map",
        map: effectiveMapName,
        // Disable roam/pan so users can't accidentally drag the map (center moves)
        // and it doesn't trigger heavy redraws while dragging.
        roam: false,
        label: {
          color: "black",
          fontSize: 10,
          show: false,
          // show val in tooltip instead of label
          // formatter: "{b}: {c}",
          formatter: "{c}",
        },
        animationDelayUpdate: (idx: number) => idx * 20,
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
