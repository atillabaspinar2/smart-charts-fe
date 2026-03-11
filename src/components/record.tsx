export const recordCanvas = (
  canvas: HTMLCanvasElement,
  durationMs: number = 5000,
  format: string = "webm",
) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const stream = canvas.captureStream(30);
      let mimeType: string;
      if (format === "mp4") {
        mimeType = "video/mp4"; // not widely supported but try
      } else {
        mimeType = "video/webm; codecs=vp9";
      }
      const recorder = new MediaRecorder(stream, {
        mimeType,
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `chart-video.${format}`;
        link.click();
        resolve();
      };

      recorder.start();
      // record for requested duration, default 5 seconds
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
