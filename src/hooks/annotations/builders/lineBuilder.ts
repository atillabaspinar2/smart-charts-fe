import type { LineAnnotation } from "../types";
import type { AnnotationCallbacks } from "../interaction";
import { clearPrevOffset, getDragDelta, stopDomEvent } from "../interaction";

const HANDLE_RADIUS = 6;
const HIT_ZONE_WIDTH = 12;

function buildArrowHead({
  x1,
  y1,
  x2,
  y2,
  color,
  size,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  size: number;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const tipX = x2;
  const tipY = y2;
  const backX = tipX - size * Math.cos(angle);
  const backY = tipY - size * Math.sin(angle);
  const perpAngle = angle + Math.PI / 2;
  const halfWidth = size * 0.55;
  const leftX = backX + halfWidth * Math.cos(perpAngle);
  const leftY = backY + halfWidth * Math.sin(perpAngle);
  const rightX = backX - halfWidth * Math.cos(perpAngle);
  const rightY = backY - halfWidth * Math.sin(perpAngle);

  return {
    type: "polygon",
    shape: { points: [[tipX, tipY], [leftX, leftY], [rightX, rightY]] },
    style: { fill: color, opacity: 1 },
    silent: true,
    z: 102,
  };
}

export function buildLineGraphic(
  ann: LineAnnotation,
  selected: boolean,
  callbacks: AnnotationCallbacks,
) {
  const { x1, y1, x2, y2 } = ann.shape;
  const accentColor = selected ? "#ffffff" : ann.style.stroke;
  const handleFill = selected ? ann.style.stroke : "#1e293b";
  const arrowSize = Math.max(12, ann.style.lineWidth * 4 + 8);
  const hasArrow = Boolean(ann.style.arrowEnd);

  const dxLine = x2 - x1;
  const dyLine = y2 - y1;
  const lineLen = Math.hypot(dxLine, dyLine);
  const ux = lineLen > 0 ? dxLine / lineLen : 1;
  const uy = lineLen > 0 ? dyLine / lineLen : 0;
  const trimmedLineEndX =
    hasArrow && lineLen > 0 ? x2 - ux * (arrowSize * 0.85) : x2;
  const trimmedLineEndY =
    hasArrow && lineLen > 0 ? y2 - uy * (arrowSize * 0.85) : y2;

  const hitZone = {
    type: "line",
    id: `${ann.id}__hit`,
    shape: { x1, y1, x2, y2 },
    style: { stroke: "transparent", lineWidth: HIT_ZONE_WIDTH },
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

  const visibleLine = {
    type: "line",
    id: `${ann.id}__line`,
    shape: { x1, y1, x2: trimmedLineEndX, y2: trimmedLineEndY },
    style: {
      stroke: ann.style.stroke,
      lineWidth: ann.style.lineWidth,
      lineDash: ann.style.lineDash,
      opacity: ann.style.opacity,
      shadowBlur: selected ? 8 : 0,
      shadowColor: ann.style.stroke,
    },
    silent: true,
    z: 99,
  };

  const handle1 = {
    type: "circle",
    id: `${ann.id}__h1`,
    shape: { cx: x1, cy: y1, r: HANDLE_RADIUS },
    style: {
      fill: handleFill,
      stroke: accentColor,
      lineWidth: 2,
      opacity: selected ? 1 : 0,
    },
    draggable: true,
    cursor: "crosshair",
    z: 101,
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
      callbacks.onLineHandle1Drag(ann.id, dx, dy);
      stopDomEvent(params);
    },
    ondragend: (params: any) => {
      clearPrevOffset(params);
      stopDomEvent(params);
    },
    onclick: (params: any) => stopDomEvent(params),
  };

  const handle2 = {
    type: "circle",
    id: `${ann.id}__h2`,
    shape: { cx: x2, cy: y2, r: HANDLE_RADIUS },
    style: {
      fill: handleFill,
      stroke: accentColor,
      lineWidth: 2,
      opacity: selected ? 1 : 0,
    },
    draggable: true,
    cursor: "crosshair",
    z: 101,
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
      callbacks.onLineHandle2Drag(ann.id, dx, dy);
      stopDomEvent(params);
    },
    ondragend: (params: any) => {
      clearPrevOffset(params);
      stopDomEvent(params);
    },
    onclick: (params: any) => stopDomEvent(params),
  };

  const arrowHead = hasArrow
    ? [
        {
          ...buildArrowHead({
            x1,
            y1,
            x2,
            y2,
            color: ann.style.stroke,
            size: arrowSize,
          }),
          id: `${ann.id}__arrowEnd`,
          style: { fill: ann.style.stroke, opacity: ann.style.opacity },
        },
      ]
    : [];

  return {
    type: "group",
    id: ann.id,
    children: [hitZone, visibleLine, ...arrowHead, handle1, handle2],
  };
}

