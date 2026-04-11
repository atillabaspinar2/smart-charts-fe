import rough from "roughjs/bundled/rough.esm";

/** Migrate legacy `lineSketchRoughness` (0.5–2.5) to 0–100 intensity. */
export function resolveLineSketchIntensity(s: {
  lineSketchIntensity?: number;
  lineSketchRoughness?: number;
}): number {
  if (typeof s.lineSketchIntensity === "number") {
    return Math.min(100, Math.max(0, s.lineSketchIntensity));
  }
  if (typeof s.lineSketchRoughness === "number") {
    const r = Math.min(2.5, Math.max(0.5, s.lineSketchRoughness));
    return Math.round(((r - 0.5) / 2) * 100);
  }
  return 50;
}

/** Shared 0–100 sketch intensity for line, bar, pie, or map chart settings. */
export function resolveSketchIntensity(s: {
  lineSketchIntensity?: number;
  barSketchIntensity?: number;
  pieSketchIntensity?: number;
  mapSketchIntensity?: number;
  lineSketchRoughness?: number;
}): number {
  if (typeof s.lineSketchIntensity === "number") {
    return Math.min(100, Math.max(0, s.lineSketchIntensity));
  }
  if (typeof s.barSketchIntensity === "number") {
    return Math.min(100, Math.max(0, s.barSketchIntensity));
  }
  if (typeof s.pieSketchIntensity === "number") {
    return Math.min(100, Math.max(0, s.pieSketchIntensity));
  }
  if (typeof s.mapSketchIntensity === "number") {
    return Math.min(100, Math.max(0, s.mapSketchIntensity));
  }
  return resolveLineSketchIntensity({
    lineSketchRoughness: s.lineSketchRoughness,
  });
}

export function resolveMapSketchIntensity(s: {
  mapSketchIntensity?: number;
}): number {
  if (typeof s.mapSketchIntensity === "number") {
    return Math.min(100, Math.max(0, s.mapSketchIntensity));
  }
  return 50;
}

/** 0 = subtle, 100 = strongest sketch (roughness + bowing + stroke width). */
export function intensityToRoughSketchParams(intensity: number) {
  const t = Math.min(100, Math.max(0, intensity)) / 100;
  return {
    roughness: 0.5 + t * 2.2,
    bowing: 0.05 + t * 1.45,
    strokeWidth: 1.25 + t * 3.25,
    /** Hachure fill density scales slightly with intensity */
    fillWeight: 0.4 + t * 1.2,
    hachureGap: Math.max(2, 8 - t * 5),
  };
}

/** Fill color with alpha for Rough fills (hex or rgb). */
function withAlpha(color: string, alpha: number): string {
  const h = color.trim();
  if (h.startsWith("#") && h.length === 7) {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const m = h.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) {
    return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;
  }
  return h;
}

/** Cumulative stacked value at category `i` including series `s`. */
export function cumulativeTop(
  allSeries: Array<{ values: number[] }>,
  seriesIndex: number,
  catIndex: number,
): number {
  let sum = 0;
  for (let j = 0; j <= seriesIndex; j++) {
    sum += allSeries[j].values[catIndex] ?? 0;
  }
  return sum;
}

/** Baseline (bottom of band) for stacked series `s` at category `i`. */
export function cumulativeBottom(
  allSeries: Array<{ values: number[] }>,
  seriesIndex: number,
  catIndex: number,
): number {
  if (seriesIndex === 0) return 0;
  let sum = 0;
  for (let j = 0; j < seriesIndex; j++) {
    sum += allSeries[j].values[catIndex] ?? 0;
  }
  return sum;
}

/**
 * Y extent for rough line custom series. ECharts infers scale from encoded `y` (raw
 * per-series values), which is wrong for stack — use cumulative values for every series.
 * Call when sketch + stack so the axis matches built-in stacked line/area.
 */
