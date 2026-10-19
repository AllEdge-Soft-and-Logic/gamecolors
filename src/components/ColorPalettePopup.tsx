import React, { useEffect } from 'react';
import { PALETTE } from '../types';
import { playSound } from '../utils/audio';

interface ColorPalettePopupProps {
  color: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelectColor: (color: string) => void;
}

export const ColorPalettePopup: React.FC<ColorPalettePopupProps> = ({
  color,
  isOpen,
  onToggle,
  onClose,
  onSelectColor,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePickColor = (c: string) => {
    playSound('click');
    onSelectColor(c);
    onClose();
  };

  return (
    <>
      <div
        id="paletteOverlay"
        className={`palette-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <div
        id="palettePopup"
        className={`palette-popup ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Color palette"
      >
        <div className="colors" id="colors">
          {PALETTE.map((c) => {
            const isActive = c.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                className={`swatch ${isActive ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
                onClick={() => handlePickColor(c)}
              />
            );
          })}
          <input
            type="color"
            className={`swatch ${!PALETTE.includes(color.toLowerCase()) ? 'active' : ''}`}
            value={color}
            aria-label="Custom color"
            onChange={(e) => onSelectColor(e.target.value)}
            onBlur={() => onClose()}
          />
        </div>
      </div>

      <button
        type="button"
        id="colorBtn"
        className="color-btn"
        aria-label="Choose color"
        style={{ backgroundColor: color }}
        onClick={() => {
          playSound('click');
          onToggle();
        }}
      >
        🎨
      </button>
    </>
  );
};
