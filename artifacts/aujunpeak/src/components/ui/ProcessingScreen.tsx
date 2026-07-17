/**
 * ProcessingScreen — Full-tab processing UI
 * Visual: Galaxy + Diamond nodes + Earth connected wires
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap, Settings } from 'lucide-react';

export interface ProcessStep {
  icon: React.ReactNode;
  label: string;
  color: string;
}

export interface LaunchAction {
  logoUrl: string;
  appName: string;
  deepLink: string;
}

interface ProcessingScreenProps {
  title: string;
  subtitle?: string;
  steps: ProcessStep[];
  accentColor?: string;
  secondaryColor?: string;
  onClose: () => void;
  autoStart?: boolean;
  /** If provided, success shows a branded "Open App" button instead of the generic Done button */
  launchAction?: LaunchAction;
}

/* ══════════════════════════════════════════════
   GALAXY + DIAMOND + EARTH CANVAS
══════════════════════════════════════════════ */
function GalaxyCanvas({
  phase, accentColor, secondaryColor,
}: { phase: 'idle' | 'running' | 'success'; accentColor: string; secondaryColor: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;

    const resize = () => {
      cv.width  = cv.offsetWidth  * devicePixelRatio;
      cv.height = cv.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => cv.offsetWidth;
    const H = () => cv.offsetHeight;

    /* ── Stars ── */
    const STARS = Array.from({ length: 220 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 1.4,
      a: 0.1 + Math.random() * 0.8,
      twinkle: Math.random() * Math.PI * 2,
      ts: 0.008 + Math.random() * 0.022,
      color: Math.random() > 0.7 ? secondaryColor : Math.random() > 0.5 ? accentColor : '#ffffff',
    }));

    /* ── Diamond nodes ── */
    const DIAMONDS = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const orbit = 0.28 + Math.random() * 0.18;
      return {
        baseAngle: angle,
        orbit,
        orbitSpeed: (0.0004 + Math.random() * 0.0004) * (Math.random() > 0.5 ? 1 : -1),
        size: 6 + Math.random() * 10,
        color: i % 2 === 0 ? accentColor : secondaryColor,
        alpha: 0.55 + Math.random() * 0.45,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: 0.008 + Math.random() * 0.012,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      };
    });

    /* ── Earth nodes (circles with rings) ── */
    const EARTHS = Array.from({ length: 5 }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2 + 0.4;
      const orbit = 0.18 + Math.random() * 0.24;
      return {
        baseAngle: angle,
        orbit,
        orbitSpeed: (0.0003 + Math.random() * 0.0003) * (i % 2 === 0 ? 1 : -1),
        r: 5 + Math.random() * 8,
        color: i % 2 === 0 ? secondaryColor : accentColor,
        alpha: 0.5 + Math.random() * 0.4,
        ringRot: Math.random() * Math.PI * 2,
        ringSpeed: 0.01 + Math.random() * 0.015,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.025,
      };
    });

    /* ── Wire pulses (animated dots travelling connections) ── */
    const PULSES: { progress: number; speed: number; fromDiamond: number; toEarth: number; color: string }[] = [];
    const spawnPulse = () => {
      if (PULSES.length < 10) {
        PULSES.push({
          progress: 0,
          speed: 0.004 + Math.random() * 0.006,
          fromDiamond: Math.floor(Math.random() * DIAMONDS.length),
          toEarth: Math.floor(Math.random() * EARTHS.length),
          color: Math.random() > 0.5 ? accentColor : secondaryColor,
        });
      }
    };

    /* ── Nebula blobs ── */
    const NEBULAS = [
      { cx: 0.25, cy: 0.3,  rx: 0.22, ry: 0.18, color: accentColor,     alpha: 0.04 },
      { cx: 0.75, cy: 0.6,  rx: 0.28, ry: 0.20, color: secondaryColor,  alpha: 0.05 },
      { cx: 0.5,  cy: 0.75, rx: 0.35, ry: 0.22, color: '#a855f7',       alpha: 0.03 },
      { cx: 0.15, cy: 0.7,  rx: 0.18, ry: 0.15, color: secondaryColor,  alpha: 0.04 },
    ];

    const drawDiamond = (x: number, y: number, size: number, rot: number, color: string, alpha: number, glow: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      /* Outer glow */
      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.5);
      grd.addColorStop(0, color + Math.round(glow * 0.5 * 255).toString(16).padStart(2, '0'));
      grd.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(0, 0, size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
      /* Diamond shape */
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.6, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.6, 0);
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = color + '22';
      ctx.fill();
      /* Inner diamond */
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.45);
      ctx.lineTo(size * 0.28, 0);
      ctx.lineTo(0, size * 0.45);
      ctx.lineTo(-size * 0.28, 0);
      ctx.closePath();
      ctx.fillStyle = color + '55';
      ctx.fill();
      ctx.restore();
    };

    const drawEarth = (x: number, y: number, r: number, ringRot: number, color: string, alpha: number, glow: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      /* Glow */
      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3.5);
      grd.addColorStop(0, color + Math.round(glow * 0.55 * 255).toString(16).padStart(2, '0'));
      grd.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(0, 0, r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
      /* Circle */
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = color + '18'; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.stroke();
      /* Equator ring (tilted ellipse) */
      ctx.save();
      ctx.rotate(ringRot);
      ctx.scale(1, 0.38);
      ctx.beginPath(); ctx.arc(0, 0, r * 1.55, 0, Math.PI * 2);
      ctx.strokeStyle = color + '70'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      /* Polar dot */
      ctx.beginPath(); ctx.arc(0, -r * 0.5, r * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = color + 'bb'; ctx.fill();
      ctx.restore();
    };

    const getNodePos = (node: any, w: number, h: number, t: number) => {
      const angle = node.baseAngle + node.orbitSpeed * t;
      const cx = w * 0.5, cy = h * 0.42;
      const rx = w * node.orbit * 1.1, ry = h * node.orbit * 0.7;
      return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
    };

    let lastPulse = 0;
    const draw = () => {
      tick.current++;
      const t = tick.current;
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      const isRunning = phase === 'running';
      const isSuccess = phase === 'success';
      const speedMul = isRunning ? 2.2 : isSuccess ? 1.5 : 1;

      /* ── Deep space gradient ── */
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, 'rgba(2,2,8,0)');
      bg.addColorStop(0.5, 'rgba(4,2,12,0)');
      bg.addColorStop(1, 'rgba(2,4,10,0)');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      /* ── Nebula ── */
      NEBULAS.forEach(n => {
        const nebX = w * n.cx, nebY = h * n.cy;
        const nebRX = w * n.rx, nebRY = h * n.ry;
        const g = ctx.createRadialGradient(nebX, nebY, 0, nebX, nebY, Math.max(nebRX, nebRY));
        const alpha = n.alpha * (isRunning ? 1.6 : 1);
        g.addColorStop(0, n.color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
        g.addColorStop(0.6, n.color + Math.round(alpha * 0.3 * 255).toString(16).padStart(2, '0'));
        g.addColorStop(1, 'transparent');
        ctx.save(); ctx.scale(nebRX / Math.max(nebRX, nebRY), nebRY / Math.max(nebRX, nebRY));
        const scaleX = Math.max(nebRX, nebRY) / nebRX;
        const scaleY = Math.max(nebRX, nebRY) / nebRY;
        ctx.restore();
        ctx.save();
        ctx.translate(nebX, nebY); ctx.scale(nebRX / 100, nebRY / 100);
        ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.restore();
      });

      /* ── Stars ── */
      STARS.forEach(s => {
        s.twinkle += s.ts * speedMul;
        const a = Math.max(0, s.a * (0.5 + 0.5 * Math.sin(s.twinkle)));
        ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color + Math.round(a * 255).toString(16).padStart(2, '0');
        ctx.fill();
        if (s.r > 1) {
          const sg = ctx.createRadialGradient(s.x * w, s.y * h, 0, s.x * w, s.y * h, s.r * 3.5);
          sg.addColorStop(0, s.color + Math.round(a * 0.4 * 255).toString(16).padStart(2, '0'));
          sg.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = sg; ctx.fill();
        }
      });

      /* ── Update nodes ── */
      DIAMONDS.forEach(d => { d.rot += d.rotSpeed * speedMul; d.pulse += d.pulseSpeed * speedMul; });
      EARTHS.forEach(e => { e.ringRot += e.ringSpeed * speedMul; e.pulse += e.pulseSpeed * speedMul; });

      /* safe hex-alpha helper — prevents NaN/Infinity color strings */
      const h2 = (v: number) => Math.max(0, Math.min(255, Math.round(isFinite(v) ? v : 0))).toString(16).padStart(2, '0');

      /* ── Wires between diamonds and earths ── */
      DIAMONDS.forEach((d, di) => {
        const dp = getNodePos(d, w, h, t * speedMul);
        EARTHS.forEach((e, ei) => {
          if ((di + ei) % 3 !== 0) return;
          const ep = getNodePos(e, w, h, t * speedMul);
          const dist = Math.hypot(dp.x - ep.x, dp.y - ep.y);
          const maxDist = Math.max(w, h) * 0.55;
          if (dist > maxDist || maxDist === 0 || !isFinite(dist)) return;
          if (Math.abs(dp.x - ep.x) < 0.5 && Math.abs(dp.y - ep.y) < 0.5) return;
          const wireAlpha = (1 - dist / maxDist) * 0.22 * (isRunning ? 1.8 : 1);
          const wg = ctx.createLinearGradient(dp.x, dp.y, ep.x, ep.y);
          wg.addColorStop(0,   d.color        + h2(wireAlpha * 255));
          wg.addColorStop(0.5, secondaryColor + h2(wireAlpha * 0.6 * 255));
          wg.addColorStop(1,   e.color        + h2(wireAlpha * 255));
          ctx.beginPath(); ctx.moveTo(dp.x, dp.y); ctx.lineTo(ep.x, ep.y);
          ctx.strokeStyle = wg; ctx.lineWidth = 0.7; ctx.stroke();
        });
      });

      /* ── Diamond–Diamond wires ── */
      for (let i = 0; i < DIAMONDS.length; i++) {
        for (let j = i + 1; j < DIAMONDS.length; j++) {
          if ((i + j) % 2 !== 0) continue;
          const a = getNodePos(DIAMONDS[i], w, h, t * speedMul);
          const b = getNodePos(DIAMONDS[j], w, h, t * speedMul);
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          const limit = w * 0.4;
          if (dist > limit || limit === 0 || !isFinite(dist)) continue;
          const wa = (1 - dist / limit) * 0.15 * (isRunning ? 1.6 : 1);
          if (!isFinite(wa)) continue;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = accentColor + h2(wa * 255);
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }

      /* ── Wire pulses ── */
      if (isRunning && t - lastPulse > 40) { spawnPulse(); lastPulse = t; }
      for (let i = PULSES.length - 1; i >= 0; i--) {
        const p = PULSES[i];
        p.progress += p.speed * speedMul;
        if (p.progress >= 1) { PULSES.splice(i, 1); continue; }
        const from = getNodePos(DIAMONDS[p.fromDiamond], w, h, t * speedMul);
        const to   = getNodePos(EARTHS[p.toEarth],       w, h, t * speedMul);
        const px = from.x + (to.x - from.x) * p.progress;
        const py = from.y + (to.y - from.y) * p.progress;
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 8);
        pg.addColorStop(0, p.color + 'ee');
        pg.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = pg; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
      }

      /* ── Draw Earth nodes ── */
      EARTHS.forEach(e => {
        const { x, y } = getNodePos(e, w, h, t * speedMul);
        const glow = 0.5 + 0.5 * Math.sin(e.pulse);
        drawEarth(x, y, e.r * (isRunning ? 1.15 : 1), e.ringRot, e.color, e.alpha * (isRunning ? 1.2 : 1), glow);
      });

      /* ── Draw Diamond nodes ── */
      DIAMONDS.forEach(d => {
        const { x, y } = getNodePos(d, w, h, t * speedMul);
        const glow = 0.5 + 0.5 * Math.sin(d.pulse);
        drawDiamond(x, y, d.size * (isRunning ? 1.18 : 1), d.rot, d.color, d.alpha * (isRunning ? 1.25 : 1), glow);
      });

      /* ── Success burst ── */
      if (isSuccess && t < 180) {
        const burst = Math.min(1, (180 - t) / 180);
        const cx = w / 2, cy = h * 0.38;
        for (let i = 0; i < 3; i++) {
          const radius = (t % 90) * 1.4 + i * 50;
          const a = Math.max(0, (1 - radius / (w * 0.7)) * burst * 0.4);
          ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = (i % 2 === 0 ? accentColor : secondaryColor) + Math.round(a * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 2; ctx.stroke();
        }
      }

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize); };
  }, [phase, accentColor, secondaryColor]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ══════════════════════════════════════════════
   CENTRAL ENERGY CORE
