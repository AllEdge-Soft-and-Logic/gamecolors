import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ToolType, MAX_HISTORY_BYTES, MAX_HISTORY_ITEMS } from '../types';
import { performFloodFill, hexToRgb } from '../utils/floodFill';
import { loadAndPrepareImage, saveCanvasAsImage } from '../utils/imageProcessing';
import { computeCanvasStats, CanvasStats } from '../utils/canvasStats';
import { CanvasStatsOverlay } from './CanvasStatsOverlay';
import { playSound } from '../utils/audio';

export interface CanvasAreaHandle {
  undo: () => void;
  clearCanvas: () => void;
  saveImage: () => void;
  canUndo: boolean;
}

interface CanvasAreaProps {
  tool: ToolType;
  color: string;
  brushSize: number;
  imageUrl: string;
  isGalleryOpen: boolean;
  onCanUndoChange?: (canUndo: boolean) => void;
  onLoadingChange?: (loading: boolean) => void;
  onSelectColor?: (color: string) => void;
}

export const CanvasArea = forwardRef<CanvasAreaHandle, CanvasAreaProps>(({
  tool,
  color,
  brushSize,
  imageUrl,
  onCanUndoChange,
  onLoadingChange,
  onSelectColor,
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const baseSnapshotRef = useRef<ImageData | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyBytesRef = useRef<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const isPaintingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [stats, setStats] = useState<CanvasStats>({
    uniqueColorCount: 0,
    percentageCompleted: 0,
    colorsUsed: [],
    totalModifiedPixels: 0,
    totalPixels: 0,
  });

  // Recompute statistics against base snapshot
  const recalculateStats = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseSnapshotRef.current) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      const currentSnap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const computed = computeCanvasStats(currentSnap, baseSnapshotRef.current);
      setStats(computed);
    } catch (err) {
      console.warn('Could not recalculate canvas stats:', err);
    }
  }, []);

  // Update canUndo state
  const notifyCanUndo = useCallback(() => {
    if (onCanUndoChange) {
      onCanUndoChange(historyRef.current.length > 0);
    }
  }, [onCanUndoChange]);

  // Fit canvas dynamically to its container preserving aspect ratio
  const fitCanvasToContainer = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || !canvas.width || !canvas.height) return;

    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
    const targetW = Math.max(10, Math.floor(canvas.width * scale));
    const targetH = Math.max(10, Math.floor(canvas.height * scale));

    canvas.style.width = `${targetW}px`;
    canvas.style.height = `${targetH}px`;
  }, []);

  // Save state for undo
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(snap);
    historyBytesRef.current += snap.data.byteLength;

    while (
      historyRef.current.length > 1 &&
      (historyBytesRef.current > MAX_HISTORY_BYTES ||
        historyRef.current.length > MAX_HISTORY_ITEMS)
    ) {
      const removed = historyRef.current.shift();
      if (removed) {
        historyBytesRef.current -= removed.data.byteLength;
      }
    }
    notifyCanUndo();
  }, [notifyCanUndo]);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length === 0) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const prev = historyRef.current.pop();
    if (!prev) return;
    historyBytesRef.current -= prev.data.byteLength;
    ctx.putImageData(prev, 0, 0);
    notifyCanUndo();
    recalculateStats();
  }, [notifyCanUndo, recalculateStats]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    saveState();
    if (baseSnapshotRef.current) {
      ctx.putImageData(baseSnapshotRef.current, 0, 0);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    recalculateStats();
  }, [saveState, recalculateStats]);

  const saveImage = useCallback(() => {
    if (canvasRef.current) {
      saveCanvasAsImage(canvasRef.current);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    undo,
    clearCanvas,
    saveImage,
    canUndo: historyRef.current.length > 0,
  }), [undo, clearCanvas, saveImage]);

  // Load new image outline
  useEffect(() => {
    let active = true;
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;

    setIsLoading(true);
    if (onLoadingChange) onLoadingChange(true);

    loadAndPrepareImage(imageUrl, canvas)
      .then((snapshot) => {
        if (!active) return;
        baseSnapshotRef.current = snapshot;
        historyRef.current = [];
        historyBytesRef.current = 0;
        notifyCanUndo();
        fitCanvasToContainer();
        recalculateStats();
      })
      .catch((err) => {
        console.error('Failed to load image outline:', err);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      });

    return () => {
      active = false;
    };
  }, [imageUrl, fitCanvasToContainer, notifyCanUndo, onLoadingChange, recalculateStats]);

  // Resize listener
  useEffect(() => {
    let rafId = 0;
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(fitCanvasToContainer);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(fitCanvasToContainer, 250);
    });

    const observer = new ResizeObserver(() => {
      fitCanvasToContainer();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [fitCanvasToContainer]);

  // Coordinate conversion helper
  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { x, y } = getCanvasPos(e);

    if (tool === 'bucket') {
      saveState();
      const rgb = hexToRgb(color);
      const filled = performFloodFill(ctx, Math.floor(x), Math.floor(y), rgb);
      if (filled) {
        playSound('fill');
        recalculateStats();
      }
      return;
    }

    // Pen tool
    isPaintingRef.current = true;
    try {
      if (canvas.setPointerCapture) {
        canvas.setPointerCapture(e.pointerId);
      }
    } catch (_) {}

    saveState();
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;

    lastPosRef.current = { x, y };

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const coalesced = (e.nativeEvent as PointerEvent).getCoalescedEvents
      ? (e.nativeEvent as PointerEvent).getCoalescedEvents()
      : null;
    const points = (coalesced && coalesced.length) ? coalesced : [e.nativeEvent];

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);

    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const px = (p.clientX - rect.left) * (canvas.width / rect.width);
      const py = (p.clientY - rect.top) * (canvas.height / rect.height);
      ctx.lineTo(px, py);
      lastPosRef.current = { x: px, y: py };
    }
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current) return;
    isPaintingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.beginPath();
    }
    try {
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    recalculateStats();
  };

  return (
    <main ref={containerRef} className="canvas-container">
      <CanvasStatsOverlay
        stats={stats}
        currentColor={color}
        onSelectColor={(c) => onSelectColor?.(c)}
      />

      {isLoading && (
        <div id="loader" role="status" aria-live="polite" style={{ display: 'block' }}>
          Loading outline…
        </div>
      )}
      <canvas
        ref={canvasRef}
        id="canvas"
        width={1200}
        height={900}
        aria-label="Coloring canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </main>
  );
});
