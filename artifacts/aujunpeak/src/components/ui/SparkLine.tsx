import React, { useEffect, useRef, useState } from 'react';

interface SparkLineProps {
  color: string;
  baseValue: number;
}

export function SparkLine({ color, baseValue }: SparkLineProps) {
  const [points, setPoints] = useState<number[]>(() =>
    Array.from({ length: 20 }, () => baseValue + (Math.random() * 24 - 12))
  );

  useEffect(() => {
    const t = setInterval(() => {
      setPoints(prev => {
        const next = [...prev.slice(1), baseValue + (Math.random() * 24 - 12)];
        return next;
      });
    }, 600);
    return () => clearInterval(t);
  }, [baseValue]);

  const min = Math.min(...points) - 4;
  const max = Math.max(...points) + 4;
  const range = max - min || 1;
  const w = 200;
  const h = 50;

  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  const pathD = `M${pts.join(' L')}`;
  const fillD = `M0,${h} L${pts.join(' L')} L${w},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#spark-fill-${color.replace('#','')})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
}
