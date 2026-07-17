import React, { useEffect, useRef } from 'react';

/**
 * GalaxyNetwork — a canvas-rendered cosmic globe visualization.
 *
 * Layers (back to front):
 *  1. Deep-space nebula glow blobs (slow drifting radial gradients)
 *  2. Twinkling starfield with parallax + occasional shooting stars
 *  3. Drifting cosmic dust / ember particles (velocity-based, realistic)
 *  4. A shaded, rotating spherical "Earth" globe with latitude/longitude grid,
 *     glowing data-hub points, and a soft atmosphere rim
 *  5. Tilted satellite orbit rings around the globe, with moving nodes and
 *     pulses that travel back to the central "internet" hub
 */

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hue: string;
}

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  phase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface HubPoint {
  lat: number; // -PI/2 .. PI/2
  lon: number; // 0 .. 2PI
  color: string;
}

interface OrbitDef {
  radiusMul: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  color: string;
  satellites: number;
  phase: number;
}

function rotatePoint(p: Vec3, rotY: number, tiltX: number): Vec3 {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = p.x * cosY + p.z * sinY;
  const z1 = -p.x * sinY + p.z * cosY;
  const y1 = p.y;

  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
}

function rotateAroundZ(p: Vec3, ang: number): Vec3 {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
}

