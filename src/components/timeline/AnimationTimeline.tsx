import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspaceLayoutStore } from "@/store/workspaceLayoutStore";
import { useWorkspaceChartsStore } from "@/store/workspaceChartsStore";
import type { TimelineClip } from "@/store/workspaceChartsStore"; // used in applyDuration
import {
  ROW_HEIGHT,
  LABEL_WIDTH,
  RULER_HEIGHT,
  TRACK_PAD,
  CLIP_COLORS,
} from "./timelineTypes";
import { msToLabel, buildTickMarks } from "./timelineUtils";
import { TimelineClip as TimelineClipComponent } from "./TimelineClip";

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

// ─── Chart type label helper ──────────────────────────────────────────────────

function chartLabel(type: string, title: string | undefined, index: number): string {
  const base = title?.trim() || `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`;
  return base;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnimationTimeline() {
  // ── Store access ──────────────────────────────────────────────────────────
  const {
    activeWorkspaceId,
    canvasSettings,
    setCanvasSettings,
    chartStackOrder,
  } = useWorkspaceLayoutStore();

  const {
    chartsByWorkspaceId,
    upsertChartTimelineClip,
  } = useWorkspaceChartsStore();

  const chartMap = chartsByWorkspaceId[activeWorkspaceId] ?? {};
  // Ordered chart entities matching the canvas stack order
  const orderedEntities = chartStackOrder
    .map((id) => chartMap[id])
    .filter(Boolean);

  const totalMs = canvasSettings.timelineTotalMs ?? 10000;

  // ── Duration input (local, synced from store) ─────────────────────────────
  const [durationInput, setDurationInput] = useState(String(totalMs / 1000));
  useEffect(() => {
    setDurationInput(String(totalMs / 1000));
  }, [totalMs]);

  // ── Drag line ─────────────────────────────────────────────────────────────
  const [dragLineMs, setDragLineMs] = useState<number | null>(null);

  // ── Track width measurement ───────────────────────────────────────────────
  const [containerWidth, setContainerWidth] = useState(0);
  const usableWidth = Math.max(0, containerWidth - 2 * TRACK_PAD);
  const pxPerMs = usableWidth > 0 ? usableWidth / totalMs : 0;

  const laneCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const ro = new ResizeObserver(([entry]) =>
      setContainerWidth(entry.contentRect.width),
    );
    ro.observe(node);
  }, []);

  // ── Apply new total duration ──────────────────────────────────────────────
  const applyDuration = () => {
    const secs = parseFloat(durationInput);
    if (isNaN(secs) || secs <= 0) return;
    const ms = Math.round(secs * 1000);

    // Clamp all chart clips to the new total duration
    orderedEntities.forEach((entity) => {
      const clip = entity.timelineClip ?? { startMs: 0, endMs: Math.min(4000, ms) };
      const clamped: TimelineClip = {
        startMs: Math.min(clip.startMs, ms),
        endMs: Math.min(clip.endMs, ms),
      };
      upsertChartTimelineClip(activeWorkspaceId, entity.instanceId, clamped);
    });

    setCanvasSettings({ ...canvasSettings, timelineTotalMs: ms, animationDuration: ms });
  };

  // ── Clip update with constraints ──────────────────────────────────────────
  const updateClip = (id: string, next: TimelineClip) => {
    if (id === "canvas") {
      // Rule 3: start fixed at 0
      // Rule 1: end >= max chart end   Rule 4: may exceed max chart end
      const maxChartEnd = Math.max(
        0,
        ...orderedEntities.map((e) => e.timelineClip?.endMs ?? 0),
      );
      const clampedEnd = Math.max(next.endMs, maxChartEnd);
      setCanvasSettings({
        ...canvasSettings,
        timelineTotalMs: clampedEnd,
        animationDuration: clampedEnd,
      });
    } else {
      upsertChartTimelineClip(activeWorkspaceId, id, next);
      // Rule 2: expand canvas end if chart end exceeds it
      if (next.endMs > totalMs) {
        setCanvasSettings({
          ...canvasSettings,
          timelineTotalMs: next.endMs,
          animationDuration: next.endMs,
        });
      }
    }
  };

  // ── Derived layout ────────────────────────────────────────────────────────
  const ticks = buildTickMarks(totalMs, usableWidth);
  const rowCount = 1 + orderedEntities.length; // canvas + charts
  const gridHeight = RULER_HEIGHT + rowCount * ROW_HEIGHT;
  const dragLinePx = dragLineMs !== null ? TRACK_PAD + dragLineMs * pxPerMs : null;

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

        {/* Canvas row */}
        <div className="flex border-b border-border" style={{ height: ROW_HEIGHT }}>
          <RowLabel label="Canvas" />
          <div className="relative flex-1 bg-background">
            {ticks.map(({ ms, px }) => (
              <div key={ms} className="absolute top-0 bottom-0 w-px bg-border/30" style={{ left: TRACK_PAD + px }} />
            ))}
            {usableWidth > 0 && (
              <TimelineClipComponent
                clip={{ startMs: 0, endMs: totalMs }}
                totalMs={totalMs}
                usableWidthPx={usableWidth}
                colorClass={CLIP_COLORS[0]}
                fixedStart
                onClipChange={(next) => updateClip("canvas", next)}
                onDragMove={setDragLineMs}
                onDragEnd={() => setDragLineMs(null)}
              />
            )}
          </div>
        </div>

        {/* Chart rows */}
        {orderedEntities.map((entity, i) => {
          const clip = entity.timelineClip ?? { startMs: 0, endMs: Math.min(4000, totalMs) };
          const label = chartLabel(entity.type, entity.chartSettings?.title, i);
          const colorIdx = (i % (CLIP_COLORS.length - 1)) + 1;
          return (
            <div key={entity.instanceId} className="flex border-b border-border last:border-b-0" style={{ height: ROW_HEIGHT }}>
              <RowLabel label={label} />
              <div className="relative flex-1 bg-background">
                {ticks.map(({ ms, px }) => (
                  <div key={ms} className="absolute top-0 bottom-0 w-px bg-border/30" style={{ left: TRACK_PAD + px }} />
                ))}
                {usableWidth > 0 && (
                  <TimelineClipComponent
                    clip={clip}
                    totalMs={totalMs}
                    usableWidthPx={usableWidth}
                    colorClass={CLIP_COLORS[colorIdx]}
                    onClipChange={(next) => updateClip(entity.instanceId, next)}
                    onDragMove={setDragLineMs}
                    onDragEnd={() => setDragLineMs(null)}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Drag indicator */}
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
