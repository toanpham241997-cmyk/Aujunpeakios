/**
 * LockedTabScreen — shown when an unauthenticated user taps a locked tab
 */
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, LogIn, ShieldAlert, Key } from 'lucide-react';
import { useAppContext, TabType } from '@/contexts/AppContext';

/* ─── Mini particle canvas ─── */
function LockCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const resize = () => { cv.width = cv.offsetWidth * devicePixelRatio; cv.height = cv.offsetHeight * devicePixelRatio; ctx.scale(devicePixelRatio, devicePixelRatio); };
    resize();
    window.addEventListener('resize', resize);
    const W = () => cv.offsetWidth, H = () => cv.offsetHeight;

    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: 0.6 + Math.random() * 1.8,
      a: 0.1 + Math.random() * 0.5,
      t: Math.random() * Math.PI * 2,
      ts: 0.01 + Math.random() * 0.025,
      c: Math.random() > 0.6 ? '#FF1744' : Math.random() > 0.5 ? '#facc15' : '#ffffff',
    }));

    let frame = 0;
    const draw = () => {
      frame++;
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.t += p.ts;
        const a = p.a * (0.5 + 0.5 * Math.sin(p.t));
        const px = p.x * w, py = p.y * h;
        const g = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
        g.addColorStop(0, p.c + Math.round(a * 0.5 * 255).toString(16).padStart(2,'0'));
        g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(px, py, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + Math.round(a * 255).toString(16).padStart(2,'0');
        ctx.fill();
        p.x += p.vx / w; p.y += p.vy / h;
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      });
      /* Connection lines */
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = (pts[i].x - pts[j].x) * w, dy = (pts[i].y - pts[j].y) * h;
          const d = Math.sqrt(dx*dx+dy*dy);
          if (d < 80) {
            const la = (1 - d / 80) * 0.12;
            ctx.beginPath();
            ctx.moveTo(pts[i].x*w, pts[i].y*h);
            ctx.lineTo(pts[j].x*w, pts[j].y*h);
            ctx.strokeStyle = '#FF1744' + Math.round(la*255).toString(16).padStart(2,'0');
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

const TAB_LABELS: Record<TabType, string> = {
  home: 'Home',
  game: 'Game',
  function: 'Function',
  settings: 'Settings',
  profile: 'Profile',
};

const TAB_DESCS: Record<TabType, string> = {
  home:     'Xem trạng thái hệ thống & tối ưu hóa RAM / CPU',
  game:     'Cấu hình chế độ game & tăng FPS Free Fire',
  function: 'Chạy FF Optimizer & checklist tùy chỉnh',
  settings: 'Cài đặt ứng dụng, ngôn ngữ & thông báo',
  profile:  '',
};

interface LockedTabScreenProps {
  tab: TabType;
}

export function LockedTabScreen({ tab }: LockedTabScreenProps) {
  const { setCurrentTab } = useAppContext();

  return (
    <motion.div
      key={`lock-${tab}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: 'calc(100vh - 132px)' }}
    >
      <LockCanvas />

      {/* Radial glow background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(255,23,68,0.10) 0%, rgba(250,204,21,0.05) 50%, transparent 100%)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8 gap-5 text-center">

        {/* Animated lock orb */}
        <div className="relative flex items-center justify-center">
          {/* Pulse rings */}
          {[1, 1.55, 2.05].map((s, i) => (
            <motion.div key={i}
              className="absolute rounded-full border"
              style={{ width: 88 * s, height: 88 * s, borderColor: `rgba(255,23,68,${0.22 - i * 0.06})` }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 2.4 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}

          {/* Outer rotating ring */}
          <motion.div
            className="absolute rounded-full"
            style={{ width: 108, height: 108, border: '1.5px dashed rgba(255,23,68,0.4)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ width: 88, height: 88, border: '1px dashed rgba(250,204,21,0.25)' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 13, repeat: Infinity, ease: 'linear' }}
          />

          {/* Core */}
          <motion.div
            animate={{ boxShadow: ['0 0 18px rgba(255,23,68,0.35), 0 0 40px rgba(255,23,68,0.12)', '0 0 32px rgba(255,23,68,0.7), 0 0 60px rgba(255,23,68,0.25)', '0 0 18px rgba(255,23,68,0.35), 0 0 40px rgba(255,23,68,0.12)'] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, rgba(255,23,68,0.22) 0%, rgba(139,0,0,0.18) 100%)', border: '1px solid rgba(255,23,68,0.45)' }}
          >
            {/* Inner shimmer */}
            <motion.div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '220%'] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
              />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <Lock className="w-7 h-7" style={{ color: '#FF1744', filter: 'drop-shadow(0 0 8px rgba(255,23,68,0.8))' }} />
            </motion.div>
          </motion.div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-400 text-[9px] font-black uppercase tracking-[0.28em]">Yêu cầu đăng nhập</span>
            </div>
            <h2 className="text-white font-black text-xl uppercase tracking-wider">
              {TAB_LABELS[tab]}
              <span className="text-white/25"> tab</span>
            </h2>
            <p className="text-white/40 text-[11px] font-medium mt-1.5 leading-relaxed max-w-[240px] mx-auto">
              {TAB_DESCS[tab]}
            </p>
          </motion.div>
        </div>

        {/* Feature chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="flex flex-wrap items-center justify-center gap-1.5"
        >
          {['Key License', 'Game Boost', 'Anti-Detect'].map((chip, i) => (
            <div key={chip} className="flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.2)' }}>
              <Key className="w-2.5 h-2.5 text-primary" />
              <span className="text-[9px] font-bold text-white/55 tracking-wide">{chip}</span>
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,23,68,0.3), rgba(250,204,21,0.2), transparent)' }} />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="w-full space-y-2.5"
        >
          <motion.button
            onClick={() => setCurrentTab('profile')}
            whileTap={{ scale: 0.96 }}
            className="w-full h-12 rounded-xl font-black text-xs tracking-[0.2em] uppercase text-white flex items-center justify-center gap-2.5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FF1744 0%, #8B0000 100%)', boxShadow: '0 0 28px rgba(255,23,68,0.45)' }}
          >
            <motion.div className="absolute inset-0 pointer-events-none"
              animate={{ x: ['-100%', '220%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />
            <LogIn className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Đăng nhập ngay</span>
          </motion.button>

          <p className="text-white/20 text-[9px] font-bold text-center uppercase tracking-widest">
            Nhập key license để mở khóa tất cả tính năng
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
