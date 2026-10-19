import { FILL_TOLERANCE } from '../types';

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function performFloodFill(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  fillRGB: [number, number, number],
  tolerance = FILL_TOLERANCE
): boolean {
  const canvas = ctx.canvas;
  const w = canvas.width;
  const h = canvas.height;
  if (sx < 0 || sy < 0 || sx >= w || sy >= h) return false;

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const si = (sy * w + sx) * 4;
  const tr = data[si];
  const tg = data[si + 1];
  const tb = data[si + 2];
  const fr = fillRGB[0];
  const fg = fillRGB[1];
  const fb = fillRGB[2];

  // Already target color
  if (tr === fr && tg === fg && tb === fb) return false;

  const visited = new Uint8Array(w * h);

  const matches = (px: number, py: number): boolean => {
    const p = py * w + px;
    if (visited[p]) return false;
    const i = p * 4;
    return (
      (data[i] > tr ? data[i] - tr : tr - data[i]) <= tolerance &&
      (data[i + 1] > tg ? data[i + 1] - tg : tg - data[i + 1]) <= tolerance &&
      (data[i + 2] > tb ? data[i + 2] - tb : tb - data[i + 2]) <= tolerance
    );
  };

  const stack: number[] = [sx, sy];

  while (stack.length > 0) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    if (!matches(x, y)) continue;

    let left = x;
    while (left > 0 && matches(left - 1, y)) left--;
    let right = x;
    while (right < w - 1 && matches(right + 1, y)) right++;

    for (let px = left; px <= right; px++) {
      const p = y * w + px;
      visited[p] = 1;
      const i = p * 4;
      data[i] = fr;
      data[i + 1] = fg;
      data[i + 2] = fb;
      data[i + 3] = 255;
    }

    for (let py = y - 1; py <= y + 1; py += 2) {
      if (py < 0 || py >= h) continue;
      let inSpan = false;
      for (let px = left; px <= right; px++) {
        if (matches(px, py)) {
          if (!inSpan) {
            stack.push(px, py);
            inSpan = true;
          }
        } else {
          inSpan = false;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return true;
}
