import React, { useState, useEffect, useRef } from 'react';
import {
  Search, X, Zap, Star, Cpu, Wifi, MemoryStick, Shield,
  CheckCircle2, ChevronRight, ArrowLeft, Activity, Gauge,
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { ParticleField } from '@/components/ui/ParticleField';
import { WaveBar } from '@/components/ui/WaveBar';
import { CodeRain } from '@/components/ui/CodeRain';
import { CosmicProcessFX } from '@/components/ui/CosmicProcessFX';
import { toast } from 'sonner';

const GAMES = [
  { id: 'freefire',  name: 'Free Fire',      short: 'FF', color: '#FF1744', tier: 'VIP',       fps: '90', ping: 8,  pkg: 'com.dts.freefireth',    desc: 'Battle Royale · 50 players' },
  { id: 'pubg',      name: 'PUBG Mobile',    short: 'PB', color: '#facc15', tier: 'Supported', fps: '60', ping: 12, pkg: 'com.tencent.ig',         desc: 'Battle Royale · 100 players' },
  { id: 'codm',      name: 'Call of Duty',   short: 'CD', color: '#00E5FF', tier: 'Supported', fps: '60', ping: 15, pkg: 'com.activision.codmobile',desc: 'FPS · Multiplayer' },
  { id: 'ml',        name: 'Mobile Legends', short: 'ML', color: '#a855f7', tier: 'Supported', fps: '60', ping: 9,  pkg: 'com.mobile.legends',     desc: 'MOBA · 5v5' },
  { id: 'aov',       name: 'Arena of Valor', short: 'AV', color: '#22c55e', tier: 'Supported', fps: '60', ping: 11, pkg: 'com.ngame.slither.io',   desc: 'MOBA · Strategy' },
  { id: 'rox',       name: 'ROX',            short: 'RX', color: '#f97316', tier: 'Beta',      fps: '60', ping: 18, pkg: 'com.rox.mobile',         desc: 'Action · RPG' },
];

type Game = typeof GAMES[number];

/* ─── Dust Burst (impact effect) ─── */
function DustBurst({ color }: { color: string }) {
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 300, height: 60 }}>
      {Array.from({ length: 22 }).map((_, i) => {
        const angle = (i / 22) * 360;
        const dist = 50 + Math.random() * 80;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist * 0.35;
        const size = 3 + Math.random() * 6;
        const isDust = i % 3 !== 0;
        return (
          <motion.div key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: isDust ? 0.2 : 1.5 }}
            transition={{ duration: 0.55 + Math.random() * 0.3, ease: 'easeOut' }}
            className="absolute left-1/2 bottom-0 rounded-full"
            style={{
              width: size, height: size,
              background: isDust ? `rgba(139,90,20,0.7)` : color,
              filter: isDust ? 'blur(1.5px)' : `blur(0.5px)`,
              boxShadow: isDust ? 'none' : `0 0 ${size * 2}px ${color}`,
            }} />
        );
      })}
    </div>
  );
}

/* ─── Smoke Wisps ─── */
function SmokeWisps() {
  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 240, height: 120 }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const startX = (Math.random() - 0.5) * 120;
        const drift = (Math.random() - 0.5) * 60;
        const size = 30 + Math.random() * 50;
        const delay = Math.random() * 0.5;
        return (
          <motion.div key={i}
            initial={{ x: startX, y: 0, opacity: 0.55, scale: 0.5 }}
            animate={{ x: startX + drift, y: -(60 + Math.random() * 80), opacity: 0, scale: 1.8 + Math.random() }}
            transition={{ duration: 1.2 + Math.random() * 0.8, delay, ease: 'easeOut' }}
            className="absolute bottom-0 left-1/2 rounded-full"
            style={{
              width: size, height: size,
              background: 'rgba(200,180,140,0.22)',
              filter: 'blur(14px)',
              transform: 'translateX(-50%)',
            }} />
        );
      })}
    </div>
  );
}

/* ─── Boost Particles (during boost) ─── */
function BoostParticles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * 360;
        const dist = 60 + Math.random() * 120;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;
        const size = 2 + Math.random() * 5;
        const dur = 0.6 + Math.random() * 0.8;
        const colors = [color, '#ffffff', '#facc15', '#FF1744'];
        const c = colors[Math.floor(Math.random() * colors.length)];
        return (
          <motion.div key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
            transition={{ duration: dur, delay: Math.random() * 0.4, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.8 }}
            className="absolute rounded-full"
            style={{
              left: '50%', top: '50%', marginLeft: -size / 2, marginTop: -size / 2,
              width: size, height: size,
              background: c,
              boxShadow: `0 0 ${size * 3}px ${c}`,
            }} />
        );
      })}
    </div>
  );
}

