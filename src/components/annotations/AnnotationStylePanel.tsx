import { type ReactNode, useRef, useState } from "react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/colorpicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { AnyAnnotation } from "@/hooks/useAnnotation";
import { Tooltip } from "../UILibrary/Tooltip";

type Props = {
  annotation: AnyAnnotation;
  onDelete: () => void;
  onStyleChange: (styleUpdate: Record<string, unknown>) => void;
  onShapeChange: (shapeUpdate: Record<string, unknown>) => void;
};

function Row({
  label,
  right,
  children,
}: {
  label: string;
  right?: string | number;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {right !== undefined && (
          <span className="text-xs tabular-nums text-muted-foreground">{right}</span>
        )}
      </div>
      {children}
    </div>
  );
}

export function AnnotationStylePanel({
  annotation,
  onDelete,
  onStyleChange,
  onShapeChange,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const title = annotation.type[0].toUpperCase() + annotation.type.slice(1);

  const onImageFileChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result ?? "");
      if (!src) return;

      const img = new Image();
      img.onload = () => {
        const naturalW = Math.max(1, Number(img.naturalWidth || 1));
        const naturalH = Math.max(1, Number(img.naturalHeight || 1));
        const sourceAspectRatio = naturalW / naturalH;

        if (annotation.type === "image") {
          const baseWidth = Math.max(24, Number(annotation.shape.width || 120));
          const nextHeight = Math.max(24, Math.round(baseWidth / sourceAspectRatio));
          onShapeChange({ width: baseWidth, height: nextHeight });
          onStyleChange({ src, lockAspectRatio: true, sourceAspectRatio });
        } else {
          onStyleChange({ src });
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const startPanelDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const start = {
      x: e.clientX,
      y: e.clientY,
      dx: dragOffset.x,
      dy: dragOffset.y,
    };
    dragStartRef.current = start;

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - start.x;
      const dy = moveEvent.clientY - start.y;
      setDragOffset({ x: start.dx + dx, y: start.dy + dy });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      dragStartRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={panelRef}
      data-no-drag="true"
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        width: 280,
        zIndex: 9999,
        opacity: 0.92,
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="cursor-default"
    >
      <Card size="sm" className="shadow-lg">
        <CardHeader className="border-b cursor-move select-none" onMouseDown={startPanelDrag}>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{title}</CardTitle>
            <Tooltip content="Delete annotation">
              <Button
                size="icon-xs"
                variant="destructive"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={onDelete}
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </Button>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {annotation.type === "line" && (
            <>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <ColorPicker
                  color={annotation.style.stroke}
                  onChange={(stroke) => onStyleChange({ stroke })}
                />
              </div>
              <Row label="Width" right={annotation.style.lineWidth}>
                <Slider
                  min={1}
                  max={12}
                  value={[annotation.style.lineWidth]}
                  onValueChange={(v) =>
                    onStyleChange({ lineWidth: Math.max(1, Number(v?.[0] ?? 2)) })
                  }
                />
              </Row>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-muted-foreground">Dashed</Label>
                <Switch
                  checked={(annotation.style.lineDash?.length ?? 0) > 0}
                  onCheckedChange={(checked) =>
                    onStyleChange({ lineDash: checked ? [6, 3] : [] })
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-muted-foreground">Arrow end</Label>
                <Switch
                  checked={Boolean(annotation.style.arrowEnd)}
                  onCheckedChange={(checked) => onStyleChange({ arrowEnd: checked })}
                />
              </div>
            </>
          )}

          {annotation.type === "circle" && (
            <>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <ColorPicker
                  color={annotation.style.fill}
                  onChange={(fill) => onStyleChange({ fill })}
                />
              </div>
              <Row label="Radius" right={annotation.shape.r}>
                <Slider
                  min={8}
                  max={180}
                  value={[annotation.shape.r]}
                  onValueChange={(v) =>
                    onShapeChange({ r: Math.max(8, Number(v?.[0] ?? annotation.shape.r)) })
                  }
                />
              </Row>
            </>
          )}

          {annotation.type === "text" && (
            <>
              <Row label="Text">
                <Input
                  value={annotation.style.text}
                  onChange={(e) => onStyleChange({ text: e.target.value })}
                />
              </Row>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <ColorPicker
                  color={annotation.style.fill}
                  onChange={(fill) => onStyleChange({ fill })}
                />
              </div>
              <Row label="Size" right={annotation.style.fontSize}>
                <Slider
                  min={10}
                  max={72}
                  value={[annotation.style.fontSize]}
                  onValueChange={(v) =>
                    onStyleChange({
                      fontSize: Math.max(10, Number(v?.[0] ?? annotation.style.fontSize)),
                    })
                  }
                />
              </Row>
            </>
          )}

          {annotation.type === "image" && (
            <>
              <Row label="Image file">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageFileChange(e.target.files?.[0])}
                />
              </Row>
              <Row label="Width" right={Math.round(annotation.shape.width)}>
                <Slider
                  min={24}
                  max={500}
                  value={[annotation.shape.width]}
                  onValueChange={(v) =>
                    (() => {
                      const nextWidth = Math.max(
                        24,
                        Number(v?.[0] ?? annotation.shape.width),
                      );
                      const lock = Boolean(annotation.style.lockAspectRatio);
                      if (!lock) {
                        onShapeChange({ width: nextWidth });
                        return;
                      }
                      const ratio =
                        Number(annotation.style.sourceAspectRatio) > 0
                          ? 1 / Number(annotation.style.sourceAspectRatio)
                          : annotation.shape.width > 0
                            ? annotation.shape.height / annotation.shape.width
                            : 1;
                      onShapeChange({
                        width: nextWidth,
                        height: Math.max(24, Math.round(nextWidth * ratio)),
                      });
                    })()
                  }
                />
              </Row>
              <Row label="Height" right={Math.round(annotation.shape.height)}>
                <Slider
                  min={24}
                  max={500}
                  value={[annotation.shape.height]}
                  onValueChange={(v) =>
                    (() => {
                      const nextHeight = Math.max(
                        24,
                        Number(v?.[0] ?? annotation.shape.height),
                      );
                      const lock = Boolean(annotation.style.lockAspectRatio);
                      if (!lock) {
                        onShapeChange({ height: nextHeight });
                        return;
                      }
                      const ratio =
                        Number(annotation.style.sourceAspectRatio) > 0
                          ? Number(annotation.style.sourceAspectRatio)
                          : annotation.shape.height > 0
                            ? annotation.shape.width / annotation.shape.height
                            : 1;
                      onShapeChange({
                        height: nextHeight,
                        width: Math.max(24, Math.round(nextHeight * ratio)),
                      });
                    })()
                  }
                />
              </Row>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-muted-foreground">Lock ratio</Label>
                <Switch
                  checked={Boolean(annotation.style.lockAspectRatio)}
                  onCheckedChange={(checked) =>
                    onStyleChange({ lockAspectRatio: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-muted-foreground">
                  Use source ratio
                </Label>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    const sourceAspectRatio = Number(
                      annotation.style.sourceAspectRatio || 0,
                    );
                    if (!(sourceAspectRatio > 0)) return;
                    const width = Math.max(24, Number(annotation.shape.width || 120));
                    const height = Math.max(
                      24,
                      Math.round(width / sourceAspectRatio),
                    );
                    onShapeChange({ width, height });
                    onStyleChange({ lockAspectRatio: true });
                  }}
                >
                  Restore
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

