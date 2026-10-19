# Canvas Statistics Overlay (Colors Used & Completion Tracker)

A toggleable, interactive statistics overlay for the coloring canvas that displays real-time progress metrics: the count of unique colors applied and the estimated completion percentage of the active coloring page, with an expandable breakdown of color swatches.

## User Review & Critical Decisions

> [!IMPORTANT]
> The design and operational details have been calibrated based on the user's confirmed choices:
> - **Placement & Trigger**: Floating pill/chip anchored in the top-left corner of the canvas area, easily reachable without obstructing drawing.
> - **Completion Calculation**: Calculated dynamically as the percentage of canvas pixels that differ from the base black-and-white outline snapshot.
> - **Detail Level**: A compact pill displaying quick metrics (`🎨 X colors · Y% complete`) that smoothly expands upon click to reveal the palette breakdown of used colors and quick statistics.

---

## 1. Overview & Core Concept

- **What It Does**: As the user colors with the pen or fills regions with the bucket tool, the statistics overlay calculates the unique colors drawn onto the canvas and measures what percentage of the image has been colored in relative to the base outline.
- **Target Audience & Persona**: Casual painters, kids, and coloring book enthusiasts who want rewarding progress feedback, completion goals, and an artistic inventory of the colors they've combined.
- **Key Value**: Gamifies the coloring experience, provides immediate visual feedback, and helps users see their creative progress without getting in the way of the canvas.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Initial Load**:
   - The user selects or views a coloring page.
   - The stats pill appears in the top-left corner of the canvas container with clean, neutral styling: `🎨 0 colors · 0% done`.
2. **Interactive Drawing & Filling**:
   - When the user draws with the pen or fills regions with the paint bucket, the stats update automatically (debounced slightly to preserve 60fps drawing responsiveness).
   - The completion percentage smoothly ticks up (e.g. `12%` → `38%` → `65%`).
3. **Toggle & Expand Breakdown**:
   - Tapping the floating chip toggles it between the compact badge and an expanded micro-card.
   - The expanded view displays:
     - Prominent completion percentage with a sleek progress bar.
     - Number of unique colors used.
     - Interactive row of circular swatches showing each distinct color used on the canvas.
     - Clicking any used swatch in the breakdown selects that color immediately as the active painting color.
   - Tapping the collapse chevron or tapping outside minimizes the card back to the compact pill.

### Visual Identity & Theme
- **Surface Elevation**: Frosted glass surface (`backdrop-blur-md bg-white/90 shadow-md border border-slate-200/80 rounded-2xl`).
- **Typography & Formatting**: Clean, legible type (`Plus Jakarta Sans / system-ui`) paired with tabular numerals (`tabular-nums font-mono`) for stable, flicker-free numerical updates.
- **Touch Ergonomics**: Minimum $44\text{px}$ touch target height for the pill button, positioned with safe margins from the header and left gallery drawer.

---

## 3. Key Product Decisions & Trade-Offs

- **Performance-Aware Pixel Sampling**:
  - *Chosen Approach*: To compute unique colors and completion percentage without blocking the main UI thread during pen strokes, the analyzer runs across a downsampled copy or sampled pixel grid on pointer-up and after bucket fills, debounced by ~150ms.
  - *Why*: Direct synchronous full-resolution pixel scanning on every pointer-move event would cause lag. Sampling after stroke completion ensures seamless 60fps drawing.
  - *Alternatives Considered*: Web Worker with SharedArrayBuffer (unnecessary complexity for 1.2M pixels with post-stroke sampling).

- **Color Quantification & Clumping**:
  - *Chosen Approach*: Group similar colors into unique hues (RGB quantization with small delta threshold $\Delta \approx 10$) so brush antialiasing / binarization edges aren't counted as dozens of spurious distinct colors.
  - *Why*: Anti-aliased stroke edges produce intermediate shades; quantization ensures only genuine intentional colors used by the painter are reported.

- **Click-to-Pick Color Swatches**:
  - *Chosen Approach*: Allow users to click any color swatch shown in the statistics breakdown to instantly switch to that color.
  - *Why*: Turns a passive informational widget into an active creative utility, making it effortless to re-select a previously used color.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  State: tool, color, brushSize, selectedImage, isGalleryOpen │
└──────────────────────────────┬───────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐          ┌────────────────────────────┐
│      CanvasArea.tsx          │          │   CanvasStatsOverlay.tsx   │
│  - Canvas element & Context  │◄─────────┤  - Floating pill toggle    │
│  - Stroke & FloodFill engine │ (pixel   │  - Completion % meter      │
│  - Base outline snapshot     │  stats)  │  - Unique color count      │
│  - Exposes getCanvasStats()  │          │  - Swatch palette picker   │
└──────────────────────────────┘          └────────────────────────────┘
```

### Component & State Mapping
- `src/utils/canvasStats.ts`:
  - `computeCanvasStats(ctx, baseSnapshot)`: Compares current canvas pixel buffer with the original outline snapshot. Counts modified pixels (completion %) and clusters colored pixels into unique non-background colors.
- `src/components/CanvasStatsOverlay.tsx`:
  - Floating container positioned in `.canvas-container` at top-left (`top-4 left-4`).
  - Animated toggle between compact pill and expanded details card.
  - Emits `onSelectColor(color)` when user taps a swatch in the list.
- `src/components/CanvasArea.tsx`:
  - Triggers stats computation on initial image load, stroke end (`pointerup`), flood fill end, undo, and clear.
  - Passes stats data to overlay or renders overlay as an integrated overlay child.
