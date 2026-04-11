import { drawExportWatermark } from "@/utils/videoWatermark";

/**
 * Composite one video frame: chart card background + ECharts canvas at the correct offset.
 * Uses layout-sized output so CSS transforms (e.g. anime.js sketch slide) are captured; the
 * raw ECharts canvas captureStream does not include parent transforms.
 */
export function compositeChartContainerFrame(
  container: HTMLElement,
  backgroundColor: string,
): HTMLCanvasElement | null {
  const w = Math.max(container.offsetWidth, container.scrollWidth);
  const h = Math.max(container.offsetHeight, container.scrollHeight);
  if (w <= 0 || h <= 0) return null;

  const output = document.createElement("canvas");
  output.width = w;
  output.height = h;
  const ctx = output.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, w, h);

  const sourceCanvas = container.querySelector(
    "canvas",
  ) as HTMLCanvasElement | null;
  if (!sourceCanvas) return output;

  const containerRect = container.getBoundingClientRect();
  const canvasRect = sourceCanvas.getBoundingClientRect();
  const x = canvasRect.left - containerRect.left + container.scrollLeft;
  const y = canvasRect.top - containerRect.top + container.scrollTop;
  const dw = sourceCanvas.offsetWidth;
  const dh = sourceCanvas.offsetHeight;

  ctx.drawImage(
    sourceCanvas,
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height,
    x,
    y,
    dw,
    dh,
  );
  return output;
}

function pickRecorderMimeType(mediaType: string): string {
  if (mediaType === "mp4") {
    return "video/mp4; codecs=avc1.42E01E,mp4a.40.2";
  }
  return "video/webm; codecs=vp9";
}

function resolveMimeTypeForRecorder(mediaType: string): string {
  let mimeType = pickRecorderMimeType(mediaType);
  if (typeof MediaRecorder !== "undefined") {
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      const fallbackWebm = "video/webm; codecs=vp9";
      const fallbackVp8 = "video/webm; codecs=vp8";
      if (MediaRecorder.isTypeSupported(fallbackWebm)) {
        mimeType = fallbackWebm;
      } else if (MediaRecorder.isTypeSupported(fallbackVp8)) {
        mimeType = fallbackVp8;
      } else {
        mimeType = "";
      }
    }
  }
  return mimeType;
}

/**
 * Record the chart card (container) so timeline sketch motion (anime.js) matches the browser.
 */
export const recordChartContainer = (
  container: HTMLElement,
  backgroundColor: string,
  durationMs: number = 5000,
  mediaType: string = "webm",
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const first = compositeChartContainerFrame(container, backgroundColor);
      if (!first) {
        resolve();
        return;
      }

      const compositeCanvas = document.createElement("canvas");
      compositeCanvas.width = first.width;
      compositeCanvas.height = first.height;
      const ctx = compositeCanvas.getContext("2d");
      if (!ctx) {
        resolve();
        return;
      }

      const stream = compositeCanvas.captureStream(30);
      const mimeType = resolveMimeTypeForRecorder(mediaType);
      const recorder =
        mimeType && typeof MediaRecorder !== "undefined"
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const drawFrame = () => {
        const frame = compositeChartContainerFrame(container, backgroundColor);
        if (!frame || !ctx) return;
        ctx.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
        ctx.drawImage(frame, 0, 0);
        drawExportWatermark(ctx, compositeCanvas.width, compositeCanvas.height);
      };

      const startedAt = performance.now();
      const tick = (now: number) => {
        if (now - startedAt >= durationMs) return;
        drawFrame();
        requestAnimationFrame(tick);
      };

      recorder.start();
      drawFrame();
      requestAnimationFrame(tick);

      recorder.onstop = () => {
        const ext = mediaType === "mp4" ? "mp4" : "webm";
        const type =
          mimeType || (ext === "mp4" ? "video/mp4" : "video/webm");
        const blob = new Blob(chunks, { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `chart-video.${ext}`;
        link.click();
        URL.revokeObjectURL(url);
        resolve();
      };

      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, durationMs);
    } catch (err) {
      reject(err);
    }
  });
};
