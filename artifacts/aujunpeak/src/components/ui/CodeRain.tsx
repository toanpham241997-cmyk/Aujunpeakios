import React, { useEffect, useRef } from 'react';

interface CodeRainProps {
  color?: string;
  opacity?: number;
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [255, 23, 68];
}

export function CodeRain({ color = '#FF1744', opacity = 0.18, className = '' }: CodeRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const CHARS = 'FREEFIREＦＲＥＥ0123456789ABCDEFX╔╗╚╝║═▓▒░AUJUNPEAKBOOST01';
    const FONT_SIZE = 13;
    const [r, g, b] = hexToRgb(color);

    let cols = Math.floor(canvas.width / FONT_SIZE);
    let drops: number[] = Array.from({ length: cols }, () => -(Math.random() * 30));

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;

      cols = Math.floor(canvas.width / FONT_SIZE);
      if (drops.length !== cols) drops = Array.from({ length: cols }, () => -(Math.random() * 30));

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * FONT_SIZE;
        if (y < 0) { drops[i] += 0.5; continue; }

        // Leading bright char (white-ish)
        ctx.fillStyle = `rgba(255,255,255,${opacity * 3})`;
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FONT_SIZE, y);

        // Trail chars in color
        const trailLen = 5 + Math.floor(Math.random() * 8);
        for (let j = 1; j < trailLen; j++) {
          const fade = 1 - j / trailLen;
          ctx.fillStyle = `rgba(${r},${g},${b},${opacity * fade * 1.8})`;
          ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FONT_SIZE, y - j * FONT_SIZE);
        }

        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.45;
      }
    };

    const id = setInterval(draw, 48);
    return () => { clearInterval(id); window.removeEventListener('resize', resize); };
  }, [color, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
}
