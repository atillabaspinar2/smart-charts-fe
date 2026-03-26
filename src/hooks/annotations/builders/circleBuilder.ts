import type { CircleAnnotation } from "../types";
import type { AnnotationCallbacks } from "../interaction";
import { clearPrevOffset, getDragDelta, stopDomEvent } from "../interaction";

export function buildCircleGraphic(
  ann: CircleAnnotation,
  selected: boolean,
  callbacks: AnnotationCallbacks,
) {
  const { cx, cy, r } = ann.shape;
  const circle = {
    type: "circle",
    id: `${ann.id}__circle`,
    shape: { cx, cy, r },
    style: {
      fill: ann.style.fill,
      opacity: ann.style.opacity,
      stroke: selected ? "#ffffff" : "transparent",
      lineWidth: selected ? 2 : 0,
      shadowBlur: selected ? 8 : 0,
      shadowColor: ann.style.fill,
    },
    draggable: true,
    cursor: "move",
    z: 100,
    onmousedown: (params: any) => {
      callbacks.onSelect(ann.id);
      stopDomEvent(params);
    },
    ondragstart: (params: any) => {
      callbacks.onSelect(ann.id);
      clearPrevOffset(params);
      stopDomEvent(params);
    },
    ondrag: (params: any) => {
      const { dx, dy } = getDragDelta(params);
      params?.target?.drift?.(-dx, -dy);
      callbacks.onMove(ann.id, dx, dy);
      stopDomEvent(params);
    },
    ondragend: (params: any) => {
      clearPrevOffset(params);
      stopDomEvent(params);
    },
    onclick: (params: any) => stopDomEvent(params),
  };

  return { type: "group", id: ann.id, children: [circle] };
}