/* ─── Wooden Crate ─── */
function WoodenCrate({ color, phase }: { color: string; phase: 'falling' | 'landed' | 'opening' }) {
  const isLanded = phase !== 'falling';
  const isOpening = phase === 'opening';

  return (
    <motion.div
      className="relative"
      style={{ width: 180, height: 155 }}
      initial={{ y: -320, rotate: -8 }}
      animate={{
        y: isLanded ? 0 : -320,
        rotate: isLanded ? 0 : -8,
        scaleX: isLanded ? [1, 1.06, 1] : 1,
        scaleY: isLanded ? [1, 0.88, 1] : 1,
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 1.1 }}
    >
      {/* Shadow */}
      <motion.div
        animate={{ scaleX: isLanded ? [0.5, 1.2, 1] : 0.2, opacity: isLanded ? [0, 0.6, 0.4] : 0 }}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full"
        style={{ width: 160, height: 14, background: 'rgba(0,0,0,0.55)', filter: 'blur(8px)' }}
      />

      {/* Lid */}
      <motion.div
        animate={isOpening ? { y: -120, rotateX: 80, rotateZ: 15, opacity: 0 } : { y: 0, rotateX: 0, rotateZ: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 16 }}
        className="absolute -top-[18px] left-0 right-0 rounded-xl z-20"
        style={{
          height: 36,
          background: 'linear-gradient(145deg, #A67C20 0%, #7A5A12 40%, #5C4010 70%, #8B6818 100%)',
          border: '2.5px solid #3D2A06',
          boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.12), inset 0 -3px 8px rgba(0,0,0,0.5)',
        }}>
        {/* Lid grain */}
        {[20, 40, 60, 80].map(pct => (
          <div key={pct} className="absolute inset-y-0" style={{ left: `${pct}%`, width: 1, background: 'rgba(0,0,0,0.22)' }} />
        ))}
        {/* Metal latch */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-3 rounded-sm"
          style={{ background: 'linear-gradient(180deg,#C8A840,#7A6218)', border: '1px solid #5A4810' }} />
      </motion.div>

      {/* Main body */}
      <div className="absolute left-0 right-0 bottom-0 rounded-xl overflow-hidden"
        style={{
          height: 155,
          background: 'linear-gradient(145deg, #9B7320 0%, #7A5812 30%, #5C4010 60%, #8B6818 80%, #6B4C10 100%)',
          border: '2.5px solid #3D2A06',
          boxShadow: `inset 0 3px 10px rgba(255,255,255,0.10), inset 0 -6px 16px rgba(0,0,0,0.6), 0 0 40px ${color}40`,
        }}>
        {/* Wood grain vertical */}
        {[14, 28, 42, 56, 70, 84].map(pct => (
          <div key={pct} className="absolute inset-y-0" style={{ left: `${pct}%`, width: 1.5, background: 'rgba(0,0,0,0.18)' }} />
        ))}
        {/* Metal horizontal straps */}
        {[22, 50, 78].map(pct => (
          <div key={pct} className="absolute left-0 right-0" style={{
            top: `${pct}%`, height: 10,
            background: 'linear-gradient(180deg, rgba(80,70,50,0.9) 0%, rgba(50,40,25,0.95) 50%, rgba(80,70,50,0.9) 100%)',
            borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(0,0,0,0.4)',
          }}>
            {/* Bolt dots */}
            {[8, 50, 92].map(b => (
              <div key={b} className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                style={{ left: `${b}%`, background: 'radial-gradient(circle at 35% 35%, #B8A050, #5A4A18)', border: '1px solid #3A2A08' }} />
            ))}
          </div>
        ))}
        {/* Corner brackets */}
        {[{ t: 2, l: 2 }, { t: 2, r: 2 }, { b: 2, l: 2 }, { b: 2, r: 2 }].map((pos, i) => (
          <div key={i} className="absolute w-5 h-5 rounded-sm"
            style={{
              top: (pos as any).t !== undefined ? `${(pos as any).t}%` : undefined,
              bottom: (pos as any).b !== undefined ? `${(pos as any).b}%` : undefined,
              left: (pos as any).l !== undefined ? `${(pos as any).l}%` : undefined,
              right: (pos as any).r !== undefined ? `${(pos as any).r}%` : undefined,
              background: 'linear-gradient(135deg,#8B7830,#5A4A18)',
              border: '1px solid #3A2A08',
            }} />
        ))}
        {/* Game label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-3">
            <div className="font-black text-2xl italic" style={{ color, textShadow: `0 0 18px ${color}, 0 0 36px ${color}88` }}>
              BOOST
            </div>
            <div className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Game Pack</div>
          </div>
        </div>

        {/* Inner glow on opening */}
        <AnimatePresence>
          {isOpening && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}70 0%, transparent 65%)` }} />
          )}
        </AnimatePresence>
      </div>

      {/* Light burst on open */}
      <AnimatePresence>
        {isOpening && (
          <motion.div initial={{ scale: 0.5, opacity: 0.9 }} animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{ width: 80, height: 80, background: `radial-gradient(circle, ${color}90 0%, transparent 70%)` }} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Crate Reveal Card ─── */
function RevealCard({ game, onClose }: { game: Game; onClose: () => void }) {
  const results = [
    { k: 'FPS', v: `+${game.fps === '90' ? '22' : '15'}%`, color: game.color },
    { k: 'RAM', v: '-1.8 GB', color: '#22c55e' },
    { k: 'Ping', v: `-${game.ping}ms`, color: '#00E5FF' },
    { k: 'Temp', v: '-4°C', color: '#facc15' },
  ];

  return (
    <motion.div
      initial={{ y: 60, opacity: 0, scale: 0.88 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.15 }}
      className="w-full max-w-[300px] rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg,rgba(8,8,8,0.97),rgba(20,0,0,0.97))',
        border: `1px solid ${game.color}50`,
        boxShadow: `0 0 60px ${game.color}35, 0 24px 60px rgba(0,0,0,0.9)`,
      }}
    >
      {/* Top glow bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${game.color}, transparent)` }} />

      <div className="p-6 space-y-5">
        {/* Badge */}
        <div className="text-center space-y-2">
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.3em]"
            style={{ background: `${game.color}18`, color: game.color, border: `1px solid ${game.color}40`, boxShadow: `0 0 16px ${game.color}30` }}>
            <CheckCircle2 className="w-3 h-3" /> Game Boosted!
          </motion.div>
          <div className="text-white font-black text-xl uppercase tracking-widest">{game.name}</div>
          <div className="text-white/35 text-[10px] font-bold tracking-widest uppercase">Optimization Applied ✓</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {results.map(({ k, v, color }) => (
            <motion.div key={k}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.2 + results.indexOf({ k, v, color }) * 0.08 }}
              className="rounded-xl p-2.5 text-center border border-white/8"
              style={{ background: `${color}08` }}>
              <div className="font-black text-[13px] tabular-nums" style={{ color }}>{v}</div>
              <div className="text-white/25 text-[8px] font-black uppercase tracking-widest mt-0.5">{k}</div>
            </motion.div>
          ))}
        </div>

        {/* Optimizations list */}
        <div className="space-y-2">
          {['Background apps killed', `FPS cap lifted to ${game.fps}`, 'Gaming DNS active', 'RAM pre-flushed', 'CPU clock boosted'].map((item, i) => (
            <motion.div key={i}
              initial={{ x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="flex items-center gap-2.5">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ delay: 0.35 + i * 0.07, duration: 0.4 }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#22c55e' }} />
              </motion.div>
              <span className="text-white/75 text-[11px] font-semibold">{item}</span>
            </motion.div>
          ))}
        </div>

        {/* Close */}
        <motion.button onClick={onClose} whileTap={{ scale: 0.96 }}
          className="w-full h-11 rounded-xl font-black text-xs tracking-[0.18em] uppercase text-white"
          style={{ background: `linear-gradient(135deg,${game.color},${game.color}88)`, boxShadow: `0 0 24px ${game.color}40` }}>
          Launch {game.name} →
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Game Detail Full-Screen Overlay ─── */
type BoostPhase = 'idle' | 'boosting' | 'crate-falling' | 'crate-landed' | 'crate-opening' | 'revealed';

function GameDetailOverlay({ game, onClose }: { game: Game; onClose: () => void }) {
  const [phase, setPhase] = useState<BoostPhase>('idle');
  const [bProgress, setBProgress] = useState(0);
  const [showDust, setShowDust] = useState(false);

  const handleBoost = () => {
    if (phase !== 'idle') return;
    setPhase('boosting');
    let p = 0;
    const t = setInterval(() => {
      p += 7 + Math.random() * 11;
      setBProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(t);
        // Start crate sequence
        setTimeout(() => { setPhase('crate-falling'); }, 350);
        setTimeout(() => { setPhase('crate-landed'); setShowDust(true); setTimeout(() => setShowDust(false), 900); }, 1100);
        setTimeout(() => { setPhase('crate-opening'); }, 2000);
        setTimeout(() => { setPhase('revealed'); }, 2900);
      }
    }, 80);
  };

  const cratePhaseMap: Record<string, 'falling' | 'landed' | 'opening'> = {
    'crate-falling': 'falling',
    'crate-landed': 'landed',
    'crate-opening': 'opening',
    'revealed': 'opening',
  };

  const stats = [
    { label: 'Max FPS', value: `${game.fps} FPS`, icon: <Star className="w-3.5 h-3.5" />, color: game.color },
    { label: 'Ping', value: `${game.ping} ms`, icon: <Wifi className="w-3.5 h-3.5" />, color: '#00E5FF' },
    { label: 'CPU', value: '35%', icon: <Cpu className="w-3.5 h-3.5" />, color: '#facc15' },
    { label: 'RAM', value: '1.8 GB', icon: <MemoryStick className="w-3.5 h-3.5" />, color: '#22c55e' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90]"
      style={{ maxWidth: 430, left: '50%', transform: 'translateX(-50%)', width: '100%' }}
    >
      {/* Cosmic background — reacts to boost phase */}
      <div className="absolute inset-0 overflow-hidden">
        <CosmicProcessFX
          phase={
            phase === 'revealed'
              ? 'success'
              : phase === 'boosting'
              ? (bProgress < 55 ? 'warp' : 'vacuum')
              : (phase === 'crate-falling' || phase === 'crate-landed' || phase === 'crate-opening')
              ? 'vacuum'
              : 'idle'
          }
          color={game.color}
          secondaryColor="#00E5FF"
        />
        <CodeRain color={game.color} opacity={0.06} />
        {/* Color vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${game.color}18 0%, transparent 55%)` }} />
        <motion.div className="absolute left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${game.color}60, transparent)` }}
          animate={{ top: ['0%', '100%'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }} />
      </div>

      {/* Back button */}
      <motion.button onClick={onClose} whileTap={{ scale: 0.9 }}
        className="absolute top-5 left-5 z-30 flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
        <ArrowLeft className="w-4 h-4 text-white/70" />
        <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">Back</span>
      </motion.button>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="pt-16 pb-4 px-6 text-center">
          <motion.div
            animate={{ boxShadow: [`0 0 24px ${game.color}60`, `0 0 48px ${game.color}90`, `0 0 24px ${game.color}60`] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl italic text-white mx-auto mb-4"
            style={{ background: `linear-gradient(135deg, ${game.color}, ${game.color}88)`, border: '2px solid rgba(255,255,255,0.15)' }}>
            {game.short}
          </motion.div>
          <div className="text-white font-black text-2xl uppercase tracking-[0.15em]">{game.name}</div>
          <div className="text-white/40 text-[10px] font-bold tracking-widest uppercase mt-1">{game.desc}</div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
              style={{ background: `${game.color}20`, color: game.color, border: `1px solid ${game.color}40` }}>{game.tier}</span>
            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/6 text-white/40 border border-white/10">
              {game.pkg}
            </span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 }}
          className="px-6 grid grid-cols-4 gap-2 mb-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.22 + i * 0.06 }}
              className="rounded-xl p-3 text-center border border-white/8" style={{ background: `${s.color}0c` }}>
              <div style={{ color: s.color }} className="flex justify-center mb-1">{s.icon}</div>
              <div className="font-black text-xs tabular-nums" style={{ color: s.color }}>{s.value}</div>
              <div className="text-white/25 text-[8px] font-bold uppercase tracking-widest mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Ping bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
          className="px-6 mb-4 space-y-1.5">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
            <span className="text-white/35">Ping Stability</span>
            <span style={{ color: game.ping < 15 ? '#22c55e' : '#facc15' }}>{game.ping}ms</span>
          </div>
          <WaveBar percentage={100 - game.ping * 3} color={game.color} />
        </motion.div>

        {/* Optimizations */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}
          className="px-6 mb-5">
          <FrostedCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/40 text-[9px] font-black tracking-widest uppercase">Optimizations</span>
            </div>
            {['Kill background apps', `Raise FPS cap to ${game.fps}`, 'Gaming DNS active', 'RAM pre-flush', 'CPU clock boost'].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-white/5 last:border-0">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0"
                  style={{ color: phase === 'revealed' ? '#22c55e' : 'rgba(255,255,255,0.15)' }} />
                <span className={`text-[11px] font-semibold transition-colors ${phase === 'revealed' ? 'text-white' : 'text-white/38'}`}>{item}</span>
                {phase === 'revealed' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.07 }} className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />}
              </div>
            ))}
          </FrostedCard>
        </motion.div>

        {/* Bottom: Boost button OR crate area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 relative">
          <AnimatePresence mode="wait">
            {/* IDLE / BOOSTING */}
            {(phase === 'idle' || phase === 'boosting') && (
              <motion.div key="boost-btn" exit={{ opacity: 0, y: -20 }} className="w-full space-y-4">
                {/* Boost particles */}
                {phase === 'boosting' && <BoostParticles color={game.color} />}

                {phase === 'boosting' && (
                  <div className="text-center space-y-3">
                    <motion.div className="text-white/45 font-black text-[10px] uppercase tracking-[0.3em]"
                      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
                      Boosting {game.name}...
                    </motion.div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                        <span className="text-white/30">Boost</span>
                        <span style={{ color: game.color }}>{Math.round(bProgress)}%</span>
                      </div>
                      <WaveBar percentage={bProgress} color={game.color} />
                    </div>
                  </div>
                )}

                <motion.button onClick={handleBoost} disabled={phase === 'boosting'} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
                  className="w-full h-14 rounded-2xl font-black text-sm tracking-[0.25em] uppercase text-white flex items-center justify-center gap-2.5 relative overflow-hidden shimmer-bg"
                  style={{ background: `linear-gradient(135deg,${game.color},${game.color}88)`, boxShadow: `0 0 36px ${game.color}55`, opacity: phase === 'boosting' ? 0.7 : 1 }}>
                  {phase === 'boosting'
                    ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Activity className="w-5 h-5" /></motion.div> Boosting...</>
                    : <><Zap className="w-5 h-5" /> Boost Game</>}
                </motion.button>
              </motion.div>
            )}

            {/* CRATE SEQUENCE */}
            {(phase === 'crate-falling' || phase === 'crate-landed' || phase === 'crate-opening') && (
              <motion.div key="crate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 relative" style={{ minHeight: 220 }}>
                <WoodenCrate color={game.color} phase={cratePhaseMap[phase]} />
                {showDust && (
                  <>
                    <DustBurst color={game.color} />
                    <SmokeWisps />
                  </>
                )}
                {phase === 'crate-landed' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/45 font-black text-[10px] uppercase tracking-[0.3em]">
                    Opening boost pack...
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* REVEALED */}
            {phase === 'revealed' && (
              <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="w-full flex flex-col items-center gap-4">
                <SmokeWisps />
                <RevealCard game={game} onClose={onClose} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── GameTab ─── */
export function GameTab() {
  const [query, setQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const filtered = GAMES.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-4 space-y-4 pb-8">
      <AnimatePresence>
        {selectedGame && <GameDetailOverlay game={selectedGame} onClose={() => setSelectedGame(null)} />}
      </AnimatePresence>

      {/* Search */}
      <FrostedCard delay={0.04} className="px-4 py-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-white/35 flex-shrink-0" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search games..." className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none font-medium" />
        {query && <button onClick={() => setQuery('')} className="text-white/35 hover:text-white press-effect"><X className="w-3.5 h-3.5" /></button>}
      </FrostedCard>

      {/* Game list */}
      <div className="text-white/35 text-[9px] font-black tracking-widest uppercase mb-2">
        {filtered.length} Games Supported
      </div>
      <div className="space-y-2">
        {filtered.map((game, idx) => (
          <motion.div
            key={game.id}
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.06, type: 'spring', stiffness: 340, damping: 28 }}
          >
            <FrostedCard onClick={() => setSelectedGame(game)} className="p-4 cursor-pointer press-effect relative overflow-hidden">
              {/* Color accent line */}
              <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: game.color }} />
              <div className="flex items-center gap-4 pl-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${game.color},${game.color}70)`, boxShadow: `0 0 16px ${game.color}45` }}>
                  {game.short}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-black text-sm">{game.name}</div>
                  <div className="text-white/35 text-[9px] font-medium mt-0.5">{game.desc}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: `${game.color}18`, color: game.color, border: `1px solid ${game.color}30` }}>{game.tier}</span>
                    <span className="text-white/30 text-[9px] font-bold">Max {game.fps} FPS · {game.ping}ms</span>
                  </div>
                </div>
                <motion.div whileHover={{ x: 3 }} className="flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-white/25" />
                </motion.div>
              </div>
            </FrostedCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