export function getRoughLineYAxisExtent(
  series: Array<{ values: number[] }>,
  categoryCount: number,
  lineStack: boolean,
  lineArea: boolean,
): { min: number; max: number } {
  if (categoryCount === 0 || series.length === 0) {
    return { min: 0, max: 1 };
  }

  const pad = (span: number, ref: number) => {
    if (span === 0) return Math.max(Math.abs(ref), 1) * 0.06;
    return span * 0.08;
  };

  if (lineStack) {
    // Extent must cover every series' cumulative line, not only per-category stack totals.
    // Using only min/max of (sum of all series) excludes lower partial sums — then small
    // series map outside the axis and lines appear below the x-axis (stack + no area).
    let minV = Infinity;
    let maxV = -Infinity;
    for (let i = 0; i < categoryCount; i++) {
      for (let sIdx = 0; sIdx < series.length; sIdx++) {
        const top = cumulativeTop(series, sIdx, i);
        minV = Math.min(minV, top);
        maxV = Math.max(maxV, top);
      }
    }
    if (!Number.isFinite(minV)) minV = 0;
    if (!Number.isFinite(maxV)) maxV = 0;
    const span = maxV - minV;
    const p = pad(span, maxV);
    let min = minV - p;
    let max = maxV + p;
    // Match ECharts stacked line/area: include 0 so the stack baseline sits on the x-axis.
    min = Math.min(0, min);
    return { min, max };
  }

  let minV = Infinity;
  let maxV = -Infinity;
  for (let i = 0; i < categoryCount; i++) {
    for (const ser of series) {
      const v = ser.values[i] ?? 0;
      minV = Math.min(minV, v);
      maxV = Math.max(maxV, v);
    }
  }
  if (!Number.isFinite(minV)) minV = 0;
  if (!Number.isFinite(maxV)) maxV = 0;
  const span = maxV - minV;
  const p = pad(span, maxV);
  let min = minV - p;
  let max = maxV + p;
  if (lineArea) {
    min = Math.min(0, min);
  }
  return { min, max };
}

/** Rough.js uses `seed: 0` as “no seed” (falls back to Math.random). Stable non-zero seed per chart keeps the sketch pattern across replays. */
export function roughSeedFromInstanceId(instanceId: string): number {
  let h = 2166136261;
  for (let i = 0; i < instanceId.length; i++) {
    h ^= instanceId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = h >>> 0;
  return n === 0 ? 1 : n;
}

export type RoughLineSeriesInput = {
  categories: string[];
  series: Array<{
    name: string;
    values: number[];
    color: string;
  }>;
  /** 0–100; maps to roughness, bowing, and stroke width. */
  intensity: number;
  lineArea: boolean;
  lineStack: boolean;
  /** Deterministic Rough.js PRNG so “Animate” does not reshuffle hachure/strokes. */
  roughSeed: number;
};

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

/**
 * ECharts custom series: Rough.js strokes and (when area) hachure/solid fills.
 * Stack uses the same cumulative rules as ECharts line stack.
 */
export function buildRoughLineCustomSeries(input: RoughLineSeriesInput) {
  const { roughness, bowing, strokeWidth, fillWeight, hachureGap } =
    intensityToRoughSketchParams(input.intensity);
  const n = input.categories.length;

  return input.series.map((series, seriesIndex) => ({
    type: "custom" as const,
    name: series.name,
    coordinateSystem: "cartesian2d" as const,
    showInLegend: true,
    // Custom renderItem graphics are not animated like built-in line series; timeline/container handles reveal.
    animation: false,
    encode: { x: 0, y: 1 },
    data: input.categories.map((_, i) => [i, series.values[i] ?? 0]),
    z: 10 + seriesIndex,
    renderItem(
      params: { dataIndex: number },
      api: { coord: (v: [number, number]) => number[] | undefined },
    ) {
      if (params.dataIndex !== 0) return null;

      const yTop = (i: number) =>
        input.lineStack
          ? cumulativeTop(input.series, seriesIndex, i)
          : (series.values[i] ?? 0);

      const ptsTop: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        const c = api.coord([i, yTop(i)]);
        if (c) ptsTop.push([c[0], c[1]]);
      }
      if (ptsTop.length < 2) return null;

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const rc = rough.svg(svg);
      const childElements: ReturnType<typeof pathsFromRoughGroup> = [];
      const seed = input.roughSeed + seriesIndex * 1337;

      if (input.lineArea) {
        const yBottom = (i: number) =>
          input.lineStack
            ? cumulativeBottom(input.series, seriesIndex, i)
            : 0;

        const ptsBottom: [number, number][] = [];
        for (let i = n - 1; i >= 0; i--) {
          const c = api.coord([i, yBottom(i)]);
          if (c) ptsBottom.push([c[0], c[1]]);
        }
        const poly: [number, number][] = [...ptsTop, ...ptsBottom];
        const fillRgba = withAlpha(series.color, 0.28);
        const gPoly = rc.polygon(poly, {
          seed,
          stroke: series.color,
          strokeWidth,
          roughness,
          bowing,
          fill: fillRgba,
          fillStyle: "hachure",
          fillWeight,
          hachureGap,
        });
        svg.appendChild(gPoly);
        childElements.push(
          ...pathsFromRoughGroup(gPoly, series.color, strokeWidth),
        );
      } else {
        const g = rc.linearPath(ptsTop, {
          seed,
          stroke: series.color,
          strokeWidth,
          roughness,
          bowing,
        });
        svg.appendChild(g);
        childElements.push(...pathsFromRoughGroup(g, series.color, strokeWidth));
      }

      return {
        type: "group" as const,
        children: childElements,
      };
    },
  }));
}
