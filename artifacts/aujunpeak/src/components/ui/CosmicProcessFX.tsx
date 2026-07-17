import React, { useEffect, useRef } from 'react';

/**
 * CosmicProcessFX — a full-screen canvas FX system used behind processing
 * overlays (Apply Settings, FF Optimizer, Boost). Reacts to a `phase` prop:
 *
 *  - 'idle'    ambient starfield + slow drifting cosmic dust
 *  - 'warp'    hyperspace acceleration — streaks fly outward from the center,
 *              speeding up over time (like jumping into warp/hyperdrive)
 *  - 'vacuum'  a "black hole" cleanup vortex — particles get pulled inward
 *              from the edges, spiraling into the center and vanishing in a
 *              small flash (represents junk/cache being sucked away)
 *  - 'success' a bright radial burst + expanding rings when the operation
 *              completes
 */

export type CosmicPhase = 'idle' | 'warp' | 'vacuum' | 'success';

interface FXParticle {
  kind: 'warp' | 'vacuum' | 'burst' | 'ambient';
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  angle: number;
  radius: number;
  age: number;
  maxLife: number;
  size: number;
  color: string;
  spin: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(m[1]!, 16);
  const g = parseInt(m[2]!, 16);
  const b = parseInt(m[3]!, 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function CosmicProcessFX({
  phase,
  color = '#FF1744',
  secondaryColor = '#00E5FF',
  className = '',
}: {
  phase: CosmicPhase;
  color?: string;
  secondaryColor?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<CosmicPhase>(phase);
  const burstDoneRef = useRef(false);
  const successStartRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase !== 'success') burstDoneRef.current = false;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let heightPx = 0;

    const resize = () => {
      width = canvas.offsetWidth;
      heightPx = canvas.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(heightPx * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: FXParticle[] = [];
    const MAX_PARTICLES = 340;

    const spawn = (p: FXParticle) => {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      particles.push(p);
    };

    // Background stars (always present, subtle)
    const STAR_COUNT = 60;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));

    let raf = 0;
    let last = performance.now();
    const start = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - start) / 1000;
      const ph = phaseRef.current;

      const cx = width / 2;
      const cy = heightPx / 2;
      const maxR = Math.max(width, heightPx) * 0.75;

      ctx.fillStyle = 'rgba(2,1,4,1)';
      ctx.fillRect(0, 0, width, heightPx);

      // deep nebula wash
      const neb = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      neb.addColorStop(0, hexToRgba(color, ph === 'vacuum' ? 0.14 : 0.08));
      neb.addColorStop(0.5, hexToRgba(secondaryColor, 0.05));
      neb.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, width, heightPx);

      // ambient stars
      for (const s of stars) {
        const alpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(s.x * width, s.y * heightPx, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── Spawn per phase ── */
      if (ph === 'warp') {
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          spawn({
            kind: 'warp',
            x: cx, y: cy, prevX: cx, prevY: cy,
            angle, radius: 2, age: 0, maxLife: 2.2,
            size: 1 + Math.random() * 1.6,
            color: Math.random() > 0.5 ? color : secondaryColor,
            spin: 0,
          });
        }
      } else if (ph === 'vacuum') {
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = maxR * (0.55 + Math.random() * 0.5);
          spawn({
            kind: 'vacuum',
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
            prevX: 0, prevY: 0,
            angle, radius, age: 0, maxLife: 6,
            size: 2 + Math.random() * 3,
            color: [color, secondaryColor, '#a855f7', '#facc15'][Math.floor(Math.random() * 4)]!,
            spin: (Math.random() > 0.5 ? 1 : -1) * (1.4 + Math.random() * 1.6),
          });
        }
      } else if (ph === 'success' && !burstDoneRef.current) {
        burstDoneRef.current = true;
        successStartRef.current = t;
        for (let i = 0; i < 90; i++) {
          const angle = Math.random() * Math.PI * 2;
          spawn({
            kind: 'burst',
            x: cx, y: cy, prevX: cx, prevY: cy,
            angle, radius: 0, age: 0, maxLife: 0.9 + Math.random() * 0.6,
            size: 1.5 + Math.random() * 3,
            color: Math.random() > 0.5 ? color : secondaryColor,
            spin: 120 + Math.random() * 260,
          });
        }
      } else if (ph === 'idle') {
        if (Math.random() < 0.4) {
          spawn({
            kind: 'ambient',
            x: Math.random() * width, y: heightPx + 4, prevX: 0, prevY: 0,
            angle: -Math.PI / 2, radius: 0, age: 0, maxLife: 6 + Math.random() * 3,
            size: 1 + Math.random() * 1.6,
            color: Math.random() > 0.6 ? secondaryColor : color,
            spin: 8 + Math.random() * 14,
          });
        }
      }

