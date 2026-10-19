# 🎨 Coloring App Pro

A modern, responsive digital coloring book Progressive Web Application rewritten in React, TypeScript, and Vite.

## Features

- **High-Performance Canvas**: Supports touch, stylus, and mouse with pointer capture and coalesced event smoothing.
- **Flood Fill Bucket (🪣)**: Fast scanline flood-fill algorithm with color tolerance for filling regions cleanly.
- **Brush Pen Tool (🖌)**: Smooth freehand drawing with configurable brush width slider (1–20px).
- **Vibrant Color Palette (🎨)**: 24 preset vibrant swatches plus custom native HTML5 color picker.
- **Undo History (↩)**: Multi-step history stack with keyboard shortcut support (`Ctrl+Z` / `Cmd+Z`).
- **Clear Canvas (🧹)**: Instantly resets artwork back to the clean black-and-white outline.
- **Export & Save (⬇)**: Download completed coloring creations directly as high-resolution PNG images.
- **Coloring Pages Gallery (🖼️)**: Slide-out vertical gallery loaded with 40+ animal, character, and cartoon illustrations.
- **PWA & Mobile Support**: Service worker caching, offline capability, standalone manifest, and home screen install banner.
- **Canvas Statistics Overlay (📊)**: Toggleable floating chip tracking unique colors used, image completion percentage, visual progress bar, clickable palette swatches, and a subtle confetti & celebratory chime upon reaching 100% completion.
- **Interactive Audio Feedback**: Sound effects on bucket fill, button interactions, and completion celebrations.

## Development

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```
