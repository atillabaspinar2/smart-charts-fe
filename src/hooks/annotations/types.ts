export type AnnotationType = "line" | "circle" | "text" | "image";

export type LineAnnotation = {
  id: string;
  type: "line";
  shape: { x1: number; y1: number; x2: number; y2: number };
  style: {
    stroke: string;
    lineWidth: number;
    lineDash: number[];
    opacity: number;
    arrowEnd?: boolean;
  };
};

export type CircleAnnotation = {
  id: string;
  type: "circle";
  shape: { cx: number; cy: number; r: number };
  style: {
    fill: string;
    opacity: number;
  };
};

export type TextAnnotation = {
  id: string;
  type: "text";
  shape: { x: number; y: number };
  style: {
    text: string;
    fill: string;
    fontSize: number;
    opacity: number;
  };
};

export type ImageAnnotation = {
  id: string;
  type: "image";
  shape: { x: number; y: number; width: number; height: number };
  style: {
    src: string;
    opacity: number;
  };
};

export type AnyAnnotation =
  | LineAnnotation
  | CircleAnnotation
  | TextAnnotation
  | ImageAnnotation;

export const createAnnotationId = () =>
  `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export function createAnnotation(type: AnnotationType, x: number, y: number): AnyAnnotation {
  const id = createAnnotationId();
  if (type === "line") {
    return {
      id,
      type: "line",
      shape: { x1: x - 60, y1: y, x2: x + 60, y2: y },
      style: { stroke: "#f97316", lineWidth: 2, lineDash: [], opacity: 1, arrowEnd: false },
    };
  }
  if (type === "circle") {
    return {
      id,
      type: "circle",
      shape: { cx: x, cy: y, r: 32 },
      style: { fill: "#f97316", opacity: 0.9 },
    };
  }
  if (type === "text") {
    return {
      id,
      type: "text",
      shape: { x, y },
      style: { text: "Text", fill: "#f97316", fontSize: 20, opacity: 1 },
    };
  }
  return {
    id,
    type: "image",
    shape: { x: x - 60, y: y - 40, width: 120, height: 80 },
    style: { src: "", opacity: 1 },
  };
}

