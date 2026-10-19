import { MAX_CANVAS_PIXELS } from '../types';

export function binarizeCanvas(ctx: CanvasRenderingContext2D): void {
  const canvas = ctx.canvas;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    const v = lum < 150 ? 0 : 255;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
}

export function loadAndPrepareImage(
  url: string,
  canvas: HTMLCanvasElement
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';

    if (/\.svg(\?|#|$)/i.test(url)) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      let w = img.naturalWidth || 1200;
      let h = img.naturalHeight || 900;

      const scale = Math.min(1, Math.sqrt(MAX_CANVAS_PIXELS / (w * h)));
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      binarizeCanvas(ctx);
      const snapshot = ctx.getImageData(0, 0, w, h);
      resolve(snapshot);
    };

    img.onerror = (e) => {
      reject(e);
    };

    img.src = url;
  });
}

export function saveCanvasAsImage(canvas: HTMLCanvasElement): void {
  const link = document.createElement('a');
  link.download = `coloring-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
