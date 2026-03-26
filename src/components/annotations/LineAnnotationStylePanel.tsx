import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/colorpicker";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { LineAnnotation } from "@/hooks/useAnnotation";

type Props = {
  annotation: LineAnnotation;
  anchorRect: DOMRect | null;
  onDelete: () => void;
  onStyleChange: (styleUpdate: {
    stroke?: string;
    lineWidth?: number;
    lineDash?: number[];
    arrowEnd?: boolean;
  }) => void;
};

export function LineAnnotationStylePanel({
  annotation,
  anchorRect,
  onDelete,
  onStyleChange,
}: Props) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!anchorRect) return;
    const margin = 10;
    const width = 260;
    const top = Math.max(10, anchorRect.top + margin);
    const left = Math.max(10, anchorRect.right - width - margin);
    setPos({ top, left });
  }, [anchorRect]);

  const dashed = (annotation.style.lineDash?.length ?? 0) > 0;
  const widthValue = useMemo(() => [annotation.style.lineWidth], [annotation]);

  if (!pos) return null;

  return (
    <div
      data-no-drag="true"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: 260,
        zIndex: 9999,
        opacity: 0.92,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Card size="sm" className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Line</CardTitle>
            <Button size="xs" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs text-muted-foreground">Color</Label>
            <ColorPicker
              color={annotation.style.stroke}
              onChange={(stroke) => onStyleChange({ stroke })}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Width</Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {annotation.style.lineWidth}
              </span>
            </div>
            <Slider
              min={1}
              max={12}
              value={widthValue}
              onValueChange={(v) =>
                onStyleChange({ lineWidth: Math.max(1, Number(v?.[0] ?? 2)) })
              }
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs text-muted-foreground">Dashed</Label>
            <Switch
              checked={dashed}
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
        </CardContent>
      </Card>
    </div>
  );
}

