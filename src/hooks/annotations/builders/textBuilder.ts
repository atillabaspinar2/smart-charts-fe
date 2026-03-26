import type { TextAnnotation } from "../types";
import type { AnnotationCallbacks } from "../interaction";
import { clearPrevOffset, getDragDelta, stopDomEvent } from "../interaction";

export function buildTextGraphic(
  ann: TextAnnotation,
  selected: boolean,
  callbacks: AnnotationCallbacks,
) {
  const text = {
    type: "text",
    id: `${ann.id}__text`,
    style: {
      x: ann.shape.x,
      y: ann.shape.y,
      text: ann.style.text,
      fill: ann.style.fill,
      opacity: ann.style.opacity,
      fontSize: ann.style.fontSize,
      fontWeight: 600,
      textBorderColor: selected ? "#ffffff" : "transparent",
      textBorderWidth: selected ? 1 : 0,
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

  return { type: "group", id: ann.id, children: [text] };
}

