import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Gamepad2, BatteryFull } from 'lucide-react';

const TITLE = 'AUJUNPEAK';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [letterVisible, setLetterVisible] = useState<boolean[]>(Array(TITLE.length).fill(false));
  const [loopKey, setLoopKey] = useState(0);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    let active = true;
    const run = () => {
      if (!active) return;
      setLetterVisible(Array(TITLE.length).fill(false));
      let i = 0;
      const tick = () => {
        if (!active) return;
        if (i < TITLE.length) {
          const idx = i;
          setLetterVisible(prev => { const n = [...prev]; n[idx] = true; return n; });
          i++;
          setTimeout(tick, 105);
        } else {
          setTimeout(() => {
            if (!active) return;
            setLoopKey(k => k + 1);
            run();
          }, 2200);
        }
      };
      setTimeout(tick, 300);
    };
    run();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowCards(true), 900);
    return () => clearTimeout(t);
  }, []);

  const cards = [
    { icon: <Zap className="w-5 h-5" />,        title: 'BOOST',  desc: 'Instant CPU Boost',         color: '#FF1744', glow: 'rgba(255,23,68,0.55)' },
    { icon: <Gamepad2 className="w-5 h-5" />,    title: 'GAME',   desc: 'Optimized for Free Fire',   color: '#00E5FF', glow: 'rgba(0,229,255,0.45)' },
    { icon: <BatteryFull className="w-5 h-5" />, title: 'POWER',  desc: 'Stable Battery & Temp',     color: '#22c55e', glow: 'rgba(34,197,94,0.45)' },
  ];

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden max-w-[430px] mx-auto">
      {/* Background GIF */}
      <img src="/bg.gif" alt="" className="absolute inset-0 w-full h-full object-cover object-center" style={{ filter: 'brightness(0.28) saturate(1.7)' }} />
      <div className="absolute inset-0 bg-black/60" />

      {/* Red bloom glow */}
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,23,68,0.32) 0%, transparent 70%)' }}
      />

      {/* Scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />

      {/* Particles */}
      <SplashParticles />

      {/* Title */}
      <div className="relative z-10 flex flex-col items-center mt-[-100px]">
        <div className="flex items-center">
          {TITLE.split('').map((ch, i) => (
            <motion.span
              key={`${loopKey}-${i}`}
              initial={{ opacity: 0, y: -16, scale: 0.5, filter: 'blur(8px)' }}
              animate={letterVisible[i]
                ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
                : { opacity: 0, y: -16, scale: 0.5, filter: 'blur(8px)' }
              }
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-[38px] font-black"
              style={{
                color: '#FF1744',
                textShadow: '0 0 20px rgba(255,23,68,1), 0 0 48px rgba(255,23,68,0.5)',
                letterSpacing: '0.15em',
                display: 'inline-block',
              }}
            >
              {ch}
            </motion.span>
          ))}
        </div>

        <motion.div
          key={loopKey}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.7, ease: 'easeOut' }}
          className="h-[2px] w-52 mt-3 origin-left rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #FF1744 30%, #00E5FF 70%, transparent)' }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-2 text-[10px] font-black tracking-[0.4em] text-white/50 uppercase"
        >
          v2.1 · Game Optimizer
        </motion.div>
      </div>

      {/* Feature cards */}
      <div className="absolute bottom-28 w-full px-6 flex flex-col gap-2.5 z-10">
        <AnimatePresence>
          {showCards && cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ delay: idx * 0.14, duration: 0.45, type: 'spring', stiffness: 260, damping: 24 }}
              className="relative flex items-center gap-4 rounded-2xl p-3.5 overflow-hidden backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, rgba(0,0,0,0.78) 0%, ${card.color}10 100%)`,
                border: `1px solid ${card.color}40`,
                boxShadow: `0 4px 28px ${card.glow}`,
              }}
            >
              <div className="absolute inset-0 shimmer-bg opacity-20 pointer-events-none" />
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                style={{ background: `${card.color}18`, border: `1px solid ${card.color}50`, boxShadow: `0 0 16px ${card.glow}`, color: card.color }}
              >
                {card.icon}
              </div>
              <div className="relative z-10 flex-1">
                <div className="text-white font-black text-sm tracking-widest uppercase">{card.title}</div>
                <div className="text-white/50 text-[10px] font-bold tracking-wide mt-0.5">{card.desc}</div>
              </div>
              <div className="absolute right-0 top-2 bottom-2 w-[3px] rounded-l-full" style={{ background: card.color, boxShadow: `0 0 8px ${card.color}` }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Start button */}
      <AnimatePresence>
        {showCards && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.65, type: 'spring', stiffness: 260, damping: 22 }}
            onClick={onComplete}
            whileTap={{ scale: 0.92 }}
            className="absolute bottom-7 px-12 py-4 font-black tracking-[0.35em] text-sm rounded-full z-20 text-white uppercase"
            style={{
              background: 'linear-gradient(135deg, #FF1744 0%, #8B0000 100%)',
              boxShadow: '0 0 36px rgba(255,23,68,0.6), 0 8px 28px rgba(0,0,0,0.6)',
            }}
          >
            START
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function SplashParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {Array.from({ length: 22 }).map((_, i) => {
        const left = `${(i * 4.7 + 1.5) % 97}%`;
        const size = 1.5 + (i % 4) * 0.6;
        const dur = 4.5 + (i % 5) * 1.1;
        const delay = (i * 0.38) % 5;
        const color = i % 3 === 0 ? '#FF1744' : i % 3 === 1 ? '#00E5FF' : '#FFD700';
        return (
          <div key={i} className="absolute rounded-full"
            style={{ left, bottom: '-6px', width: `${size}px`, height: `${size}px`, background: color, boxShadow: `0 0 ${size * 4}px ${color}`, opacity: 0, animation: `spark-fly ${dur}s infinite linear ${delay}s` }}
          />
        );
      })}
    </div>
  );
}