      /* ── Update + draw ── */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.age += dt;
        const lifeT = p.age / p.maxLife;
        if (lifeT >= 1) { particles.splice(i, 1); continue; }

        if (p.kind === 'warp') {
          const speed = 40 + p.age * p.age * 620;
          p.prevX = p.x;
          p.prevY = p.y;
          p.radius += speed * dt;
          p.x = cx + Math.cos(p.angle) * p.radius;
          p.y = cy + Math.sin(p.angle) * p.radius;
          if (p.radius > maxR * 1.15) { particles.splice(i, 1); continue; }
          const alpha = Math.min(1, p.age * 6) * (1 - lifeT);
          ctx.beginPath();
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = hexToRgba(p.color, alpha);
          ctx.lineWidth = p.size;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (p.kind === 'vacuum') {
          const pull = 1 + (1 - p.radius / maxR) * 5;
          p.radius -= (60 + pull * 90) * dt;
          p.angle += p.spin * dt * (0.6 + (1 - p.radius / maxR) * 1.8);
          if (p.radius <= 3) {
            // consumption flash
            spawn({
              kind: 'burst', x: cx, y: cy, prevX: cx, prevY: cy,
              angle: Math.random() * Math.PI * 2, radius: 0, age: 0,
              maxLife: 0.25, size: 1.5, color: p.color, spin: 30 + Math.random() * 40,
            });
            particles.splice(i, 1);
            continue;
          }
          p.x = cx + Math.cos(p.angle) * p.radius;
          p.y = cy + Math.sin(p.angle) * p.radius;
          const shrink = Math.max(0.15, p.radius / maxR);
          const alpha = 0.85 * (1 - lifeT * 0.4);
          ctx.beginPath();
          ctx.fillStyle = hexToRgba(p.color, alpha);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.arc(p.x, p.y, p.size * shrink, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (p.kind === 'burst') {
          const speed = p.spin * (1 - lifeT * 0.5);
          p.x += Math.cos(p.angle) * speed * dt;
          p.y += Math.sin(p.angle) * speed * dt;
          const alpha = 1 - lifeT;
          ctx.beginPath();
          ctx.fillStyle = hexToRgba(p.color, alpha);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.arc(p.x, p.y, p.size * (1 - lifeT * 0.4), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // ambient drift upward
          p.y -= p.spin * dt;
          p.x += Math.sin(t * 0.6 + p.age) * 4 * dt;
          const alpha = Math.sin(lifeT * Math.PI) * 0.6;
          ctx.beginPath();
          ctx.fillStyle = hexToRgba(p.color, alpha);
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* ── Central portal / hub glow ── */
      const pulse = ph === 'vacuum'
        ? 0.6 + 0.4 * Math.sin(t * 6)
        : ph === 'success'
        ? Math.min(1, 0.5 + Math.max(0, t - successStartRef.current) * 2)
        : 0.5 + 0.5 * Math.sin(t * 1.6);
      const hubR = Math.min(width, heightPx) * (ph === 'vacuum' ? 0.07 : 0.1) * (ph === 'success' ? 1.4 : 1);
      const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubR * 3);
      hubGrad.addColorStop(0, hexToRgba(color, 0.5 * pulse + 0.2));
      hubGrad.addColorStop(0.4, hexToRgba(secondaryColor, 0.18 * pulse));
      hubGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hubGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, hubR * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba('#ffffff', 0.5 + 0.3 * pulse);
      ctx.lineWidth = 1.4;
      ctx.stroke();

      /* success expanding rings */
      if (ph === 'success') {
        const age = Math.max(0, t - successStartRef.current);
        for (let r = 0; r < 3; r++) {
          const ringAge = age - r * 0.18;
          if (ringAge < 0 || ringAge > 1.4) continue;
          const ringT = ringAge / 1.4;
          const ringR = hubR + ringT * maxR * 0.9;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(r % 2 === 0 ? color : secondaryColor, (1 - ringT) * 0.55);
          ctx.lineWidth = 2.2 * (1 - ringT * 0.6);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [color, secondaryColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
