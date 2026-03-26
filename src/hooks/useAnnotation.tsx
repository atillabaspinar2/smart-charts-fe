import { useCallback, useMemo, useState } from "react";

type LineAnnotationStyle = {
  stroke: string;
  lineWidth: number;
  lineDash: number[]; // [] solid, [6,3] dashed, [2,2] dotted
  opacity: number;
  arrowEnd?: boolean;
};

type LineAnnotationShape = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type LineAnnotation = {
  id: string;
  type: "line";
  shape: LineAnnotationShape;
  style: LineAnnotationStyle;
};

const createAnnotationId = () =>
  `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const defaultLineStyle: LineAnnotationStyle = {
  stroke: "#f97316",
  lineWidth: 2,
  lineDash: [],
  opacity: 1,
  arrowEnd: false,
};

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
    id: "arrow",
    shape: { points: [[tipX, tipY], [leftX, leftY], [rightX, rightY]] },
    style: { fill: color, opacity: 1 },
    silent: true,
    z: 102,
  };
}

export function useAnnotations() {
  const [annotations, setAnnotations] = useState<LineAnnotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addLine = useCallback((dropPos: { x: number; y: number }) => {
    const id = createAnnotationId();
    const newAnn: LineAnnotation = {
      id,
      type: "line",
      shape: {
        x1: dropPos.x - 60,
        y1: dropPos.y,
        x2: dropPos.x + 60,
        y2: dropPos.y,
      },
      style: { ...defaultLineStyle },
    };
    setAnnotations((prev) => [...prev, newAnn]);
    setSelectedId(id);
    return id;
  }, []);

  const selectAnnotation = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? prev : id));
  }, []);

  const clearSelection = useCallback(() => setSelectedId(null), []);

  const moveAnnotation = useCallback((id: string, dx: number, dy: number) => {
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id !== id
          ? a
          : {
              ...a,
              shape: {
                x1: a.shape.x1 + dx,
                y1: a.shape.y1 + dy,
                x2: a.shape.x2 + dx,
                y2: a.shape.y2 + dy,
              },
            },
      ),
    );
  }, []);

  const moveHandle1 = useCallback((id: string, dx: number, dy: number) => {
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id !== id
          ? a
          : { ...a, shape: { ...a.shape, x1: a.shape.x1 + dx, y1: a.shape.y1 + dy } },
      ),
    );
  }, []);

  const moveHandle2 = useCallback((id: string, dx: number, dy: number) => {
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id !== id
          ? a
          : { ...a, shape: { ...a.shape, x2: a.shape.x2 + dx, y2: a.shape.y2 + dy } },
      ),
    );
  }, []);

  const updateAnnotationStyle = useCallback(
    (id: string, styleUpdate: Partial<LineAnnotationStyle>) => {
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id !== id ? a : { ...a, style: { ...a.style, ...styleUpdate } },
        ),
      );
    },
    [],
  );

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const selectedAnnotation = useMemo(
    () => annotations.find((a) => a.id === selectedId) ?? null,
    [annotations, selectedId],
  );

  const buildGraphicElements = useCallback(
    (callbacks: {
      onSelect: (id: string) => void;
      onLineDrag: (id: string, dx: number, dy: number) => void;
      onHandle1Drag: (id: string, dx: number, dy: number) => void;
      onHandle2Drag: (id: string, dx: number, dy: number) => void;
    }) => {
      return annotations.flatMap((ann) => {
        const selected = ann.id === selectedId;
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

        const stopDomEvent = (params: any) => {
          const evt = params?.event;
          // ZRender wraps the native event under `event`
          const domEvt = evt?.event ?? evt;
          domEvt?.stopPropagation?.();
          domEvt?.preventDefault?.();
          if (evt) evt.cancelBubble = true;
          if (params) params.cancelBubble = true;
        };

        const getDragDelta = (params: any): { dx: number; dy: number } => {
          if (typeof params?.dx === "number" && typeof params?.dy === "number") {
            return { dx: params.dx, dy: params.dy };
          }

          const evt = params?.event;
          const domEvt = evt?.event ?? evt;
          const mx =
            domEvt?.movementX ??
            domEvt?.webkitMovementX ??
            domEvt?.mozMovementX ??
            domEvt?.msMovementX;
          const my =
            domEvt?.movementY ??
            domEvt?.webkitMovementY ??
            domEvt?.mozMovementY ??
            domEvt?.msMovementY;
          if (typeof mx === "number" && typeof my === "number") {
            return { dx: mx, dy: my };
          }

          const ox = evt?.offsetX ?? evt?.zrX;
          const oy = evt?.offsetY ?? evt?.zrY;
          const target = params?.target as any;
          if (typeof ox === "number" && typeof oy === "number" && target) {
            const prev = target.__annPrevOffset;
            target.__annPrevOffset = { x: ox, y: oy };
            if (prev && typeof prev.x === "number" && typeof prev.y === "number") {
              return { dx: ox - prev.x, dy: oy - prev.y };
            }
          }

          return { dx: 0, dy: 0 };
        };

        const clearPrevOffset = (params: any) => {
          const target = params?.target as any;
          if (target && target.__annPrevOffset) {
            delete target.__annPrevOffset;
          }
        };

        const hitZone = {
          type: "line",
          id: `${ann.id}_hit`,
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
            // Cancel ECharts internal dragging transform; we render from state.
            params?.target?.drift?.(-dx, -dy);
            callbacks.onLineDrag(ann.id, dx, dy);
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
          id: `${ann.id}_line`,
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
          id: `${ann.id}_h1`,
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
            callbacks.onHandle1Drag(ann.id, dx, dy);
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
          id: `${ann.id}_h2`,
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
            callbacks.onHandle2Drag(ann.id, dx, dy);
            stopDomEvent(params);
          },
          ondragend: (params: any) => {
            clearPrevOffset(params);
            stopDomEvent(params);
          },
          onclick: (params: any) => stopDomEvent(params),
        };

        const arrowHead = ann.style.arrowEnd
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
                id: `${ann.id}_arrowEnd`,
                style: {
                  fill: ann.style.stroke,
                  opacity: ann.style.opacity,
                },
              },
            ]
          : [];

        return [hitZone, visibleLine, ...arrowHead, handle1, handle2];
      });
    },
    [annotations, selectedId],
  );

  return {
    annotations,
    selectedId,
    selectedAnnotation,
    addLine,
    selectAnnotation,
    clearSelection,
    moveAnnotation,
    moveHandle1,
    moveHandle2,
    updateAnnotationStyle,
    deleteAnnotation,
    buildGraphicElements,
  };
}
