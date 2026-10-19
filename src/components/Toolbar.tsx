import React from 'react';
import { ToolType } from '../types';
import { playSound } from '../utils/audio';

interface ToolbarProps {
  tool: ToolType;
  brushSize: number;
  isGalleryOpen: boolean;
  canUndo: boolean;
  onToggleGallery: () => void;
  onSetTool: (tool: ToolType) => void;
  onSetBrushSize: (size: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onSave: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  brushSize,
  isGalleryOpen,
  canUndo,
  onToggleGallery,
  onSetTool,
  onSetBrushSize,
  onUndo,
  onClear,
  onSave,
}) => {
  return (
    <nav className="toolbar" aria-label="Drawing tools">
      <button
        type="button"
        id="galleryBtn"
        className={`tool-btn ${isGalleryOpen ? 'active' : ''}`}
        onClick={() => {
          playSound('click');
          onToggleGallery();
        }}
        title="Toggle Coloring Pages Gallery"
      >
        <span>🖼️</span>
        Gallery
      </button>

      <div className="tool-btn brush-slider-btn">
        <span>📏</span>
        <input
          type="range"
          id="brushSize"
          min="1"
          max="20"
          value={brushSize}
          aria-label="Brush size"
          onChange={(e) => onSetBrushSize(Number(e.target.value))}
        />
      </div>

      <button
        type="button"
        id="penBtn"
        className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
        onClick={() => {
          playSound('click');
          onSetTool('pen');
        }}
        title="Brush Pen Tool"
      >
        <span>🖌</span>
        Pen
      </button>

      <button
        type="button"
        id="bucketBtn"
        className={`tool-btn ${tool === 'bucket' ? 'active' : ''}`}
        onClick={() => {
          playSound('click');
          onSetTool('bucket');
        }}
        title="Flood Fill Bucket Tool"
      >
        <span>🪣</span>
        Fill
      </button>

      <button
        type="button"
        className="tool-btn"
        disabled={!canUndo}
        style={{ opacity: canUndo ? 1 : 0.55 }}
        onClick={() => {
          playSound('click');
          onUndo();
        }}
        title="Undo (Ctrl+Z)"
      >
        <span>↩</span>
        Undo
      </button>

      <button
        type="button"
        className="tool-btn"
        onClick={() => {
          playSound('click');
          onClear();
        }}
        title="Clear Drawing"
      >
        <span>🧹</span>
        Clear
      </button>

      <button
        type="button"
        className="tool-btn"
        onClick={() => {
          playSound('click');
          onSave();
        }}
        title="Save & Download Image"
      >
        <span>⬇</span>
        Save
      </button>
    </nav>
  );
};
