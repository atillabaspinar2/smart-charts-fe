import type { TickMark } from "./timelineTypes";

export function msToLabel(ms: number): string {
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(s % 1 === 0 ? 0 : 1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return rem === 0 ? `${m}m` : `${m}m${rem}s`;
}

const NICE_INTERVALS = [
  100, 250, 500, 1000, 2000, 5000, 10000, 15000, 30000, 60000, 120000, 300000,
];

export function buildTickMarks(totalMs: number, usableWidthPx: number): TickMark[] {
  if (usableWidthPx <= 0 || totalMs <= 0) return [];
  const pxPerMs = usableWidthPx / totalMs;
  const rawIntervalMs = 80 / pxPerMs;
  const intervalMs =
    NICE_INTERVALS.find((v) => v >= rawIntervalMs) ??
    NICE_INTERVALS[NICE_INTERVALS.length - 1];

  const ticks: TickMark[] = [];
  for (let ms = 0; ms <= totalMs; ms += intervalMs) {
    ticks.push({ ms, px: ms * pxPerMs });
  }
  return ticks;
}
