// ─── Layout constants ─────────────────────────────────────────────────────────

export const ROW_HEIGHT = 36;
export const LABEL_WIDTH = 140;
export const CHECKBOX_COL_WIDTH = 36; // "hide after animation" checkbox column
export const RULER_HEIGHT = 30;
/** Horizontal padding inside every track lane so the first/last tick labels are never clipped. */
export const TRACK_PAD = 10;

export const CLIP_COLORS = [
  "bg-primary/70 border-primary",
  "bg-blue-500/70 border-blue-400",
  "bg-emerald-500/70 border-emerald-400",
  "bg-amber-500/70 border-amber-400",
  "bg-rose-500/70 border-rose-400",
  "bg-violet-500/70 border-violet-400",
  "bg-cyan-500/70 border-cyan-400",
];

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface Clip {
  startMs: number;
  endMs: number;
}

export interface TimelineRow {
  id: string;
  label: string;
  clip: Clip;
  colorIdx: number;
}

export interface TickMark {
  ms: number;
  /** Pixel offset from the start of the usable area (before TRACK_PAD is added). */
  px: number;
}
