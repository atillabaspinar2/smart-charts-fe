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

        const hitZone = {
          type: "line",
          id: `${ann.id}_hit`,
          shape: { x1, y1, x2, y2 },
          style: { stroke: "transparent", lineWidth: HIT_ZONE_WIDTH },
          draggable: true,
          cursor: "move",
          z: 100,
          ondrag: ({ dx, dy }: any) => callbacks.onLineDrag(ann.id, dx, dy),
          onclick: () => callbacks.onSelect(ann.id),
        };

        const visibleLine = {
          type: "line",
          id: `${ann.id}_line`,
          shape: { x1, y1, x2, y2 },
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
          ondrag: ({ dx, dy }: any) => callbacks.onHandle1Drag(ann.id, dx, dy),
          onclick: () => callbacks.onSelect(ann.id),
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
          ondrag: ({ dx, dy }: any) => callbacks.onHandle2Drag(ann.id, dx, dy),
          onclick: () => callbacks.onSelect(ann.id),
        };

        const arrowHead =
          ann.style.arrowEnd && selected
            ? [
                {
                  ...buildArrowHead({
                    x1,
                    y1,
                    x2,
                    y2,
                    color: ann.style.stroke,
                    size: Math.max(10, ann.style.lineWidth * 3 + 8),
                  }),
                  id: `${ann.id}_arrowEnd`,
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
