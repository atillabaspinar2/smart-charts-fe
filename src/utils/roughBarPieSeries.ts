import rough from "roughjs/bundled/rough.esm";
import {
  cumulativeBottom,
  cumulativeTop,
  getRoughLineYAxisExtent,
  intensityToRoughSketchParams,
} from "./roughLineSeries";

/**
 * Value-axis extent for rough bar charts. Always includes 0 so `coord([cat, 0])` lies on
 * the category axis (otherwise positive-only bars render with a floating baseline).
 */
export function getRoughBarValueAxisExtent(
  series: Array<{ values: number[] }>,
  categoryCount: number,
  barStack: boolean,
): { min: number; max: number } {
  const ext = getRoughLineYAxisExtent(series, categoryCount, barStack, false);
  return {
    min: Math.min(0, ext.min),
    max: Math.max(0, ext.max),
  };
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

function barGeometryVertical(
  api: {
    coord: (v: [number, number]) => number[] | undefined;
    size: (v: [number, number]) => number[];
  },
  catIndex: number,
  yTop: number,
  yBottom: number,
  seriesIndex: number,
  seriesCount: number,
  stacked: boolean,
): { x: number; y: number; width: number; height: number } | null {
  const pTop = api.coord([catIndex, yTop]);
  const pBot = api.coord([catIndex, yBottom]);
  if (!pTop || !pBot) return null;
  const band = api.size([1, 0])[0];
  const cx = pTop[0];
  const h = Math.abs(pBot[1] - pTop[1]);
  const y = Math.min(pTop[1], pBot[1]);
  let w: number;
  let x: number;
  if (stacked) {
    w = band * 0.55;
    x = cx - w / 2;
  } else {
    const inner = band * 0.78;
    const gapRatio = 0.25;
    const barW = inner / (seriesCount + gapRatio * (seriesCount - 1));
    const step = barW * (1 + gapRatio);
    const startX = cx - inner / 2 + barW / 2;
    const barCx = startX + seriesIndex * step;
    w = barW;
    x = barCx - w / 2;
  }
  return { x, y, width: w, height: h };
}

function barGeometryHorizontal(
  api: {
    coord: (v: [number, number]) => number[] | undefined;
    size: (v: [number, number]) => number[];
  },
  catIndex: number,
  xLeft: number,
  xRight: number,
  seriesIndex: number,
  seriesCount: number,
  stacked: boolean,
): { x: number; y: number; width: number; height: number } | null {
  const pL = api.coord([xLeft, catIndex]);
  const pR = api.coord([xRight, catIndex]);
  if (!pL || !pR) return null;
  const band = api.size([0, 1])[1];
  const cy = pL[1];
  const left = Math.min(pL[0], pR[0]);
  const width = Math.abs(pR[0] - pL[0]);
  let h: number;
  let y: number;
  if (stacked) {
    h = band * 0.55;
    y = cy - h / 2;
  } else {
    const inner = band * 0.78;
    const gapRatio = 0.25;
    const barH = inner / (seriesCount + gapRatio * (seriesCount - 1));
    const step = barH * (1 + gapRatio);
    const startY = cy - inner / 2 + barH / 2;
    const barCy = startY + seriesIndex * step;
    h = barH;
    y = barCy - h / 2;
  }
  return { x: left, y, width, height: h };
}

export type RoughBarSeriesInput = {
  categories: string[];
  series: Array<{ name: string; values: number[]; color: string }>;
  intensity: number;
  roughSeed: number;
  barStack: boolean;
  horizontal: boolean;
};

export function buildRoughBarCustomSeries(input: RoughBarSeriesInput) {
  const { roughness, bowing, strokeWidth, fillWeight, hachureGap } =
    intensityToRoughSketchParams(input.intensity);
  const seriesCount = input.series.length;

  return input.series.map((series, seriesIndex) => ({
    type: "custom" as const,
    name: series.name,
    coordinateSystem: "cartesian2d" as const,
    animation: false,
    encode: { x: 0, y: 1 },
    data: input.categories.map((_, i) => {
      const v = input.barStack
        ? cumulativeTop(input.series, seriesIndex, i)
        : (series.values[i] ?? 0);
      return (
        input.horizontal ? ([v, i] as [number, number]) : ([i, v] as [number, number])
      );
    }),
    z: seriesIndex,
    renderItem(
      params: { dataIndex: number },
      api: { coord: (v: [number, number]) => number[] | undefined; size: (v: [number, number]) => number[] },
    ) {
      const i = params.dataIndex;
      const yTop = input.barStack
        ? cumulativeTop(input.series, seriesIndex, i)
        : (series.values[i] ?? 0);
      const yBottom = input.barStack
        ? cumulativeBottom(input.series, seriesIndex, i)
        : 0;

      let rect: { x: number; y: number; width: number; height: number } | null;
      if (input.horizontal) {
        rect = barGeometryHorizontal(
          api,
          i,
          yBottom,
          yTop,
          seriesIndex,
          seriesCount,
          input.barStack,
        );
      } else {
        rect = barGeometryVertical(
          api,
          i,
          yTop,
          yBottom,
          seriesIndex,
          seriesCount,
          input.barStack,
        );
      }
      if (!rect || rect.width <= 0 || rect.height <= 0) return null;

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const rc = rough.svg(svg);
      const seed = input.roughSeed + seriesIndex * 1337 + (i + 1) * 97;
      const g = rc.rectangle(rect.x, rect.y, rect.width, rect.height, {
        seed,
        stroke: series.color,
        strokeWidth,
        roughness,
        bowing,
        fill: series.color,
        fillStyle: "hachure",
        fillWeight,
        hachureGap,
      });
      svg.appendChild(g);

      return {
        type: "group" as const,
        children: pathsFromRoughGroup(g, series.color, strokeWidth),
      };
    },
  }));
}

/** Annulus sector as polygon (outer arc + inner arc). Angles in radians, clockwise from 3 o'clock; start from top (-π/2). */
function donutSlicePolygon(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  a0: number,
  a1: number,
  segments: number,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let s = 0; s <= segments; s++) {
    const t = a0 + ((a1 - a0) * s) / segments;
    pts.push([cx + rOuter * Math.cos(t), cy + rOuter * Math.sin(t)]);
  }
  for (let s = segments; s >= 0; s--) {
    const t = a0 + ((a1 - a0) * s) / segments;
    pts.push([cx + rInner * Math.cos(t), cy + rInner * Math.sin(t)]);
  }
  return pts;
}

