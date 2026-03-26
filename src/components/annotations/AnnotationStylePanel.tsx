import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/colorpicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { AnyAnnotation } from "@/hooks/useAnnotation";

type Props = {
  annotation: AnyAnnotation;
  anchorRect: DOMRect | null;
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
  anchorRect,
  onDelete,
  onStyleChange,
  onShapeChange,
}: Props) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!anchorRect) return;
    const margin = 10;
    const width = 280;
    const top = Math.max(10, anchorRect.top + margin);
    const left = Math.max(10, anchorRect.right - width - margin);
    setPos({ top, left });
  }, [anchorRect]);

  if (!pos) return null;

  const title = annotation.type[0].toUpperCase() + annotation.type.slice(1);

  const onImageFileChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result ?? "");
      if (src) onStyleChange({ src });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      data-no-drag="true"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: 280,
        zIndex: 9999,
        opacity: 0.92,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Card size="sm" className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{title}</CardTitle>
            <Button size="xs" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
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
                    onShapeChange({
                      width: Math.max(24, Number(v?.[0] ?? annotation.shape.width)),
                    })
                  }
                />
              </Row>
              <Row label="Height" right={Math.round(annotation.shape.height)}>
                <Slider
                  min={24}
                  max={500}
                  value={[annotation.shape.height]}
                  onValueChange={(v) =>
                    onShapeChange({
                      height: Math.max(24, Number(v?.[0] ?? annotation.shape.height)),
                    })
                  }
                />
              </Row>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

