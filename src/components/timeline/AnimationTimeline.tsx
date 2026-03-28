import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ROW_HEIGHT,
  LABEL_WIDTH,
  RULER_HEIGHT,
  TRACK_PAD,
  CLIP_COLORS,
  type Clip,
  type TimelineRow,
} from "./timelineTypes";
import { msToLabel, buildTickMarks } from "./timelineUtils";
import { TimelineClip } from "./TimelineClip";

// ─── Example seed data (replace with real data when wiring up) ────────────────

const EXAMPLE_ROWS: Omit<TimelineRow, "clip">[] = [
  { id: "canvas",  label: "Canvas",         colorIdx: 0 },
  { id: "chart-1", label: "Chart 1 – Bar",  colorIdx: 1 },
  { id: "chart-2", label: "Chart 2 – Line", colorIdx: 2 },
  { id: "chart-3", label: "Chart 3 – Map",  colorIdx: 3 },
];

// ─── Row label ────────────────────────────────────────────────────────────────

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

// ─── Constraint logic ─────────────────────────────────────────────────────────

function applyConstraints(draft: TimelineRow[]): TimelineRow[] {
  const canvasIdx = draft.findIndex((r) => r.id === "canvas");
  if (canvasIdx === -1) return draft;

  const maxChartEnd = Math.max(
    0,
    ...draft.filter((r) => r.id !== "canvas").map((r) => r.clip.endMs),
  );

  const canvas = draft[canvasIdx];
  // Rule 3: start always 0. Rules 1 & 2: end >= max chart end. Rule 4: may exceed it.
  const clampedEnd = Math.max(canvas.clip.endMs, maxChartEnd);

  if (canvas.clip.startMs === 0 && canvas.clip.endMs === clampedEnd) return draft;

  return draft.map((r) =>
    r.id === "canvas" ? { ...r, clip: { startMs: 0, endMs: clampedEnd } } : r,
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnimationTimeline() {
  const [totalMs, setTotalMs]             = useState(10000);
  const [durationInput, setDurationInput] = useState("10");
  const [containerWidth, setContainerWidth] = useState(0);
  const [dragLineMs, setDragLineMs]       = useState<number | null>(null);

  const usableWidth = Math.max(0, containerWidth - 2 * TRACK_PAD);
  const pxPerMs     = usableWidth > 0 ? usableWidth / totalMs : 0;

  const laneCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const ro = new ResizeObserver(([entry]) =>
      setContainerWidth(entry.contentRect.width),
    );
    ro.observe(node);
  }, []);

  const [rows, setRows] = useState<TimelineRow[]>(() =>
    EXAMPLE_ROWS.map((r, i) => ({
      ...r,
      clip: {
        startMs: i === 0 ? 0 : i * 1000,
        endMs:   i === 0 ? 10000 : Math.min(10000, i * 1000 + 4000),
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
          endMs:   Math.min(r.clip.endMs,   ms),
        },
      })),
    );
  };

  const updateClip = (id: string, next: Clip) => {
    setRows((prev) =>
      applyConstraints(prev.map((r) => (r.id === id ? { ...r, clip: next } : r))),
    );
  };

  const ticks       = buildTickMarks(totalMs, usableWidth);
  const gridHeight  = RULER_HEIGHT + rows.length * ROW_HEIGHT;
  const dragLinePx  = dragLineMs !== null ? TRACK_PAD + dragLineMs * pxPerMs : null;

  return (
    <div className="flex flex-col gap-3 p-3 text-sm">
      {/* ── Duration control ─────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Label htmlFor="tl-dur" className="text-xs text-muted-foreground whitespace-nowrap">
          Total duration (s)
        </Label>
        <Input
          id="tl-dur"
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

      {/* ── Timeline grid ────────────────────────────────────── */}
      <div
        className="relative flex flex-col border border-border rounded-md overflow-hidden select-none"
        style={{ height: gridHeight }}
      >
        {/* Ruler */}
        <div className="flex shrink-0 border-b border-border" style={{ height: RULER_HEIGHT }}>
          <div className="shrink-0 bg-muted border-r border-border" style={{ width: LABEL_WIDTH }} />
          <div
            ref={laneCallbackRef}
            className="relative flex-1 bg-muted/50"
            style={{ overflow: "visible" }}
          >
            {ticks.map(({ ms, px }) => (
              <div
                key={ms}
                className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                style={{ left: TRACK_PAD + px }}
              >
                <div className="w-px bg-border" style={{ height: ms === 0 || ms === totalMs ? 10 : 6 }} />
                <span className="text-[9px] text-muted-foreground mt-0.5 whitespace-nowrap">
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
            <div className="relative flex-1 bg-background">
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
                  fixedStart={row.id === "canvas"}
                  onClipChange={(next) => updateClip(row.id, next)}
                  onDragMove={setDragLineMs}
                  onDragEnd={() => setDragLineMs(null)}
                />
              )}
            </div>
          </div>
        ))}

        {/* Drag position indicator */}
        {dragLinePx !== null && (
          <div
            className="absolute top-0 pointer-events-none z-20"
            style={{ left: LABEL_WIDTH + dragLinePx, height: gridHeight }}
          >
            <div className="flex flex-col items-center">
              <svg width="10" height="8" viewBox="0 0 10 8" className="fill-primary">
                <polygon points="5,8 0,0 10,0" />
              </svg>
              <div className="w-px bg-primary/80" style={{ height: gridHeight - 8 }} />
            </div>
            <div className="absolute top-4 left-2 text-[9px] font-semibold text-primary whitespace-nowrap bg-background/80 px-0.5 rounded">
              {msToLabel(dragLineMs!)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
