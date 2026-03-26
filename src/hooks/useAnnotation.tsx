import { useCallback, useMemo, useState } from "react";
import { buildCircleGraphic } from "./annotations/builders/circleBuilder";
import { buildImageGraphic } from "./annotations/builders/imageBuilder";
import { buildLineGraphic } from "./annotations/builders/lineBuilder";
import { buildTextGraphic } from "./annotations/builders/textBuilder";
import type { AnnotationCallbacks } from "./annotations/interaction";
import {
  createAnnotation,
  type AnyAnnotation,
  type AnnotationType,
  type CircleAnnotation,
  type ImageAnnotation,
  type LineAnnotation,
  type TextAnnotation,
} from "./annotations/types";

export type { AnyAnnotation, LineAnnotation, CircleAnnotation, TextAnnotation, ImageAnnotation };

export function useAnnotations() {
  const [annotations, setAnnotations] = useState<AnyAnnotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addAnnotation = useCallback((type: AnnotationType, dropPos: { x: number; y: number }) => {
    const newAnn = createAnnotation(type, dropPos.x, dropPos.y);
    setAnnotations((prev) => [...prev, newAnn]);
    setSelectedId(newAnn.id);
    return newAnn.id;
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
          : a.type === "line"
            ? {
                ...a,
                shape: {
                  x1: a.shape.x1 + dx,
                  y1: a.shape.y1 + dy,
                  x2: a.shape.x2 + dx,
                  y2: a.shape.y2 + dy,
                },
              }
            : a.type === "circle"
              ? { ...a, shape: { ...a.shape, cx: a.shape.cx + dx, cy: a.shape.cy + dy } }
              : a.type === "text"
                ? { ...a, shape: { ...a.shape, x: a.shape.x + dx, y: a.shape.y + dy } }
                : { ...a, shape: { ...a.shape, x: a.shape.x + dx, y: a.shape.y + dy } },
      ),
    );
  }, []);

  const moveHandle1 = useCallback((id: string, dx: number, dy: number) => {
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id !== id || a.type !== "line"
          ? a
          : { ...a, shape: { ...a.shape, x1: a.shape.x1 + dx, y1: a.shape.y1 + dy } },
      ),
    );
  }, []);

  const moveHandle2 = useCallback((id: string, dx: number, dy: number) => {
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id !== id || a.type !== "line"
          ? a
          : { ...a, shape: { ...a.shape, x2: a.shape.x2 + dx, y2: a.shape.y2 + dy } },
      ),
    );
  }, []);

  const updateAnnotationStyle = useCallback(
    (id: string, styleUpdate: Record<string, unknown>) => {
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id !== id
            ? a
            : ({
                ...a,
                style: { ...(a as any).style, ...styleUpdate },
              } as AnyAnnotation),
        ),
      );
    },
    [],
  );

  const updateAnnotationShape = useCallback(
    (id: string, shapeUpdate: Record<string, unknown>) => {
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id !== id
            ? a
            : ({
                ...a,
                shape: { ...(a as any).shape, ...shapeUpdate },
              } as AnyAnnotation),
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
    (callbacks: AnnotationCallbacks) => {
      return annotations.map((ann) => {
        const selected = ann.id === selectedId;
        if (ann.type === "line") return buildLineGraphic(ann, selected, callbacks);
        if (ann.type === "circle") return buildCircleGraphic(ann, selected, callbacks);
        if (ann.type === "text") return buildTextGraphic(ann, selected, callbacks);
        return buildImageGraphic(ann, selected, callbacks);
      });
    },
    [annotations, selectedId],
  );

  return {
    annotations,
    selectedId,
    selectedAnnotation,
    addAnnotation,
    selectAnnotation,
    clearSelection,
    moveAnnotation,
    moveHandle1,
    moveHandle2,
    updateAnnotationStyle,
    updateAnnotationShape,
    deleteAnnotation,
    buildGraphicElements,
  };
}
