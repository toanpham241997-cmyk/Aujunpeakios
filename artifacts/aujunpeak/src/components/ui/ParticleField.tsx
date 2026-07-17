import React from 'react';

interface ParticleFieldProps {
  color: string;
  count?: number;
  className?: string;
}

export function ParticleField({ color, count = 8, className = '' }: ParticleFieldProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: count }).map((_, i) => {
        const left = `${(i * (97 / count) + 2) % 97}%`;
        const bottom = `${(i * 13 + 4) % 30}%`;
        const size = 1.5 + (i % 3) * 0.8;
        const dur = 4 + (i % 4) * 1.2;
        const delay = (i * 0.55) % 4.5;
        const animIdx = (i % 3) + 1;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left,
              bottom,
              width: `${size}px`,
              height: `${size}px`,
              background: color,
              boxShadow: `0 0 ${size * 4}px ${color}`,
              opacity: 0,
              animation: `float-particle-${animIdx} ${dur}s infinite linear ${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
