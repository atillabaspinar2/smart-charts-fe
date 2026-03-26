export function stopDomEvent(params: any) {
  const evt = params?.event;
  const domEvt = evt?.event ?? evt;
  domEvt?.stopPropagation?.();
  domEvt?.preventDefault?.();
  if (evt) evt.cancelBubble = true;
  if (params) params.cancelBubble = true;
}

export function getDragDelta(params: any): { dx: number; dy: number } {
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
}

export function clearPrevOffset(params: any) {
  const target = params?.target as any;
  if (target && target.__annPrevOffset) delete target.__annPrevOffset;
}

export type AnnotationCallbacks = {
  onSelect: (id: string) => void;
  onMove: (id: string, dx: number, dy: number) => void;
  onLineHandle1Drag: (id: string, dx: number, dy: number) => void;
  onLineHandle2Drag: (id: string, dx: number, dy: number) => void;
};

