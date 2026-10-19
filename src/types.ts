export type ToolType = 'pen' | 'bucket';

export interface ColoringImage {
  file: string;
  url: string;
  name: string;
}

export const PALETTE = [
  '#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#00ffff', '#0000ff',
  '#8b00ff', '#ff1493', '#a52a2a', '#deb887', '#ffd700', '#808000',
  '#006400', '#20b2aa', '#4682b4', '#4b0082', '#800080', '#c71585',
  '#000000', '#555555', '#aaaaaa', '#ffffff', '#ffcccb', '#ffe4b5'
];

export const MAX_CANVAS_PIXELS = 1_200_000;
export const MAX_HISTORY_BYTES = 32 * 1024 * 1024;
export const MAX_HISTORY_ITEMS = 20;
export const FILL_TOLERANCE = 42;
export const DESKTOP_BP = 900;
