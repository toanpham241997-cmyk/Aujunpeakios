import React from 'react';

interface WaveBarProps {
  percentage: number;
  color: string;
}

export function WaveBar({ percentage, color }: WaveBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ background: `${color}18` }}>
      {/* Track ticks */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px"
          style={{ left: `${(i + 1) * 9}%`, background: 'rgba(255,255,255,0.06)' }}
        />
      ))}
      {/* Fill */}
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${clamped}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 8px ${color}`,
          transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      {/* Shimmer on fill */}
      <div
        className="absolute inset-y-0 left-0 rounded-full pointer-events-none shimmer-bg"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
