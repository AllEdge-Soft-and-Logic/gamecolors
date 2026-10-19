import React, { useMemo } from 'react';

interface Particle {
  id: number;
  x: number; // percentage or offset
  y: number;
  dx: number; // horizontal drift px
  dy: number; // vertical drop px
  rotation: number;
  color: string;
  size: number;
  shape: 'rect' | 'circle' | 'strip';
  delay: number;
  duration: number;
}

interface CelebrationConfettiProps {
  colors?: string[];
}

const DEFAULT_CONFETTI_COLORS = [
  '#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#9b59b6', '#e056fd', '#ff6b81', '#f1c40f'
];

export const CelebrationConfetti: React.FC<CelebrationConfettiProps> = ({ colors }) => {
  const palette = colors && colors.length > 0 ? colors : DEFAULT_CONFETTI_COLORS;

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 36 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 36 + (Math.random() - 0.5) * 0.5;
      const distance = 40 + Math.random() * 120;
      const shapeType: 'rect' | 'circle' | 'strip' =
        i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'strip' : 'rect';

      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance * 0.7 - 20,
        dx: (Math.random() - 0.5) * 50,
        dy: 60 + Math.random() * 80,
        rotation: Math.floor(Math.random() * 360),
        color: palette[i % palette.length],
        size: 5 + Math.random() * 5,
        shape: shapeType,
        delay: Math.random() * 0.15,
        duration: 1.8 + Math.random() * 0.8,
      };
    });
  }, [palette]);

  return (
    <div className="celebration-confetti-root" aria-hidden="true">
      {particles.map((p) => {
        const isCircle = p.shape === 'circle';
        const isStrip = p.shape === 'strip';
        return (
          <span
            key={p.id}
            className="celebration-particle"
            style={
              {
                '--x': `${p.x}px`,
                '--y': `${p.y}px`,
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                '--rot': `${p.rotation}deg`,
                '--color': p.color,
                '--size': `${p.size}px`,
                '--delay': `${p.delay}s`,
                '--duration': `${p.duration}s`,
                width: isStrip ? `${p.size * 0.4}px` : `${p.size}px`,
                height: isStrip ? `${p.size * 1.8}px` : `${p.size}px`,
                borderRadius: isCircle ? '50%' : isStrip ? '2px' : '3px',
                backgroundColor: p.color,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
};
