import React, { useState, useEffect, useRef } from 'react';
import { CanvasStats } from '../utils/canvasStats';
import { playSound, playCelebrationSound } from '../utils/audio';
import { CelebrationConfetti } from './CelebrationConfetti';

interface CanvasStatsOverlayProps {
  stats: CanvasStats;
  currentColor: string;
  onSelectColor: (color: string) => void;
}

export const CanvasStatsOverlay: React.FC<CanvasStatsOverlayProps> = ({
  stats,
  currentColor,
  onSelectColor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const hasCelebratedRef = useRef(false);

  const isComplete = stats.percentageCompleted >= 100;

  // Trigger celebration when reaching 100%
  useEffect(() => {
    if (isComplete) {
      if (!hasCelebratedRef.current) {
        hasCelebratedRef.current = true;
        setShowCelebration(true);
        playCelebrationSound();
        const timer = setTimeout(() => {
          setShowCelebration(false);
        }, 3200);
        return () => clearTimeout(timer);
      }
    } else {
      // Reset so if user modifies canvas and reaches 100% again, it triggers
      hasCelebratedRef.current = false;
    }
  }, [isComplete]);

  const handleToggle = () => {
    playSound('click');
    setIsExpanded((prev) => !prev);
  };

  const handleColorClick = (color: string) => {
    playSound('click');
    onSelectColor(color);
  };

  const handleReplayCelebration = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCelebration(false);
    setTimeout(() => {
      setShowCelebration(true);
      playCelebrationSound();
      setTimeout(() => setShowCelebration(false), 3200);
    }, 40);
  };

  return (
    <div
      className={`stats-overlay-container ${isExpanded ? 'expanded' : 'collapsed'} ${
        isComplete ? 'is-complete' : ''
      }`}
      role="region"
      aria-label="Canvas Statistics"
    >
      {/* Confetti effect when completing 100% */}
      {showCelebration && <CelebrationConfetti colors={stats.colorsUsed} />}

      {!isExpanded ? (
        <button
          type="button"
          className={`stats-pill-btn ${isComplete ? 'celebrating' : ''}`}
          onClick={handleToggle}
          title={
            isComplete
              ? '🎉 100% Complete! Click to view breakdown'
              : 'Click to view coloring statistics & colors used'
          }
          aria-expanded="false"
        >
          <span className="stats-pill-icon">{isComplete ? '🎉' : '📊'}</span>
          <span className="stats-pill-text">
            {isComplete ? (
              <span className="stats-complete-badge">
                <strong>100% Complete!</strong>
              </span>
            ) : (
              <>
                <strong>{stats.uniqueColorCount}</strong>{' '}
                {stats.uniqueColorCount === 1 ? 'color' : 'colors'}
                <span className="stats-pill-dot" aria-hidden="true">
                  ·
                </span>
                <strong>{stats.percentageCompleted}%</strong>
              </>
            )}
          </span>
          <span className="stats-pill-expand-arrow">▾</span>
        </button>
      ) : (
        <div className={`stats-card ${isComplete ? 'card-complete' : ''}`}>
          <div className="stats-card-header">
            <div className="stats-card-title">
              <span className="stats-card-icon">{isComplete ? '🎉' : '📊'}</span>
              <span>{isComplete ? '100% Completed!' : 'Coloring Stats'}</span>
            </div>
            <div className="stats-header-actions">
              {isComplete && (
                <button
                  type="button"
                  className="stats-replay-confetti-btn"
                  onClick={handleReplayCelebration}
                  title="Play celebration again"
                  aria-label="Play celebration confetti"
                >
                  ✨
                </button>
              )}
              <button
                type="button"
                className="stats-card-close-btn"
                onClick={handleToggle}
                title="Minimize stats"
                aria-label="Close stats details"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="stats-card-body">
            {/* Celebration Banner if 100% */}
            {isComplete && (
              <div className="stats-celebration-banner">
                <span className="stats-celebration-emoji">🏆</span>
                <div className="stats-celebration-copy">
                  <div className="stats-celebration-headline">Artwork Complete!</div>
                  <div className="stats-celebration-subtext">
                    You colored 100% of this page using {stats.uniqueColorCount}{' '}
                    {stats.uniqueColorCount === 1 ? 'color' : 'colors'}.
                  </div>
                </div>
              </div>
            )}

            {/* Completion Meter */}
            <div className="stats-metric-row">
              <div className="stats-metric-label">
                <span>Completion</span>
                <span className="stats-metric-value tabular-nums">
                  {stats.percentageCompleted}%
                </span>
              </div>
              <div className="stats-progress-track">
                <div
                  className={`stats-progress-bar ${isComplete ? 'bar-complete' : ''}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, stats.percentageCompleted))}%`,
                  }}
                />
              </div>
            </div>

            {/* Unique Colors Count */}
            <div className="stats-metric-row">
              <div className="stats-metric-label">
                <span>Unique Colors Used</span>
                <span className="stats-metric-value tabular-nums">{stats.uniqueColorCount}</span>
              </div>
            </div>

            {/* Colors Swatches Breakdown */}
            <div className="stats-colors-section">
              <span className="stats-colors-title">Colors in this artwork:</span>
              {stats.colorsUsed.length === 0 ? (
                <div className="stats-empty-colors">
                  Start coloring to see your palette breakdown here!
                </div>
              ) : (
                <div className="stats-swatches-grid">
                  {stats.colorsUsed.map((c) => {
                    const isSelected = c.toLowerCase() === currentColor.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`stats-swatch-item ${isSelected ? 'active' : ''}`}
                        style={{ backgroundColor: c }}
                        title={`Select color ${c}`}
                        aria-label={`Select used color ${c}`}
                        onClick={() => handleColorClick(c)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
