import React, { useRef, useCallback } from "react";
import type { Clip } from "./timelineTypes";
import { TRACK_PAD } from "./timelineTypes";
import { msToLabel } from "./timelineUtils";

export interface TimelineClipProps {
  clip: Clip;
  totalMs: number;
  /** Usable track width (container width minus 2×TRACK_PAD). */
  usableWidthPx: number;
  colorClass: string;
  onClipChange: (next: Clip) => void;
  onDragMove?: (ms: number) => void;
  onDragEnd?: () => void;
  /** When true the start point is locked at 0: hides the start handle and disables body drag. */
  fixedStart?: boolean;
}

type DragHandle = "start" | "end" | "body";

export function TimelineClip({
  clip,
  totalMs,
  usableWidthPx,
  colorClass,
  onClipChange,
  onDragMove,
  onDragEnd,
  fixedStart = false,
}: TimelineClipProps) {
  const pxPerMs = usableWidthPx / totalMs;
  const left = TRACK_PAD + clip.startMs * pxPerMs;
  const width = Math.max(4, (clip.endMs - clip.startMs) * pxPerMs);

  const dragRef = useRef<{
    handle: DragHandle;
    startX: number;
    origClip: Clip;
  } | null>(null);

  const onMouseDown = useCallback(
    (handle: DragHandle) => (e: React.MouseEvent) => {
      if (handle === "body" && fixedStart) return;
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = { handle, startX: e.clientX, origClip: { ...clip } };

      const onMove = (me: MouseEvent) => {
        if (!dragRef.current) return;
        const { handle, startX, origClip } = dragRef.current;
        const dMs = (me.clientX - startX) / pxPerMs;
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
          reportMs = Math.max(0, Math.min(totalMs, origClip.startMs + dMs));
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
    [clip, fixedStart, pxPerMs, totalMs, onClipChange, onDragMove, onDragEnd],
  );

  return (
    <div
      className={`absolute top-1 bottom-1 rounded border ${colorClass} flex items-center select-none ${
        fixedStart ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      }`}
      style={{ left, width }}
      onMouseDown={onMouseDown("body")}
    >
      {!fixedStart && (
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-l flex items-center justify-center group z-10"
          onMouseDown={onMouseDown("start")}
        >
          <div className="w-0.5 h-3 bg-current opacity-50 group-hover:opacity-100 rounded-full" />
        </div>
      )}

      <span className="px-3 text-[10px] font-medium text-foreground/80 truncate pointer-events-none w-full text-center leading-none">
        {msToLabel(clip.startMs)} – {msToLabel(clip.endMs)}
      </span>

      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-r flex items-center justify-center group z-10"
        onMouseDown={onMouseDown("end")}
      >
        <div className="w-0.5 h-3 bg-current opacity-50 group-hover:opacity-100 rounded-full" />
      </div>
    </div>
  );
}