function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(m[1]!, 16);
  const g = parseInt(m[2]!, 16);
  const b = parseInt(m[3]!, 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const HUB_POINTS: HubPoint[] = [
  { lat: 0.55, lon: 0.3, color: '#22c55e' },
  { lat: -0.2, lon: 1.4, color: '#00E5FF' },
  { lat: 0.15, lon: 2.6, color: '#FF1744' },
  { lat: 0.7, lon: 3.6, color: '#facc15' },
  { lat: -0.5, lon: 4.4, color: '#00E5FF' },
  { lat: 0.05, lon: 5.4, color: '#22c55e' },
  { lat: -0.65, lon: 2.1, color: '#a855f7' },
];

const ORBITS: OrbitDef[] = [
  { radiusMul: 1.42, tiltX: 0.35, tiltZ: 0.15, speed: 0.5, color: '#00E5FF', satellites: 2, phase: 0 },
  { radiusMul: 1.72, tiltX: -0.5, tiltZ: 0.6, speed: -0.32, color: '#FF1744', satellites: 1, phase: 0.4 },
];

export function GalaxyNetwork({ className = '', height = 240 }: { className?: string; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    /* ── Starfield ── */
    const STAR_COUNT = 80;
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.3,
      baseAlpha: 0.25 + Math.random() * 0.6,
      twinkleSpeed: 0.6 + Math.random() * 1.8,
      twinklePhase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.82 ? '#00E5FF' : Math.random() > 0.6 ? '#FF1744' : '#ffffff',
    }));

    /* ── Cosmic dust / embers ── */
    const DUST_COUNT = 24;
    const dustPalette = ['#FF1744', '#00E5FF', '#a855f7', '#facc15'];
    const dust: Dust[] = Array.from({ length: DUST_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00012,
      vy: -0.00006 - Math.random() * 0.00012,
      r: 0.8 + Math.random() * 1.8,
      color: dustPalette[Math.floor(Math.random() * dustPalette.length)]!,
      phase: Math.random() * Math.PI * 2,
    }));

    let shootingStar: ShootingStar | null = null;
    let nextShootAt = performance.now() + 1500 + Math.random() * 3500;

    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, heightPx);

      const cx = width / 2;
      const cy = heightPx / 2 + 4;

      /* Nebula glow blobs */
      const blob = (ox: number, oy: number, r: number, color: string, alpha: number) => {
        const bx = cx + Math.cos(t * 0.05 + ox) * width * 0.18;
        const by = cy + Math.sin(t * 0.04 + oy) * heightPx * 0.22;
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0, hexToRgba(color, alpha));
        g.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, heightPx);
      };
      blob(0, 2, Math.max(width, heightPx) * 0.55, '#FF1744', 0.09);
      blob(3, 1, Math.max(width, heightPx) * 0.5, '#00E5FF', 0.08);
      blob(5, 4, Math.max(width, heightPx) * 0.4, '#a855f7', 0.06);

      /* Stars */
      for (const s of stars) {
        const alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinklePhase));
        ctx.beginPath();
        ctx.fillStyle = hexToRgba(s.hue, Math.max(0, alpha));
        ctx.arc(s.x * width, s.y * heightPx, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Shooting star */
      if (!shootingStar && now > nextShootAt) {
        const fromLeft = Math.random() > 0.5;
        shootingStar = {
          x: fromLeft ? -0.05 * width : width * 1.05,
          y: Math.random() * heightPx * 0.35,
          vx: (fromLeft ? 1 : -1) * (280 + Math.random() * 120),
          vy: 90 + Math.random() * 60,
          life: 0,
          maxLife: 0.7,
        };
      }
      if (shootingStar) {
        shootingStar.life += 1 / 60;
        shootingStar.x += shootingStar.vx / 60;
        shootingStar.y += shootingStar.vy / 60;
        const p = shootingStar.life / shootingStar.maxLife;
        if (p >= 1) {
          shootingStar = null;
          nextShootAt = now + 3000 + Math.random() * 5000;
        } else {
          const alpha = 1 - p;
          const tailX = shootingStar.x - shootingStar.vx * 0.04;
          const tailY = shootingStar.y - shootingStar.vy * 0.04;
          const grad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
          grad.addColorStop(0, 'rgba(255,255,255,0)');
          grad.addColorStop(1, `rgba(255,255,255,${alpha})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(shootingStar.x, shootingStar.y);
          ctx.stroke();
        }
      }

      /* Dust / embers drifting */
      for (const d of dust) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.y < -0.05) d.y = 1.05;
        if (d.x < -0.05) d.x = 1.05;
        if (d.x > 1.05) d.x = -0.05;
        const flicker = 0.5 + 0.5 * Math.sin(t * 1.4 + d.phase);
        const px = d.x * width;
        const py = d.y * heightPx;
        ctx.beginPath();
        ctx.fillStyle = hexToRgba(d.color, 0.3 * flicker);
        ctx.arc(px, py, d.r * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = hexToRgba(d.color, 0.85 * flicker);
        ctx.arc(px, py, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ═══ The globe ═══ */
      const R = Math.min(width, heightPx) * 0.30;
      const rotY = t * 0.28;
      const tiltX = 0.42;
      const focal = R * 3.4;

      /* Outer atmosphere glow */
      const atmo = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.55);
      atmo.addColorStop(0, 'rgba(0,229,255,0.22)');
      atmo.addColorStop(0.6, 'rgba(0,229,255,0.08)');
      atmo.addColorStop(1, 'rgba(0,229,255,0)');
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.55, 0, Math.PI * 2);
      ctx.fill();

      /* Lit sphere body (fake day/night shading) */
      const lightX = cx - R * 0.42;
      const lightY = cy - R * 0.48;
      const sphereGrad = ctx.createRadialGradient(lightX, lightY, R * 0.05, cx, cy, R * 1.05);
      sphereGrad.addColorStop(0, '#bdf3ff');
      sphereGrad.addColorStop(0.18, '#4fd7f2');
      sphereGrad.addColorStop(0.4, '#0ea9d6');
      sphereGrad.addColorStop(0.68, '#0a4f7a');
      sphereGrad.addColorStop(0.9, '#051c33');
      sphereGrad.addColorStop(1, '#01060f');
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = sphereGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      /* Data-hub glow points on the sphere surface (clipped to circle) */
      for (const hp of HUB_POINTS) {
        const raw: Vec3 = { x: Math.cos(hp.lat) * Math.cos(hp.lon), y: Math.sin(hp.lat), z: Math.cos(hp.lat) * Math.sin(hp.lon) };
        const rotated = rotatePoint({ x: raw.x * R, y: raw.y * R, z: raw.z * R }, rotY, tiltX);
        const scale = focal / (focal + rotated.z);
        const sx = cx + rotated.x * scale;
        const sy = cy + rotated.y * scale;
        const front = (rotated.z + R) / (2 * R); // 0 back .. 1 front
        if (front < 0.42) continue;
        const glowAlpha = Math.min(1, (front - 0.42) / 0.3) * 0.9;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 0.14);
        g.addColorStop(0, hexToRgba(hp.color, glowAlpha));
        g.addColorStop(1, hexToRgba(hp.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, R * 0.14, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = hexToRgba('#ffffff', glowAlpha);
        ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Latitude/longitude grid — only visible on the front hemisphere */
      const drawGridLine = (points: Vec3[], color: string, width_: number) => {
        let drawing = false;
        for (let i = 0; i <= points.length; i++) {
          const raw = points[i % points.length]!;
          const rotated = rotatePoint({ x: raw.x * R, y: raw.y * R, z: raw.z * R }, rotY, tiltX);
          const front = rotated.z > -R * 0.02;
          const scale = focal / (focal + rotated.z);
          const sx = cx + rotated.x * scale;
          const sy = cy + rotated.y * scale;
          if (front) {
            if (!drawing) {
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              drawing = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else if (drawing) {
            ctx.strokeStyle = color;
            ctx.lineWidth = width_;
            ctx.stroke();
            drawing = false;
          }
        }
        if (drawing) {
          ctx.strokeStyle = color;
          ctx.lineWidth = width_;
          ctx.stroke();
        }
      };

      const SEGMENTS = 48;
      // Longitude meridians
      for (let m = 0; m < 6; m++) {
        const lon = (m / 6) * Math.PI * 2;
        const pts: Vec3[] = [];
        for (let i = 0; i <= SEGMENTS; i++) {
          const phi = (i / SEGMENTS) * Math.PI * 2;
          pts.push({ x: Math.sin(phi) * Math.cos(lon), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(lon) });
        }
        drawGridLine(pts, 'rgba(180,240,255,0.16)', 0.8);
      }
      // Latitude rings
      for (let l = 1; l < 5; l++) {
        const lat = (l / 5) * Math.PI - Math.PI / 2;
        const pts: Vec3[] = [];
        for (let i = 0; i <= SEGMENTS; i++) {
          const theta = (i / SEGMENTS) * Math.PI * 2;
          pts.push({ x: Math.cos(lat) * Math.cos(theta), y: Math.sin(lat), z: Math.cos(lat) * Math.sin(theta) });
        }
        drawGridLine(pts, 'rgba(180,240,255,0.13)', 0.7);
      }
      ctx.restore();

      /* Crisp rim edge */
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(160,235,255,0.55)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R + 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,229,255,0.18)';
      ctx.lineWidth = 3;
      ctx.stroke();

      /* Satellite orbit rings + moving nodes */
      for (const orbit of ORBITS) {
        const orbR = R * orbit.radiusMul;
        const pathPts: { x: number; y: number; z: number }[] = [];
        for (let i = 0; i <= 72; i++) {
          const ang = (i / 72) * Math.PI * 2;
          let p: Vec3 = { x: Math.cos(ang) * orbR, y: 0, z: Math.sin(ang) * orbR };
          p = rotateAroundZ(p, orbit.tiltZ);
          p = rotatePoint(p, 0, orbit.tiltX);
          const rotated = rotatePoint(p, rotY * 0.6, tiltX);
          const scale = focal / (focal + rotated.z);
          pathPts.push({ x: cx + rotated.x * scale, y: cy + rotated.y * scale, z: rotated.z });
        }
        ctx.beginPath();
        for (let i = 0; i < pathPts.length; i++) {
          const pt = pathPts[i]!;
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = hexToRgba(orbit.color, 0.28);
        ctx.lineWidth = 1;
        ctx.stroke();

        for (let s = 0; s < orbit.satellites; s++) {
          const satT = ((t * orbit.speed) / (Math.PI * 2) + orbit.phase + s / orbit.satellites) % 1;
          const ang = satT * Math.PI * 2;
          let p: Vec3 = { x: Math.cos(ang) * orbR, y: 0, z: Math.sin(ang) * orbR };
          p = rotateAroundZ(p, orbit.tiltZ);
          p = rotatePoint(p, 0, orbit.tiltX);
          const rotated = rotatePoint(p, rotY * 0.6, tiltX);
          const scale = focal / (focal + rotated.z);
          const sx = cx + rotated.x * scale;
          const sy = cy + rotated.y * scale;
          const front = (rotated.z + orbR) / (2 * orbR);

          // data spoke back to the hub, with a traveling pulse
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = hexToRgba(orbit.color, 0.1 + 0.18 * front);
          ctx.setLineDash([3, 4]);
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.setLineDash([]);

          const pulseT = (t * 0.7 + s * 0.5) % 1;
          const px = cx + (sx - cx) * pulseT;
          const py = cy + (sy - cy) * pulseT;
          ctx.beginPath();
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.shadowColor = orbit.color;
          ctx.shadowBlur = 8;
          ctx.arc(px, py, 1.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // satellite node
          const size = 2.6 + 1.6 * front;
          ctx.beginPath();
          ctx.fillStyle = hexToRgba(orbit.color, 0.3);
          ctx.arc(sx, sy, size * 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = hexToRgba(orbit.color, 0.95);
          ctx.shadowColor = orbit.color;
          ctx.shadowBlur = 10;
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full pointer-events-none ${className}`}
      style={{ height }}
    />
  );
}
