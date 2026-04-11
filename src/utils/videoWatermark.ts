/** Shown on exported chart / canvas images and videos (bottom-right). */
export const EXPORT_WATERMARK_TEXT = "@chartstudio.online";

const PADDING_PX = 8;
const FONT =
  '600 11px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * Draws a small bottom-right watermark before image/video export.
 */
export function drawExportWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.save();
  ctx.font = FONT;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  const x = width - PADDING_PX;
  const y = height - PADDING_PX;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.strokeText(EXPORT_WATERMARK_TEXT, x, y);
  ctx.fillText(EXPORT_WATERMARK_TEXT, x, y);
  ctx.restore();
}