══════════════════════════════════════════════ */
function EnergyCoreOrb({ phase, progress, accentColor, secondaryColor }: {
  phase: 'idle' | 'running' | 'success'; progress: number;
  accentColor: string; secondaryColor: string;
}) {
  const R = 58; const CIRC = 2 * Math.PI * R;
  const offset = CIRC - (CIRC * progress) / 100;
  const R2 = 44; const CIRC2 = 2 * Math.PI * R2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      {/* Outer pulse rings */}
      {[1, 1.45, 1.85].map((scale, i) => (
        <motion.div key={i}
          className="absolute rounded-full border pointer-events-none"
          style={{ width: 160 * scale, height: 160 * scale, borderColor: accentColor + '18' }}
          animate={phase !== 'idle' ? { scale: [1, 1.08, 1], opacity: [0.4, 0.9, 0.4] } : { opacity: 0.2 }}
          transition={{ duration: 2.2 + i * 0.6, repeat: Infinity, delay: i * 0.45 }}
        />
      ))}

      {/* SVG rings */}
      <svg className="absolute inset-0 -rotate-90" width="160" height="160" viewBox="0 0 160 160">
        {/* BG track */}
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        {/* Progress arc */}
        <motion.circle cx="80" cy="80" r={R} fill="none"
          stroke={accentColor} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={CIRC} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 10px ${accentColor})`, transition: 'stroke-dashoffset 0.35s ease' }}
        />
        {/* Inner ring (counter-rotating) */}
        <motion.circle cx="80" cy="80" r={R2} fill="none"
          stroke={secondaryColor} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={`${CIRC2 * 0.28} ${CIRC2 * 0.72}`}
          strokeDashoffset={offset * 0.55}
          style={{ opacity: 0.6, filter: `drop-shadow(0 0 5px ${secondaryColor})` }}
        />
        {/* Tick marks */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const isMajor = i % 4 === 0;
          return (
            <line key={i}
              x1={80 + (R - 4)  * Math.cos(a)} y1={80 + (R - 4)  * Math.sin(a)}
              x2={80 + (R + 2)  * Math.cos(a)} y2={80 + (R + 2)  * Math.sin(a)}
              stroke={isMajor ? accentColor + 'aa' : 'rgba(255,255,255,0.12)'}
              strokeWidth={isMajor ? 1.5 : 0.8}
            />
          );
        })}
      </svg>

      {/* Core glow */}
      <motion.div className="absolute rounded-full"
        style={{ width: 96, height: 96, background: `radial-gradient(circle, ${accentColor}28 0%, ${secondaryColor}10 50%, transparent 70%)` }}
        animate={phase !== 'idle'
          ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }
          : { scale: 1, opacity: 0.5 }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />

      {/* Icon button */}
      <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor}55)`, boxShadow: `0 0 32px ${accentColor}66, inset 0 1px 0 rgba(255,255,255,0.2)` }}>
        <AnimatePresence mode="wait">
          {phase === 'success'
            ? <motion.div key="ok" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
            : phase === 'running'
            ? <motion.div key="spin" animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}>
                <Settings className="w-8 h-8 text-white" />
              </motion.div>
            : <motion.div key="idle" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
          }
        </AnimatePresence>
      </div>

      {/* Progress % */}
      {phase === 'running' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute font-black text-[10px] tabular-nums"
          style={{ bottom: -24, color: accentColor, textShadow: `0 0 10px ${accentColor}` }}>
          {Math.round(progress)}%
        </motion.div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   HOLOGRAPHIC STEP PANEL
══════════════════════════════════════════════ */
function HoloPanel({ steps, currentStep, phase, accentColor, secondaryColor }: {
  steps: ProcessStep[]; currentStep: number;
  phase: 'idle' | 'running' | 'success'; accentColor: string; secondaryColor: string;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        border: `1px solid ${accentColor}28`,
        boxShadow: `0 0 40px ${accentColor}12, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}>
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}66, ${secondaryColor}44, transparent)` }} />
      {/* Scan animation */}
      {phase === 'running' && (
        <motion.div className="absolute left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)` }}
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }} />
      )}

      {/* Corner brackets */}
      {[['top-0 left-0', 'border-t border-l'], ['top-0 right-0', 'border-t border-r'],
        ['bottom-0 left-0', 'border-b border-l'], ['bottom-0 right-0', 'border-b border-r']].map(([pos, borders], i) => (
        <div key={i} className={`absolute w-4 h-4 ${pos} ${borders} m-2 rounded-sm`}
          style={{ borderColor: accentColor + '66' }} />
      ))}

      <div className="px-4 py-3 space-y-1.5">
        {steps.map((step, i) => {
          const done = phase === 'success' || i < currentStep;
          const active = phase === 'running' && i === currentStep;
          const icon = React.cloneElement(step.icon as React.ReactElement, { style: { width: 12, height: 12 } });

          return (
            <motion.div key={i}
              animate={{ opacity: (!done && !active) ? 0.28 : 1, scale: active ? 1.015 : 1 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl relative overflow-hidden"
              style={{
                background: active ? `${step.color}12` : done ? 'rgba(255,255,255,0.035)' : 'transparent',
                border: `1px solid ${active ? step.color + '35' : done ? 'rgba(255,255,255,0.07)' : 'transparent'}`,
              }}>
              {/* Active shimmer */}
              {active && (
                <motion.div className="absolute inset-0 pointer-events-none"
                  animate={{ x: ['-120%', '220%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                  style={{ background: `linear-gradient(90deg, transparent, ${step.color}1a, transparent)` }} />
              )}

              {/* Icon */}
              <motion.div
                animate={active ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.9, repeat: Infinity }}
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: (done || active) ? `${step.color}20` : 'rgba(255,255,255,0.04)',
                  color: (done || active) ? step.color : 'rgba(255,255,255,0.2)',
                  border: `1px solid ${(done || active) ? step.color + '30' : 'transparent'}`,
                }}>
                {done
                  ? <CheckCircle2 style={{ width: 11, height: 11 }} />
                  : icon}
              </motion.div>

              <span className="text-[10.5px] font-semibold flex-1 truncate leading-none"
                style={{ color: active ? 'rgba(255,255,255,0.92)' : done ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.22)' }}>
                {step.label}
              </span>

              {/* Status indicator */}
              {active && (
                <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
                  transition={{ duration: 0.65, repeat: Infinity }}
                  style={{ background: step.color, boxShadow: `0 0 8px ${step.color}` }} />
              )}
              {done && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600 }}
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#22c55e', boxShadow: '0 0 5px #22c55eaa' }} />
              )}
            </motion.div>
          );
        })}
      </div>
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${secondaryColor}44, transparent)` }} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   SUCCESS STATS
══════════════════════════════════════════════ */
function SuccessStats({ accentColor, secondaryColor }: { accentColor: string; secondaryColor: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="grid grid-cols-3 gap-2">
      {[['FPS', '+22%', accentColor], ['RAM', '-1.8GB', '#22c55e'], ['Ping', '-18ms', secondaryColor]].map(([label, value, color], i) => (
        <motion.div key={label}
          initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 + i * 0.1 }}
          className="rounded-xl p-3 text-center relative overflow-hidden"
          style={{ background: `${color}0c`, border: `1px solid ${color}25` }}>
          <motion.div className="absolute inset-0 rounded-xl"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3 }}
            style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }} />
          <div className="font-black text-sm relative z-10" style={{ color, textShadow: `0 0 10px ${color}88` }}>{value}</div>
          <div className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-0.5 relative z-10">{label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════════════ */
function ProgressBar({ progress, steps, currentStep, accentColor }: {
  progress: number; steps: ProcessStep[]; currentStep: number; accentColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full relative overflow-hidden"
          animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
          style={{ background: `linear-gradient(90deg, ${accentColor}88, ${accentColor})`, boxShadow: `0 0 14px ${accentColor}` }}>
          <motion.div className="absolute inset-0"
            animate={{ x: ['-100%', '220%'] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)' }} />
        </motion.div>
      </div>
      <div className="flex gap-0.5">
        {steps.map((s, i) => (
          <motion.div key={i} className="flex-1 h-[2px] rounded-full"
            animate={{
              background: i < currentStep ? '#22c55e' : i === currentStep ? accentColor : 'rgba(255,255,255,0.07)',
              boxShadow: i === currentStep ? `0 0 6px ${accentColor}` : 'none',
            }} />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   LAUNCH APP BUTTON
══════════════════════════════════════════════ */
function LaunchAppButton({ action, accentColor, onClose }: {
  action: LaunchAction; accentColor: string; onClose: () => void;
}) {
  const [launched, setLaunched] = useState(false);

  const handleLaunch = () => {
    setLaunched(true);
    /* Web deep-link — mirrors iOS UIApplication.shared.open(url) logic */
    try {
      window.location.href = action.deepLink;
    } catch (_) {}
    /* Fallback: close the processing screen after 800ms */
    setTimeout(onClose, 800);
  };

  return (
    <motion.div
      key="launch"
      initial={{ opacity: 0, scale: 0.88, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="w-full relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255,23,68,0.12) 0%, rgba(0,0,0,0.55) 100%)',
        border: `1px solid ${accentColor}40`,
        boxShadow: `0 0 32px ${accentColor}28, inset 0 1px 0 rgba(255,255,255,0.07)`,
      }}
    >
      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ boxShadow: [`0 0 18px ${accentColor}22`, `0 0 36px ${accentColor}55`, `0 0 18px ${accentColor}22`] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}88, rgba(255,200,0,0.5), transparent)` }} />

      {/* Shimmer sweep */}
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      <button
        onClick={handleLaunch}
        disabled={launched}
        className="w-full flex items-center gap-0 relative z-10 overflow-hidden"
        style={{ minHeight: 68 }}
      >
        {/* LEFT — Logo section */}
        <div className="flex items-center justify-center px-4 py-3 flex-shrink-0">
          <div className="relative">
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ boxShadow: [`0 0 0 2px ${accentColor}55, 0 0 16px ${accentColor}44`, `0 0 0 3px ${accentColor}cc, 0 0 28px ${accentColor}77`, `0 0 0 2px ${accentColor}55, 0 0 16px ${accentColor}44`] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ borderRadius: '50%' }}
            />
            {/* Rotating dashed border */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: -3,
                border: `1.5px dashed ${accentColor}66`,
                borderRadius: '50%',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
            {/* Logo image */}
            <div className="w-12 h-12 rounded-full overflow-hidden relative"
              style={{ border: `2px solid ${accentColor}99`, boxShadow: `0 0 12px ${accentColor}55` }}>
              <img
                src={action.logoUrl}
                alt={action.appName}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.style.background = `linear-gradient(135deg, ${accentColor}, #8B0000)`;
                }}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch my-3 flex-shrink-0"
          style={{ background: `linear-gradient(180deg, transparent, ${accentColor}44, transparent)` }} />

        {/* RIGHT — Text section */}
        <div className="flex-1 flex items-center justify-between px-4 py-3 min-w-0">
          <div className="min-w-0">
            <div className="text-white font-black text-[13px] tracking-wide leading-tight">
              {launched ? 'Opening...' : `Open ${action.appName}`}
            </div>
            <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-0.5">
              {launched ? 'Switching to game...' : 'Tap to launch game'}
            </div>
          </div>
          <motion.div
            animate={launched
              ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }
              : { x: [0, 4, 0] }}
            transition={{ duration: launched ? 0.6 : 1.4, repeat: Infinity }}
            className="flex-shrink-0 ml-2"
          >
            {launched
              ? <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />
              : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.5" />
                  <path d="M8 6.5L13 10L8 13.5V6.5Z" fill={accentColor} />
                </svg>
              )
            }
          </motion.div>
        </div>
      </button>

      {/* Bottom close link */}
      <div className="text-center pb-3">
        <button onClick={onClose}
          className="text-white/25 text-[9px] font-bold uppercase tracking-widest hover:text-white/50 transition-colors">
          Close
        </button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export function ProcessingScreen({
  title, subtitle, steps,
  accentColor = '#FF1744', secondaryColor = '#00E5FF',
  onClose, autoStart = false, launchAction,
}: ProcessingScreenProps) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'success'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const start = useCallback(() => {
    setPhase('running'); setCurrentStep(0); setProgress(0);
    let s = 0, p = 0;
    const run = () => {
      if (s >= steps.length) { setPhase('success'); return; }
      setCurrentStep(s);
      const target = ((s + 1) / steps.length) * 100;
      const iv = setInterval(() => {
        p = Math.min(p + 1.4 + Math.random() * 2.2, target);
        setProgress(p);
        if (p >= target) { clearInterval(iv); s++; setTimeout(run, 280 + Math.random() * 240); }
      }, 35);
    };
    setTimeout(run, 260);
  }, [steps.length]);

  useEffect(() => { if (autoStart) start(); }, [autoStart]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #020208 0%, #04020c 50%, #020408 100%)' }}
    >
      {/* Galaxy + diamonds + earth canvas */}
      <GalaxyCanvas phase={phase} accentColor={accentColor} secondaryColor={secondaryColor} />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top spacer + orb area */}
        <div className="flex-1 flex flex-col items-center justify-center pt-4 pb-2">
          <EnergyCoreOrb phase={phase} progress={progress} accentColor={accentColor} secondaryColor={secondaryColor} />

          {/* Title below orb */}
          <div className="mt-10 text-center space-y-1 px-6">
            <AnimatePresence mode="wait">
              <motion.div key={phase}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}>
                <div className="text-white font-black text-base uppercase tracking-[0.2em]"
                  style={{ textShadow: phase !== 'idle' ? `0 0 18px ${accentColor}88` : 'none' }}>
                  {phase === 'success' ? '✓ Optimization Complete' : phase === 'running' ? 'Processing...' : title}
                </div>
                <div className="text-white/35 text-[9.5px] font-bold uppercase tracking-widest mt-0.5">
                  {phase === 'success'
                    ? 'All optimizations applied successfully'
                    : phase === 'running'
                    ? (steps[Math.min(currentStep, steps.length - 1)]?.label ?? subtitle)
                    : (subtitle ?? 'Tap below to start')}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress bar */}
            <AnimatePresence>
              {phase === 'running' && (
                <motion.div initial={{ opacity: 0, scaleX: 0.6 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0 }}
                  className="mt-3">
                  <ProgressBar progress={progress} steps={steps} currentStep={currentStep} accentColor={accentColor} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom panel */}
        <div className="px-4 pb-5 space-y-3"
          style={{
            background: 'linear-gradient(0deg, rgba(2,2,8,0.95) 0%, rgba(4,2,12,0.85) 60%, transparent 100%)',
            paddingTop: 28,
          }}>
          {/* Success stats */}
          <AnimatePresence>
            {phase === 'success' && (
              <SuccessStats accentColor={accentColor} secondaryColor={secondaryColor} />
            )}
          </AnimatePresence>

          {/* Step panel */}
          <HoloPanel steps={steps} currentStep={currentStep} phase={phase} accentColor={accentColor} secondaryColor={secondaryColor} />

          {/* CTA */}
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.button key="start"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                onClick={start} whileTap={{ scale: 0.95 }}
                className="w-full h-12 rounded-xl font-black text-xs tracking-[0.22em] uppercase text-white flex items-center justify-center gap-2 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`, boxShadow: `0 0 30px ${accentColor}44` }}>
                <motion.div className="absolute inset-0"
                  animate={{ x: ['-100%', '220%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                <Zap className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{title}</span>
              </motion.button>
            )}
            {phase === 'running' && (
              <motion.div key="running"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-12 flex items-center justify-center gap-2.5">
                {[0, 1, 2, 3, 4].map(i => (
                  <motion.div key={i} className="rounded-full"
                    animate={{ scaleY: [0.4, 1.5, 0.4], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.12 }}
                    style={{
                      width: 3, height: 18,
                      background: i % 2 === 0 ? accentColor : secondaryColor,
                      boxShadow: `0 0 6px ${i % 2 === 0 ? accentColor : secondaryColor}`,
                    }} />
                ))}
              </motion.div>
            )}
            {phase === 'success' && !launchAction && (
              <motion.button key="done"
                initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                onClick={onClose} whileTap={{ scale: 0.96 }}
                className="w-full h-12 rounded-xl font-black text-xs tracking-[0.22em] uppercase text-white flex items-center justify-center gap-2 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #22c55e, #166534)', boxShadow: '0 0 28px rgba(34,197,94,0.4)' }}>
                <motion.div className="absolute inset-0"
                  animate={{ x: ['-100%', '220%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }} />
                <CheckCircle2 className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Done</span>
              </motion.button>
            )}
            {phase === 'success' && launchAction && (
              <LaunchAppButton key="launch" action={launchAction} accentColor={accentColor} onClose={onClose} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
