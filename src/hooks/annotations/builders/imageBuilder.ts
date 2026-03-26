import type { ImageAnnotation } from "../types";
import type { AnnotationCallbacks } from "../interaction";
import { clearPrevOffset, getDragDelta, stopDomEvent } from "../interaction";

export function buildImageGraphic(
  ann: ImageAnnotation,
  selected: boolean,
  callbacks: AnnotationCallbacks,
) {
  const { x, y, width, height } = ann.shape;
  const hasImage = Boolean(ann.style.src);

  const imageEl = hasImage
    ? {
        type: "image",
        id: `${ann.id}__image`,
        style: {
          x,
          y,
          width,
          height,
          image: ann.style.src,
          opacity: ann.style.opacity,
        },
        z: 100,
      }
    : {
        type: "rect",
        id: `${ann.id}__placeholder`,
        shape: { x, y, width, height },
        style: {
          fill: "rgba(148,163,184,0.2)",
          stroke: "#94a3b8",
          lineDash: [4, 3],
          lineWidth: 1,
          opacity: ann.style.opacity,
        },
        z: 100,
      };

  const border = {
    type: "rect",
    id: `${ann.id}__border`,
    shape: { x, y, width, height },
    style: {
      fill: "transparent",
      stroke: selected ? "#ffffff" : "transparent",
      lineWidth: selected ? 2 : 0,
    },
    z: 101,
  };

  const dragHit = {
    type: "rect",
    id: `${ann.id}__hit`,
    shape: { x, y, width, height },
    style: { fill: "transparent" },
    draggable: true,
    cursor: "move",
    z: 102,
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

  const children = hasImage ? [imageEl, border, dragHit] : [imageEl, border, dragHit];
  return { type: "group", id: ann.id, children };
}