export type RoughPieSlice = { name: string; value: number; color: string };

export type RoughPieSeriesInput = {
  slices: RoughPieSlice[];
  intensity: number;
  roughSeed: number;
  innerRadiusPct: number;
  outerRadiusPct: number;
  padAngleDeg: number;
  borderWidth: number;
  /** Legend show/hide (sketch pie): ECharts applies this via data itemStyle; bar sketch avoids this by using one series per legend item. */
  sliceLegendOpacity?: (name: string) => number;
};

function sliceVisibleInLegend(
  api: { style?: (extra?: unknown, dataIndexInside?: number) => Record<string, unknown> },
  dataIndex: number,
): boolean {
  const st = api.style?.(undefined, dataIndex);
  if (!st) return true;
  const op = st.opacity;
  const fo = st.fillOpacity;
  if (op === 0 || op === "0") return false;
  if (fo === 0 || fo === "0") return false;
  return true;
}

export function buildRoughPieCustomSeries(input: RoughPieSeriesInput) {
  const { roughness, bowing, strokeWidth, fillWeight, hachureGap } =
    intensityToRoughSketchParams(input.intensity);
  const sliceCount = input.slices.length;
  const padRad = (input.padAngleDeg * Math.PI) / 180;

  return {
    type: "custom" as const,
    coordinateSystem: "cartesian2d" as const,
    animation: false,
    legendHoverLink: true,
    data: input.slices.map((s) => ({
      value: s.value,
      name: s.name,
      itemStyle: {
        color: s.color,
        opacity: input.sliceLegendOpacity?.(s.name) ?? 1,
      },
    })),
    renderItem(
      params: {
        dataIndex: number;
        coordSys: { x: number; y: number; width: number; height: number };
      },
      api: { style?: (extra?: unknown, dataIndexInside?: number) => Record<string, unknown> },
    ) {
      const coordSys = params.coordSys;
      const cx = coordSys.x + coordSys.width / 2;
      const cy = coordSys.y + coordSys.height / 2;
      const rBase = Math.min(coordSys.width, coordSys.height) / 2;
      const rMax = rBase * (input.outerRadiusPct / 100);
      const rMin = rBase * (input.innerRadiusPct / 100);
      const i = params.dataIndex;
      if (!input.slices[i]) return null;

      if (!sliceVisibleInLegend(api, i)) return null;

      const vis: number[] = [];
      for (let j = 0; j < sliceCount; j++) {
        if (sliceVisibleInLegend(api, j)) vis.push(j);
      }
      if (vis.length === 0) return null;

      let visibleTotal = 0;
      for (const j of vis) {
        visibleTotal += Math.max(0, input.slices[j].value);
      }
      if (visibleTotal <= 0) return null;

      const gapTotal =
        vis.length > 1 ? Math.min(padRad * vis.length, Math.PI * 1.9) : 0;
      const avail = 2 * Math.PI - gapTotal;

      const visIdx = vis.indexOf(i);
      if (visIdx < 0) return null;

      let a = -Math.PI / 2;
      for (let t = 0; t < visIdx; t++) {
        const k = vis[t];
        const vk = Math.max(0, input.slices[k].value);
        a += (vk / visibleTotal) * avail + padRad;
      }
      const vi = Math.max(0, input.slices[i].value);
      const sweep = (vi / visibleTotal) * avail;
      const a0 = a;
      const a1 = a + Math.max(0.0001, sweep);

      const poly = donutSlicePolygon(cx, cy, rMin, rMax, a0, a1, 24);
      const color = input.slices[i].color;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const rc = rough.svg(svg);
      const seed = input.roughSeed + i * 7919;
      const g = rc.polygon(poly, {
        seed,
        stroke: color,
        strokeWidth: Math.max(1, input.borderWidth || 1),
        roughness,
        bowing,
        fill: color,
        fillStyle: "hachure",
        fillWeight,
        hachureGap,
      });
      svg.appendChild(g);

      return {
        type: "group" as const,
        children: pathsFromRoughGroup(g, color, strokeWidth),
      };
    },
  };
}
