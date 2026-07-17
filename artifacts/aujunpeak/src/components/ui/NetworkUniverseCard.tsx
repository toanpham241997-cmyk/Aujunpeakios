import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Signal, Download, Upload, Gauge } from 'lucide-react';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { GalaxyNetwork } from '@/components/ui/GalaxyNetwork';

function NetStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      className="flex-1 rounded-xl px-2 py-2.5 flex flex-col items-center gap-1 border"
      style={{ background: `${color}0c`, borderColor: `${color}22` }}
    >
      <div style={{ color }}>{icon}</div>
      <div className="font-black text-[12px] tabular-nums text-white">{value}</div>
      <div className="text-white/30 text-[8px] font-black uppercase tracking-widest">{label}</div>
    </div>
  );
}

export function NetworkUniverseCard() {
  const [ping, setPing] = useState(24);
  const [down, setDown] = useState(86.4);
  const [up, setUp] = useState(21.2);

  useEffect(() => {
    const t = setInterval(() => {
      setPing((p) => Math.max(9, Math.min(46, p + (Math.random() * 6 - 3))));
      setDown((d) => Math.max(40, Math.min(130, d + (Math.random() * 8 - 4))));
      setUp((u) => Math.max(8, Math.min(40, u + (Math.random() * 3 - 1.5))));
    }, 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <FrostedCard delay={0.15} dark className="p-0 overflow-hidden relative">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Signal className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-white font-black text-[10px] tracking-[0.22em] uppercase">Global Network</span>
        </div>
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="text-cyan-300 text-[9px] font-black uppercase tracking-widest"
        >
          Đã kết nối
        </motion.span>
      </div>

      {/* Cosmic network canvas */}
      <div className="relative">
        <GalaxyNetwork height={210} />

        {/* Internet hub icon, pinned to the visual center of the canvas */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: 4 }}>
          <div className="relative w-11 h-11 flex items-center justify-center">
            {/* Expanding radar rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: 'rgba(0,229,255,0.55)' }}
                animate={{ scale: [1, 2.4], opacity: [0.55, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.85, ease: 'easeOut' }}
              />
            ))}
            <motion.div
              animate={{ boxShadow: ['0 0 10px rgba(0,229,255,0.5)', '0 0 22px rgba(0,229,255,0.9)', '0 0 10px rgba(0,229,255,0.5)'] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="relative w-9 h-9 rounded-full flex items-center justify-center border border-cyan-300/50"
              style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.28), rgba(0,0,0,0.6))' }}
            >
              <Wifi className="w-4 h-4 text-cyan-200" />
            </motion.div>
          </div>
        </div>

        {/* Bottom fade so the canvas blends into the card */}
        <div
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.5))' }}
        />
      </div>

      {/* Live network stats */}
      <div className="relative z-10 px-4 pb-4 -mt-1">
        <div className="flex gap-1.5">
          <NetStat icon={<Gauge className="w-3.5 h-3.5" />} label="Ping" value={`${Math.round(ping)}ms`} color="#00E5FF" />
          <NetStat icon={<Download className="w-3.5 h-3.5" />} label="Down" value={`${down.toFixed(1)}MB`} color="#22c55e" />
          <NetStat icon={<Upload className="w-3.5 h-3.5" />} label="Up" value={`${up.toFixed(1)}MB`} color="#FF1744" />
        </div>
      </div>
    </FrostedCard>
  );
}
