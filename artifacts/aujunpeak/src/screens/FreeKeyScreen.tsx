import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft, Gift, ExternalLink, Copy, Check, RefreshCw, Sparkles, Zap, Shield,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { getFreeKeyLink } from '@/lib/api';

/* ── Floating particle ── */
function FreeParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 28 }).map((_, i) => {
        const left  = `${(i * 3.7 + 1) % 96}%`;
        const size  = 1.5 + (i % 4) * 0.7;
        const dur   = 4 + (i % 6) * 1.2;
        const delay = (i * 0.41) % 6;
        const color =
          i % 4 === 0 ? '#00E5FF'
          : i % 4 === 1 ? '#00B8D9'
          : i % 4 === 2 ? '#FFD700'
          : 'rgba(0,229,255,0.5)';
        return (
          <div key={i} className="absolute rounded-full"
            style={{
              left, bottom: '-8px',
              width: `${size}px`, height: `${size}px`,
              background: color,
              boxShadow: `0 0 ${size * 5}px ${color}`,
              opacity: 0,
              animation: `spark-fly ${dur}s infinite linear ${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Orbiting rings around gift icon ── */
function OrbitRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[56, 72, 90].map((size, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: `rgba(0,229,255,${0.35 - i * 0.1})`,
            boxShadow: `0 0 ${8 + i * 4}px rgba(0,229,255,${0.25 - i * 0.06})`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

/* ── Scan line sweep ── */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-[2px] pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.6) 30%, rgba(0,229,255,0.9) 50%, rgba(0,229,255,0.6) 70%, transparent 100%)',
        boxShadow: '0 0 12px rgba(0,229,255,0.7)',
      }}
      animate={{ top: ['-2px', '100%'] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
    />
  );
}

/* ── Glitch text effect ── */
function GlitchTitle({ text }: { text: string }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative select-none">
      <h2
        className="text-white font-black text-2xl uppercase tracking-[0.3em]"
        style={{ textShadow: '0 0 24px rgba(0,229,255,0.8), 0 0 48px rgba(0,229,255,0.4)' }}
      >
        {text}
      </h2>
      {glitch && (
        <>
          <h2 className="absolute inset-0 font-black text-2xl uppercase tracking-[0.3em]"
            style={{ color: '#ff0066', opacity: 0.7, transform: 'translate(-2px, 0)', clipPath: 'inset(30% 0 50% 0)' }}>
            {text}
          </h2>
          <h2 className="absolute inset-0 font-black text-2xl uppercase tracking-[0.3em]"
            style={{ color: '#00E5FF', opacity: 0.7, transform: 'translate(2px, 0)', clipPath: 'inset(60% 0 10% 0)' }}>
            {text}
          </h2>
        </>
      )}
    </div>
  );
}

/* ── Hex grid decoration ── */
function HexGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
          <polygon points="28,4 52,16 52,40 28,52 4,40 4,16"
            fill="none" stroke="#00E5FF" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  );
}

/* ── Status dot ── */
function StatusDot({ ok }: { ok: boolean | null }) {
  if (ok === null) return <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />;
  return (
    <motion.div
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-500'}`}
      style={{ boxShadow: `0 0 8px ${ok ? '#34d399' : '#ef4444'}` }}
    />
  );
}

export function FreeKeyScreen() {
  const [, setLocation] = useLocation();
  const [link, setLink]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [copied, setCopied]     = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [shimmer, setShimmer]   = useState(false);

  useEffect(() => {
    setLoading(true);
    getFreeKeyLink().then(l => {
      setLink(l);
      setLoading(false);
      if (l) { setShimmer(true); setTimeout(() => setShimmer(false), 1200); }
    });
  }, [refreshKey]);

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpen = () => {
    if (link) window.open(link, '_blank', 'noopener');
  };

  return (
    <div className="fixed inset-0 z-[100] max-w-[430px] mx-auto flex flex-col overflow-hidden"
      style={{ background: '#030a0c' }}>

      {/* ── Animated BG gif ── */}
      <div className="absolute inset-0 pointer-events-none">
        <img src="/bg.gif" alt="" draggable={false}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.22) saturate(1.6) hue-rotate(160deg)', opacity: 0.85 }} />
        {/* Cyan gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(0,8,14,0.82) 0%, rgba(0,20,30,0.55) 40%, rgba(0,8,14,0.88) 100%)'
        }} />
        {/* Top energy burst */}
        <motion.div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.28) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
        {/* Bottom glow */}
        <motion.div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,180,220,0.2) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
      </div>

      {/* Hex grid */}
      <HexGrid />

      {/* Scan line sweep */}
      <ScanLine />

      {/* Particles */}
      <FreeParticles />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col h-full">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 pt-14 pb-4">
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setLocation('/')}
            className="w-10 h-10 rounded-xl flex items-center justify-center press-effect flex-shrink-0"
            style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)' }}>
            <ArrowLeft className="w-5 h-5" style={{ color: '#00E5FF' }} />
          </motion.button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-sm uppercase tracking-[0.25em]">Get Key Free</span>
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
                <Sparkles className="w-4 h-4" style={{ color: '#FFD700' }} />
              </motion.div>
            </div>
            <div className="h-[2px] w-14 mt-1 rounded-full" style={{
              background: 'linear-gradient(90deg, #00E5FF, transparent)',
              boxShadow: '0 0 8px rgba(0,229,255,0.7)',
            }} />
          </div>

          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setRefreshKey(k => k + 1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center press-effect"
            style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)' }}>
            <motion.div animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.7, repeat: loading ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw className="w-4 h-4" style={{ color: '#00E5FF', opacity: 0.8 }} />
            </motion.div>
          </motion.button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-10 space-y-5"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>

          {/* ── Hero: icon + title ── */}
          <div className="flex flex-col items-center pt-4 pb-2 gap-5">

            {/* Icon with orbit rings */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="relative flex items-center justify-center"
              style={{ width: 130, height: 130 }}
            >
              {/* Outer glow pulse */}
              <motion.div className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.25) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.3, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity }} />

              {/* Main icon box */}
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center relative z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(0,100,140,0.12) 100%)',
                  border: '1.5px solid rgba(0,229,255,0.4)',
                  boxShadow: '0 0 40px rgba(0,229,255,0.35), inset 0 0 20px rgba(0,229,255,0.08)',
                }}>
                <motion.div
                  animate={{ y: [-4, 5, -4], rotate: [-3, 3, -3] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <Gift className="w-12 h-12" style={{ color: '#00E5FF', filter: 'drop-shadow(0 0 12px rgba(0,229,255,0.9))' }} />
                </motion.div>
              </div>

              {/* Orbiting rings */}
              <OrbitRings />

              {/* Corner sparks */}
              {[0, 90, 180, 270].map((deg, i) => (
                <motion.div key={i} className="absolute w-2 h-2"
                  style={{ top: '50%', left: '50%', transformOrigin: '0 0' }}
                  animate={{ rotate: [deg, deg + 360] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: 'linear' }}>
                  <div className="w-1.5 h-1.5 rounded-full ml-12" style={{
                    background: '#00E5FF', boxShadow: '0 0 6px #00E5FF',
                  }} />
                </motion.div>
              ))}
            </motion.div>

            {/* Title + subtitle */}
            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12 }}
              className="text-center space-y-2">
              <GlitchTitle text="FREE KEY" />
              <p className="text-white/40 text-[11px] font-bold tracking-wide leading-relaxed">
                Link được cập nhật tự động bởi&nbsp;
                <span style={{ color: '#00E5FF' }}>Discord Bot</span>
                <br />Nhấn để mở và lấy key miễn phí
              </p>
            </motion.div>

            {/* Badge row */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex items-center gap-2">
              {[
                { icon: <Zap className="w-3 h-3" />, label: 'Instant', color: '#FFD700' },
                { icon: <Shield className="w-3 h-3" />, label: 'Safe', color: '#22c55e' },
                { icon: <Gift className="w-3 h-3" />, label: '100% Free', color: '#00E5FF' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                  style={{ background: `${b.color}14`, border: `1px solid ${b.color}30` }}>
                  <span style={{ color: b.color }}>{b.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: b.color }}>{b.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Link card ── */}
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.22 }}
            className="rounded-2xl overflow-hidden relative"
            style={{
              background: 'rgba(0,229,255,0.04)',
              border: '1px solid rgba(0,229,255,0.22)',
              boxShadow: shimmer ? '0 0 32px rgba(0,229,255,0.35)' : '0 0 16px rgba(0,229,255,0.1)',
              transition: 'box-shadow 0.5s ease',
            }}
          >
            {/* Card header */}
            <div className="flex items-center gap-2 px-4 py-2.5"
              style={{ background: 'rgba(0,229,255,0.08)', borderBottom: '1px solid rgba(0,229,255,0.14)' }}>
              <StatusDot ok={loading ? null : !!link} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                style={{ color: 'rgba(0,229,255,0.7)' }}>
                {loading ? 'Đang tải...' : link ? 'Link đang hoạt động' : 'Chưa có link — Bot chưa set'}
              </span>
              <div className="ml-auto flex items-center gap-1"
                style={{ background: 'rgba(0,229,255,0.1)', borderRadius: 6, padding: '1px 6px' }}>
                <span className="text-[7px] font-black tracking-widest uppercase" style={{ color: 'rgba(0,229,255,0.5)' }}>
                  READ ONLY
                </span>
              </div>
            </div>

            {/* Link content */}
            <div className="px-4 py-4 relative min-h-[68px] flex items-center">
              {loading ? (
                <div className="w-full flex items-center justify-center gap-2 py-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full"
                      style={{ background: '#00E5FF' }}
                      animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  {/* URL-style decoration */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {['#FF5F56', '#FFBD2E', '#27C93F'].map(c => (
                        <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
                      ))}
                    </div>
                    <div className="flex-1 h-px" style={{ background: 'rgba(0,229,255,0.1)' }} />
                  </div>
                  <div
                    className="font-mono text-[12px] font-bold break-all leading-relaxed px-3 py-2.5 rounded-xl"
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(0,229,255,0.15)',
                      color: link ? '#00E5FF' : 'rgba(255,255,255,0.18)',
                      userSelect: 'text',
                      textShadow: link ? '0 0 8px rgba(0,229,255,0.5)' : 'none',
                    }}
                  >
                    {link || '— Chưa có link. Dùng /setfreelink trong Discord Bot —'}
                  </div>
                </div>
              )}

              {/* Shimmer sweep on load */}
              <AnimatePresence>
                {shimmer && (
                  <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.12) 50%, transparent 100%)' }} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Action buttons ── */}
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="space-y-3">

            {/* Open link - main CTA */}
            <motion.button
              onClick={handleOpen}
              disabled={!link || loading}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.01 }}
              className="w-full h-[60px] rounded-2xl font-black text-sm tracking-[0.2em] uppercase relative overflow-hidden disabled:opacity-35 flex items-center justify-center gap-3"
              style={{
                background: link ? 'linear-gradient(135deg, #00E5FF 0%, #0096b3 100%)' : 'rgba(255,255,255,0.05)',
                color: link ? '#000' : 'rgba(255,255,255,0.2)',
                boxShadow: link ? '0 0 40px rgba(0,229,255,0.5), 0 8px 24px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              {link && (
                <>
                  {/* Shimmer */}
                  <motion.div className="absolute inset-0 pointer-events-none"
                    animate={{ x: ['-120%', '220%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }}
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', skewX: '-15deg' }} />
                  {/* Pulse ring */}
                  <motion.div className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
                    style={{ borderColor: 'rgba(0,229,255,0.4)' }}
                    animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }} />
                </>
              )}
              <ExternalLink className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Mở Link Nhận Key</span>
            </motion.button>

            {/* Copy */}
            <motion.button
              onClick={handleCopy}
              disabled={!link || loading}
              whileTap={{ scale: 0.95 }}
              className="w-full h-12 rounded-xl font-black text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 disabled:opacity-30 relative overflow-hidden"
              style={{ background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.22)', color: '#00E5FF' }}
            >
              {link && (
                <motion.div className="absolute inset-0 pointer-events-none"
                  animate={{ x: ['-120%', '220%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.1), transparent)' }} />
              )}
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="flex items-center gap-2 relative z-10" style={{ color: '#22c55e' }}>
                    <Check className="w-4 h-4" /> Đã sao chép!
                  </motion.span>
                ) : (
                  <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="flex items-center gap-2 relative z-10">
                    <Copy className="w-4 h-4" /> Sao chép link
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* ── Info card ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="rounded-2xl p-4 space-y-3"
            style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.12)' }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 rounded-full" style={{ background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#00E5FF' }}>Thông tin</span>
            </div>
            {[
              { icon: '🆓', text: 'Key Free: mở tab Home & Settings' },
              { icon: '⭐', text: 'Key VIP: mở toàn bộ tính năng' },
              { icon: '🤖', text: 'Link được cập nhật bằng lệnh /setfreelink' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.45 + i * 0.07 }}
                className="flex items-center gap-3">
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <span className="text-white/40 text-[10px] font-bold leading-relaxed">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom note */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="text-center text-white/20 text-[9px] font-bold tracking-wider uppercase leading-relaxed">
            Nâng cấp VIP để mở Game Optimizer · Function · và mọi tính năng
          </motion.p>
        </div>
      </div>
    </div>
  );
}
