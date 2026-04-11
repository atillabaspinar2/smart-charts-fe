import rough from "roughjs/bundled/rough.esm";
import * as echarts from "echarts";
import type { GeoComponentOption, SeriesOption } from "echarts";
import { formatMapGeoLabelText } from "@/components/mapChartOptions";
import { intensityToRoughSketchParams } from "./roughLineSeries";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "").slice(0, 6);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return [
    Math.round((rp + m) * 255),
    Math.round((gp + m) * 255),
    Math.round((bp + m) * 255),
  ];
}

/**
 * Strengthens choropleth separation: pushes low values lighter and high values darker,
 * and slightly raises saturation at the extremes so big value gaps read more clearly.
 */
function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
  const h = color.trim();
  if (h.startsWith("#") && h.length >= 7) return hexToRgb(h);
  const m = h.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) {
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
  }
  return null;
}

function boostMapChoroplethFill(color: string, t: number): string {
  const T = Math.min(1, Math.max(0, t));
  const rgb = parseColorToRgb(color);
  if (!rgb) return color;
  const { r, g, b } = rgb;
  const [hue, sat, lig] = rgbToHsl(r, g, b);
  const lig2 = Math.min(97, Math.max(3, lig + (0.5 - T) * 28));
  const sat2 = Math.min(
    100,
    Math.max(0, sat * (0.93 + 0.38 * Math.abs(T - 0.5))),
  );
  const [r2, g2, b2] = hslToRgb(hue, sat2, lig2);
  return `#${[r2, g2, b2].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/** Per-region hachure: denser lines for higher values + tighter baseline than bar/pie. */
function mapRegionRoughOptions(intensity: number, t: number) {
  const base = intensityToRoughSketchParams(intensity);
  const gapBase = Math.max(1.2, base.hachureGap * 0.58);
  const gapFactor = 1.42 - 0.62 * Math.min(1, Math.max(0, t));
  const hachureGap = Math.max(1, gapBase * gapFactor);
  const fillWeight = base.fillWeight * (0.88 + 0.42 * Math.min(1, Math.max(0, t)));
  return {
    roughness: base.roughness,
    bowing: base.bowing,
    strokeWidth: base.strokeWidth,
    fillWeight,
    hachureGap,
  };
}

/** Perceptually clearer than RGB lerp when `api.visual` is unavailable. */
function interpolateHexHsl(low: string, high: string, t: number): string {
  const T = Math.min(1, Math.max(0, t));
  const A = hexToRgb(low);
  const B = hexToRgb(high);
  const ha = rgbToHsl(A.r, A.g, A.b);
  const hb = rgbToHsl(B.r, B.g, B.b);
  let dh = hb[0] - ha[0];
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  const h = (ha[0] + dh * T + 360) % 360;
  const s = ha[1] + (hb[1] - ha[1]) * T;
  const l = ha[2] + (hb[2] - ha[2]) * T;
  const [r, g, b] = hslToRgb(h, s, l);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function pathsFromRoughGroup(
  g: SVGGElement,
  fallbackStroke: string,
  fallbackLineWidth: number,
) {
  const pathEls = g.querySelectorAll("path");
  return Array.from(pathEls).map((node) => {
    const el = node as SVGPathElement;
    const d = el.getAttribute("d") ?? "";
    const fillAttr = el.getAttribute("fill");
    const strokeAttr = el.getAttribute("stroke");
    return {
      type: "path" as const,
      shape: { pathData: d },
      style: {
        stroke: strokeAttr && strokeAttr !== "none" ? strokeAttr : fallbackStroke,
        fill:
          fillAttr && fillAttr !== "none" && fillAttr !== "transparent"
            ? fillAttr
            : ("none" as const),
        lineWidth: Number(el.getAttribute("stroke-width")) || fallbackLineWidth,
      },
    };
  });
}

function getOuterRings(geometry: {
  type: string;
  coordinates: unknown;
}): [number, number][][] {
  if (!geometry) return [];
  if (geometry.type === "Polygon") {
    const coords = geometry.coordinates as [number, number][][];
    return coords[0] ? [coords[0]] : [];
  }
  if (geometry.type === "MultiPolygon") {
    const multi = geometry.coordinates as [number, number][][][];
    return multi.map((poly) => poly[0]).filter(Boolean);
  }
  return [];
}

export type RoughMapSketchInput = {
  mapName: string;
  data: { name: string; value: number }[];
  min: number;
  max: number;
  colors: [string, string];
  intensity: number;
  roughSeed: number;
  borderColor: string;
  showLabel: boolean;
  showMapValues: boolean;
  labelColor: string;
  labelFontSize: number;
  aspectScale: number;
};

export function buildRoughMapSketchLayers(
  input: RoughMapSketchInput,
): { geo: GeoComponentOption; series: SeriesOption[] } {
  // Draw above the rough custom series (zlevel 0) so region labels stay crisp and readable.
  // A map series with geoIndex does not render at all (MapView bails when host geo exists).
  const geo: GeoComponentOption = {
    map: input.mapName,
    roam: false,
    aspectScale: input.aspectScale,
    layoutCenter: ["50%", "50%"],
    layoutSize: "95%",
    zlevel: 1,
    z: 0,
    label: {
      show: input.showLabel || input.showMapValues,
      color: input.labelColor,
      fontSize: input.labelFontSize,
      formatter(params: { name?: string } | string) {
        const name =
          typeof params === "string" ? params : (params?.name ?? "");
        const row = input.data.find((d) => d.name === name);
        return formatMapGeoLabelText(
          name,
          row?.value,
          input.showLabel,
          input.showMapValues,
        );
      },
    },
    itemStyle: {
      areaColor: "rgba(0,0,0,0)",
      borderColor: "rgba(0,0,0,0)",
      borderWidth: 0,
    },
    emphasis: {
      disabled: true,
    },
    silent: true,
  };

  const roughSeries: SeriesOption = {
    type: "custom",
    name: "Map",
    coordinateSystem: "geo",
    geoIndex: 0,
    animation: false,
    zlevel: 0,
    z: 2,
    dimensions: ["name", "value"],
    encode: { value: "value" },
    data: input.data.map((d) => ({ name: d.name, value: d.value })),
    renderItem(params, api) {
      const registered = echarts.getMap(input.mapName);
      if (!registered?.geoJson) return null;
      const inside = params.dataIndexInside ?? params.dataIndex;
      const row = input.data[inside];
      if (!row) return null;
      const feature = registered.geoJson.features.find(
        (f: { properties?: { name?: string } }) =>
          f.properties?.name === row.name,
      );
      if (!feature?.geometry) return null;

      const t =
        input.max === input.min
          ? 0
          : (row.value - input.min) / (input.max - input.min);
      const fromVisual = api.visual("color");
      const fillColorRaw =
        typeof fromVisual === "string" && fromVisual.length > 0
          ? fromVisual
          : interpolateHexHsl(input.colors[0], input.colors[1], t);
      const fillColor = boostMapChoroplethFill(fillColorRaw, t);
      const roughOpts = mapRegionRoughOptions(input.intensity, t);

      const rings = getOuterRings(
        feature.geometry as { type: string; coordinates: unknown },
      );
      const children: ReturnType<typeof pathsFromRoughGroup> = [];

      for (let ri = 0; ri < rings.length; ri++) {
        const ring = rings[ri];
        const pts: [number, number][] = [];
        for (const coord of ring) {
          const lng = coord[0];
          const lat = coord[1];
          const p = api.coord([lng, lat]);
          if (p && p.length >= 2) pts.push([p[0], p[1]]);
        }
        if (pts.length < 3) continue;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const rc = rough.svg(svg);
        const seed =
          input.roughSeed + inside * 131 + ri * 17 + row.name.length * 7;
        const g = rc.polygon(pts, {
          seed,
          stroke: input.borderColor,
          strokeWidth: roughOpts.strokeWidth,
          roughness: roughOpts.roughness,
          bowing: roughOpts.bowing,
          fill: fillColor,
          fillStyle: "hachure",
          fillWeight: roughOpts.fillWeight,
          hachureGap: roughOpts.hachureGap,
        });
        svg.appendChild(g);
        children.push(
          ...pathsFromRoughGroup(
            g,
            input.borderColor,
            roughOpts.strokeWidth,
          ),
        );
      }

      if (children.length === 0) return null;

      return {
        type: "group",
        children,
      };
    },
  };

  return { geo, series: [roughSeries] };
}
