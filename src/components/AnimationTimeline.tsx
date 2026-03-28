import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROW_HEIGHT = 36;
const LABEL_WIDTH = 140;
const RULER_HEIGHT = 30;
/** Horizontal padding inside every track lane so the first/last tick labels are never clipped. */
const TRACK_PAD = 10;

const CLIP_COLORS = [
  "bg-primary/70 border-primary",
  "bg-blue-500/70 border-blue-400",
  "bg-emerald-500/70 border-emerald-400",
  "bg-amber-500/70 border-amber-400",
  "bg-rose-500/70 border-rose-400",
  "bg-violet-500/70 border-violet-400",
  "bg-cyan-500/70 border-cyan-400",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Clip {
  startMs: number;
  endMs: number;
}

interface TimelineRow {
  id: string;
  label: string;
  clip: Clip;
  colorIdx: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function msToLabel(ms: number): string {
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(s % 1 === 0 ? 0 : 1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return rem === 0 ? `${m}m` : `${m}m${rem}s`;
}

function buildTickMarks(totalMs: number, usableWidthPx: number) {
  if (usableWidthPx <= 0 || totalMs <= 0) return [];
  const pxPerMs = usableWidthPx / totalMs;
  const targetPx = 80;
  const rawIntervalMs = targetPx / pxPerMs;
  const niceIntervals = [
    100, 250, 500, 1000, 2000, 5000, 10000, 15000, 30000, 60000, 120000,
    300000,
  ];
  const intervalMs =
    niceIntervals.find((v) => v >= rawIntervalMs) ??
    niceIntervals[niceIntervals.length - 1];

  const ticks: { ms: number; px: number }[] = [];
  for (let ms = 0; ms <= totalMs; ms += intervalMs) {
    // px is offset from the left of the lane (0 = start of usable area, before TRACK_PAD offset)
    ticks.push({ ms, px: ms * pxPerMs });
  }
  return ticks;
}

// ─── Clip component ───────────────────────────────────────────────────────────

interface ClipProps {
  clip: Clip;
  totalMs: number;
  /** Usable track width (container width minus 2×TRACK_PAD). */
  usableWidthPx: number;
  colorClass: string;
  onClipChange: (next: Clip) => void;
  onDragMove?: (ms: number) => void;
  onDragEnd?: () => void;
}

type DragHandle = "start" | "end" | "body";

function TimelineClip({
  clip,
  totalMs,
  usableWidthPx,
  colorClass,
  onClipChange,
  onDragMove,
  onDragEnd,
}: ClipProps) {
  const pxPerMs = usableWidthPx / totalMs;
  // Positions are relative to the usable area; TRACK_PAD is applied by the lane wrapper
  const left = TRACK_PAD + clip.startMs * pxPerMs;
  const width = Math.max(4, (clip.endMs - clip.startMs) * pxPerMs);

  const dragRef = useRef<{
    handle: DragHandle;
    startX: number;
    origClip: Clip;
  } | null>(null);

  const onMouseDown = useCallback(
    (handle: DragHandle) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = { handle, startX: e.clientX, origClip: { ...clip } };

      const onMove = (me: MouseEvent) => {
        if (!dragRef.current) return;
        const { handle, startX, origClip } = dragRef.current;
        const dx = me.clientX - startX;
        const dMs = dx / pxPerMs;
        let { startMs, endMs } = origClip;
        const minDurMs = 100;
        let reportMs: number;

        if (handle === "start") {
          startMs = Math.max(0, Math.min(endMs - minDurMs, startMs + dMs));
          reportMs = startMs;
        } else if (handle === "end") {
          endMs = Math.min(totalMs, Math.max(startMs + minDurMs, endMs + dMs));
          reportMs = endMs;
        } else {
          const dur = endMs - startMs;
          startMs = Math.max(0, Math.min(totalMs - dur, startMs + dMs));
          endMs = startMs + dur;
          // For body drag, track cursor position in ms space
          const cursorMs = origClip.startMs + dMs;
          reportMs = Math.max(0, Math.min(totalMs, cursorMs));
        }

        onClipChange({ startMs, endMs });
        onDragMove?.(reportMs);
      };

      const onUp = () => {
        dragRef.current = null;
        onDragEnd?.();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [clip, pxPerMs, totalMs, onClipChange, onDragMove, onDragEnd],
  );

  return (
    <div
      className={`absolute top-1 bottom-1 rounded border ${colorClass} flex items-center select-none cursor-grab active:cursor-grabbing`}
      style={{ left, width }}
      onMouseDown={onMouseDown("body")}
    >
      {/* start handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-l flex items-center justify-center group z-10"
        onMouseDown={onMouseDown("start")}
      >
        <div className="w-0.5 h-3 bg-current opacity-50 group-hover:opacity-100 rounded-full" />
      </div>

      {/* label */}
      <span className="px-3 text-[10px] font-medium text-foreground/80 truncate pointer-events-none w-full text-center leading-none">
        {msToLabel(clip.startMs)} – {msToLabel(clip.endMs)}
      </span>

      {/* end handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-r flex items-center justify-center group z-10"
        onMouseDown={onMouseDown("end")}
      >
        <div className="w-0.5 h-3 bg-current opacity-50 group-hover:opacity-100 rounded-full" />
      </div>
    </div>
  );
}

// ─── Row label column ─────────────────────────────────────────────────────────

function RowLabel({ label }: { label: string }) {
  return (
    <div
      className="flex items-center shrink-0 px-3 border-r border-border bg-muted text-xs font-medium text-muted-foreground truncate"
      style={{ width: LABEL_WIDTH, height: ROW_HEIGHT }}
    >
      {label}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const EXAMPLE_ROWS: Omit<TimelineRow, "clip">[] = [
  { id: "canvas", label: "Canvas", colorIdx: 0 },
  { id: "chart-1", label: "Chart 1 – Bar", colorIdx: 1 },
  { id: "chart-2", label: "Chart 2 – Line", colorIdx: 2 },
  { id: "chart-3", label: "Chart 3 – Map", colorIdx: 3 },
];

export default function AnimationTimeline() {
  const [totalMs, setTotalMs] = useState(10000);
  const [durationInput, setDurationInput] = useState("10");

  /** Full width of the track container div (ruler / row lanes). */
  const [containerWidth, setContainerWidth] = useState(0);
  const usableWidth = Math.max(0, containerWidth - 2 * TRACK_PAD);

  /** Active drag line position in ms, or null when not dragging. */
  const [dragLineMs, setDragLineMs] = useState<number | null>(null);

  // Observe the width of one representative track lane
  const laneCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(node);
  }, []);

  const [rows, setRows] = useState<TimelineRow[]>(() =>
    EXAMPLE_ROWS.map((r, i) => ({
      ...r,
      clip: {
        startMs: i === 0 ? 0 : i * 1000,
        endMs: i === 0 ? 10000 : Math.min(10000, i * 1000 + 4000),
      },
    })),
  );

  const applyDuration = () => {
    const secs = parseFloat(durationInput);
    if (isNaN(secs) || secs <= 0) return;
    const ms = Math.round(secs * 1000);
    setTotalMs(ms);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        clip: {
          startMs: Math.min(r.clip.startMs, ms),
          endMs: Math.min(r.clip.endMs, ms),
        },
      })),
    );
  };

  const updateClip = (id: string, next: Clip) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, clip: next } : r)));

  const ticks = buildTickMarks(totalMs, usableWidth);

  const pxPerMs = usableWidth > 0 ? usableWidth / totalMs : 0;
  // Pixel x of the drag line within the track lane (accounting for TRACK_PAD)
  const dragLinePx =
    dragLineMs !== null ? TRACK_PAD + dragLineMs * pxPerMs : null;
  // Full grid height: ruler + all rows
  const gridHeight = RULER_HEIGHT + rows.length * ROW_HEIGHT;

  return (
    <div className="flex flex-col gap-3 p-3 text-sm">
      {/* ── Duration control ───────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        <Label
          htmlFor="timeline-duration"
          className="text-xs text-muted-foreground whitespace-nowrap"
        >
          Total duration (s)
        </Label>
        <Input
          id="timeline-duration"
          type="number"
          min={1}
          step={1}
          value={durationInput}
          onChange={(e) => setDurationInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyDuration()}
          className="h-7 w-24 text-xs"
        />
        <Button size="sm" className="h-7 text-xs px-3" onClick={applyDuration}>
          Apply
        </Button>
      </div>

      {/* ── Timeline grid ──────────────────────────────────────── */}
      <div
        className="relative flex flex-col border border-border rounded-md overflow-hidden select-none"
        style={{ height: gridHeight }}
      >
        {/* Ruler row */}
        <div
          className="flex shrink-0 border-b border-border"
          style={{ height: RULER_HEIGHT }}
        >
          {/* label spacer */}
          <div
            className="shrink-0 bg-muted border-r border-border"
            style={{ width: LABEL_WIDTH }}
          />
          {/* ruler track — overflow visible so labels at edges show */}
          <div
            ref={laneCallbackRef}
            className="relative flex-1 bg-muted/50"
            style={{ overflow: "visible" }}
          >
            {ticks.map(({ ms, px }) => (
              <div
                key={ms}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: TRACK_PAD + px }}
              >
                <div
                  className="w-px bg-border"
                  style={{ height: ms === 0 || ms === totalMs ? 10 : 6 }}
                />
                <span className="text-[9px] text-muted-foreground mt-0.5 -translate-x-1/2 whitespace-nowrap">
                  {msToLabel(ms)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data rows */}
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex border-b border-border last:border-b-0"
            style={{ height: ROW_HEIGHT }}
          >
            <RowLabel label={row.label} />
            {/* clip lane */}
            <div className="relative flex-1 bg-background">
              {/* grid lines */}
              {ticks.map(({ ms, px }) => (
                <div
                  key={ms}
                  className="absolute top-0 bottom-0 w-px bg-border/30"
                  style={{ left: TRACK_PAD + px }}
                />
              ))}
              {usableWidth > 0 && (
                <TimelineClip
                  clip={row.clip}
                  totalMs={totalMs}
                  usableWidthPx={usableWidth}
                  colorClass={CLIP_COLORS[row.colorIdx % CLIP_COLORS.length]}
                  onClipChange={(next) => updateClip(row.id, next)}
                  onDragMove={(ms) => setDragLineMs(ms)}
                  onDragEnd={() => setDragLineMs(null)}
                />
              )}
            </div>
          </div>
        ))}

        {/* ── Drag position indicator line ─────────────────────── */}
        {dragLinePx !== null && (
          <div
            className="absolute top-0 pointer-events-none z-20"
            style={{
              left: LABEL_WIDTH + dragLinePx,
              height: gridHeight,
            }}
          >
            {/* downward arrow head at ruler level */}
            <div className="flex flex-col items-center">
              <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                className="fill-primary"
              >
                <polygon points="5,8 0,0 10,0" />
              </svg>
              {/* vertical line */}
              <div
                className="w-px bg-primary/80"
                style={{ height: gridHeight - 8 }}
              />
            </div>
            {/* time label */}
            <div className="absolute top-4 left-2 text-[9px] font-semibold text-primary whitespace-nowrap bg-background/80 px-0.5 rounded">
              {msToLabel(dragLineMs!)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
