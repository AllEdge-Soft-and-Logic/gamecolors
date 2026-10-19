export interface CanvasStats {
  uniqueColorCount: number;
  percentageCompleted: number;
  colorsUsed: string[];
  totalModifiedPixels: number;
  totalPixels: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Computes coloring statistics by comparing the current canvas pixels with the initial base outline snapshot.
 * Runs on a sampled grid for sub-millisecond execution.
 */
export function computeCanvasStats(
  currentData: ImageData,
  baseData: ImageData | null
): CanvasStats {
  const { width, height, data: current } = currentData;
  const totalPixels = width * height;

  if (!baseData || baseData.data.length !== current.length) {
    return {
      uniqueColorCount: 0,
      percentageCompleted: 0,
      colorsUsed: [],
      totalModifiedPixels: 0,
      totalPixels,
    };
  }

  const base = baseData.data;
  let modifiedCount = 0;
  let sampledCount = 0;

  // Track color frequencies: map quantized hex -> count
  const colorFrequencies = new Map<string, number>();

  // Sampling step: 2 gives 1 in 4 pixels sampled, plenty accurate & extremely fast
  const step = 2;

  for (let y = 0; y < height; y += step) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x += step) {
      sampledCount++;
      const i = (rowOffset + x) * 4;

      const cr = current[i];
      const cg = current[i + 1];
      const cb = current[i + 2];

      const br = base[i];
      const bg = base[i + 1];
      const bb = base[i + 2];

      // Difference from outline base snapshot
      const diff =
        Math.abs(cr - br) > 18 ||
        Math.abs(cg - bg) > 18 ||
        Math.abs(cb - bb) > 18;

      if (diff) {
        modifiedCount++;

        // Filter out near-white background or near-black outline
        const isWhite = cr > 240 && cg > 240 && cb > 240;
        const isBlack = cr < 30 && cg < 30 && cb < 30;

        if (!isWhite && !isBlack) {
          // Quantize RGB to chunks of 16 to group antialiased pen stroke pixels
          const qr = Math.min(255, Math.round(cr / 16) * 16);
          const qg = Math.min(255, Math.round(cg / 16) * 16);
          const qb = Math.min(255, Math.round(cb / 16) * 16);
          const hex = rgbToHex(qr, qg, qb);

          colorFrequencies.set(hex, (colorFrequencies.get(hex) || 0) + 1);
        }
      }
    }
  }

  // Minimum threshold to exclude single stray anti-aliased pixels
  const minThreshold = Math.max(4, Math.floor(sampledCount * 0.00008));

  // Sort colors by most used to least used
  const validColors = Array.from(colorFrequencies.entries())
    .filter(([_, count]) => count >= minThreshold)
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);

  const percentageCompleted =
    sampledCount > 0
      ? Math.min(100, Math.round((modifiedCount / sampledCount) * 1000) / 10)
      : 0;

  return {
    uniqueColorCount: validColors.length,
    percentageCompleted,
    colorsUsed: validColors,
    totalModifiedPixels: Math.round(modifiedCount * (totalPixels / sampledCount)),
    totalPixels,
  };
}
