import React, { useMemo } from 'react';

interface Particle {
  id: number;
  left: number; // percentage 0-100%
  size: number; // px
  color: string;
  delay: number; // seconds
  duration: number; // seconds
  rotation: number; // degrees
  shape: 'rect' | 'circle' | 'star' | 'ribbon';
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#fbbf24', // gold
];

export const CelebrationEffect: React.FC = () => {
  // Generate a deterministic or randomized list of confetti particles
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: 65 }, (_, i) => {
      const shapes: Array<'rect' | 'circle' | 'star' | 'ribbon'> = ['rect', 'circle', 'star', 'ribbon'];
      return {
        id: i,
        left: Math.random() * 96 + 2, // 2% to 98%
        size: Math.floor(Math.random() * 8) + 8, // 8px to 16px
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.6, // burst stagger
        duration: Math.random() * 2.2 + 2.5, // 2.5s to 4.7s
        rotation: Math.floor(Math.random() * 360),
        shape: shapes[i % shapes.length],
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-blue-500/10 via-amber-500/5 to-transparent animate-pulse" />

      {/* Floating Sparkle Stars */}
      <div className="absolute top-12 left-10 text-3xl animate-star-twinkle select-none">✨</div>
      <div className="absolute top-20 right-14 text-4xl animate-star-twinkle select-none" style={{ animationDelay: '0.4s' }}>🌟</div>
      <div className="absolute bottom-24 left-16 text-3xl animate-star-twinkle select-none" style={{ animationDelay: '0.8s' }}>🎉</div>
      <div className="absolute bottom-32 right-20 text-3xl animate-star-twinkle select-none" style={{ animationDelay: '1.2s' }}>⭐</div>

      {/* Confetti Rain */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 pointer-events-none"
          style={{
            left: `${p.left}%`,
            animation: `confettiFall ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s infinite`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {p.shape === 'rect' && (
            <div
              className="rounded-xs shadow-xs"
              style={{
                width: `${p.size}px`,
                height: `${p.size * 0.6}px`,
                backgroundColor: p.color,
              }}
            />
          )}

          {p.shape === 'circle' && (
            <div
              className="rounded-full shadow-xs"
              style={{
                width: `${p.size * 0.8}px`,
                height: `${p.size * 0.8}px`,
                backgroundColor: p.color,
              }}
            />
          )}

          {p.shape === 'ribbon' && (
            <div
              className="rounded-full shadow-xs"
              style={{
                width: `${p.size * 1.5}px`,
                height: '4px',
                backgroundColor: p.color,
                transform: 'skewX(-20deg)',
              }}
            />
          )}

          {p.shape === 'star' && (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-xs"
            >
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};
