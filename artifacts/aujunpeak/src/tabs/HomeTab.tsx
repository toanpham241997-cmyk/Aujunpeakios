import React, { useEffect, useState } from 'react';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { ParticleField } from '@/components/ui/ParticleField';
import { WaveBar } from '@/components/ui/WaveBar';
import { SparkLine } from '@/components/ui/SparkLine';
import { SwitchRow } from '@/components/ui/SwitchRow';
import { NetworkUniverseCard } from '@/components/ui/NetworkUniverseCard';
import { ProcessingScreen } from '@/components/ui/ProcessingScreen';
import {
  Rocket, Battery, Cpu, MemoryStick, ThermometerSun,
  Zap, Shield, TrendingUp, TrendingDown, Minus,
  Wifi, Settings, Database, Network, CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Stat Pill ─── */
function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 rounded-xl px-2 py-2 text-center border"
      style={{ background: `${color}10`, borderColor: `${color}22` }}>
      <div className="font-black text-[11px] tabular-nums" style={{ color }}>{value}</div>
      <div className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

/* ─── Gauge ─── */
function GaugeMonitor({ label, value, color, detail, icon, peak, min }: {
  label: string; value: number; color: string; detail: string;
  icon: React.ReactNode; peak: number; min: number;
}) {
  const r = 60; const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(value, 100)) / 100;
  const lvl = value < 40 ? 'LOW' : value < 65 ? 'OK' : value < 80 ? 'HIGH' : 'CRIT';
  const lvlColor = value < 40 ? '#22c55e' : value < 65 ? '#00E5FF' : value < 80 ? '#facc15' : '#FF1744';
  const trend = value > 65 ? 'up' : value < 40 ? 'down' : 'flat';

  return (
    <FrostedCard className="p-4 relative overflow-hidden">
      <ParticleField color={color} count={10} className="opacity-20" />
      <div className="relative z-10 flex items-center gap-5">
        <div className="relative flex-shrink-0 w-[148px] h-[148px] flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" width="148" height="148" viewBox="0 0 148 148">
            <circle cx="74" cy="74" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            {Array.from({ length: 12 }).map((_, ti) => {
              const angle = (ti / 12) * 360;
              const rad = (angle * Math.PI) / 180;
              return <line key={ti}
                x1={74 + (r - 6) * Math.cos(rad)} y1={74 + (r - 6) * Math.sin(rad)}
                x2={74 + (r + 1) * Math.cos(rad)} y2={74 + (r + 1) * Math.sin(rad)}
                stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />;
            })}
            <circle cx="74" cy="74" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${color})` }} />
            <circle cx="74" cy="74" r={r - 14} fill="none" stroke={`${color}28`} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circ * 0.9} strokeDashoffset={offset * 0.85}
              style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)' }} />
          </svg>
          <div className="flex flex-col items-center gap-0.5 z-10">
            <div className="text-[30px] font-black tabular-nums leading-none"
              style={{ color, textShadow: `0 0 20px ${color}` }}>{Math.round(value)}%</div>
            <div style={{ color, opacity: 0.65 }}>{icon}</div>
            <div style={{ color: trend === 'up' ? '#FF1744' : trend === 'down' ? '#22c55e' : '#00E5FF' }}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-black text-sm uppercase tracking-[0.18em]">{label}</div>
              <div className="text-white/35 text-[9px] font-bold uppercase tracking-wider mt-0.5">{detail}</div>
            </div>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border"
              style={{ color: lvlColor, borderColor: `${lvlColor}38`, background: `${lvlColor}12` }}>{lvl}</motion.div>
          </div>
          <div className="h-[50px] w-full"><SparkLine color={color} baseValue={value} /></div>
          <WaveBar percentage={value} color={color} />
          <div className="flex gap-1.5">
            <StatPill label="Peak" value={`${peak}%`} color={color} />
            <StatPill label="Now" value={`${Math.round(value)}%`} color={color} />
            <StatPill label="Low" value={`${min}%`} color={color} />
          </div>
        </div>
      </div>
    </FrostedCard>
  );
}

const APPLY_STEPS = [
  { icon: <Settings />, label: 'Khởi động Optimization Engine', color: '#FF1744' },
  { icon: <Database />, label: 'Xả RAM cache — 2.1 GB freed', color: '#a855f7' },
  { icon: <Cpu />, label: 'CPU Governor → Performance', color: '#00E5FF' },
  { icon: <Network />, label: 'Gaming DNS 1.1.1.1 override', color: '#00E5FF' },
  { icon: <Shield />, label: 'Anti-Cheat Stealth Layer 2.0', color: '#facc15' },
  { icon: <Zap />, label: 'GPU HWUI render override', color: '#FF1744' },
  { icon: <Wifi />, label: 'TCP buffer tuning', color: '#22c55e' },
  { icon: <CheckCircle2 />, label: 'Free Fire READY ✓', color: '#22c55e' },
];

/* ─── HomeTab ─── */
export function HomeTab() {
  const [ramVal, setRamVal] = useState(62);
  const [cpuVal, setCpuVal] = useState(38);
  const [tempVal, setTempVal] = useState(42);
  const [ramPeak, setRamPeak] = useState(77);
  const [cpuPeak, setCpuPeak] = useState(68);
  const [ramMin, setRamMin] = useState(35);
  const [cpuMin, setCpuMin] = useState(18);
  const [showProcess, setShowProcess] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setRamVal(prev => { const n = Math.max(35, Math.min(88, prev + (Math.random() * 10 - 5))); setRamPeak(pk => Math.max(pk, n)); setRamMin(mn => Math.min(mn, n)); return n; });
      setCpuVal(prev => { const n = Math.max(15, Math.min(78, prev + (Math.random() * 14 - 7))); setCpuPeak(pk => Math.max(pk, n)); setCpuMin(mn => Math.min(mn, n)); return n; });
      setTempVal(prev => Math.max(36, Math.min(58, prev + (Math.random() * 4 - 2))));
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const tempColor = tempVal < 45 ? '#22c55e' : tempVal < 52 ? '#facc15' : '#FF1744';

  return (
    <div className="relative">
      {/* Processing screen — sits inside the scroll container as an absolute overlay */}
      <AnimatePresence>
        {showProcess && (
          <ProcessingScreen
            title="Apply Settings"
            subtitle="Optimize Free Fire environment"
            steps={APPLY_STEPS}
            accentColor="#FF1744"
            secondaryColor="#00E5FF"
            onClose={() => { setShowProcess(false); setApplied(true); }}
          />
        )}
      </AnimatePresence>

      <div className="p-4 space-y-4 pb-8">
        {/* Banner */}
        <FrostedCard delay={0.05} dark className="p-4 border-primary/30 relative overflow-hidden">
          <ParticleField color="#FF1744" count={12} />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div animate={{ boxShadow: ['0 0 14px rgba(255,23,68,0.4)','0 0 28px rgba(255,23,68,0.75)','0 0 14px rgba(255,23,68,0.4)'] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-12 h-12 bg-gradient-to-br from-[#FF1744] to-[#8B0000] text-white rounded-xl flex items-center justify-center font-black text-2xl italic border border-white/20">
                FF
              </motion.div>
              <div>
                <h2 className="text-white font-black text-base uppercase tracking-wider">Free Fire</h2>
                <p className="text-white/45 text-[10px] font-bold tracking-widest uppercase">Game Optimizer Active</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                className={`w-2.5 h-2.5 rounded-full ${applied ? 'bg-primary' : 'bg-orange-400'}`}
                style={{ boxShadow: applied ? '0 0 10px rgba(255,23,68,0.9)' : '0 0 8px rgba(251,146,60,0.7)' }} />
              <span className={`text-[9px] font-black tracking-widest uppercase ${applied ? 'text-primary' : 'text-orange-400'}`}>
                {applied ? 'Optimized' : 'Standby'}
              </span>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between mt-3 pt-3 border-t border-white/[0.07]">
            <span className="text-primary font-bold text-[10px] uppercase tracking-wider">
              {applied ? '✓ FPS + RAM Optimized' : 'Effect: Optimize FPS + RAM'}
            </span>
            <SwitchRow id="ff_mode" label="" icon={null} onLabel="Game Mode ON" offLabel="Game Mode OFF" />
          </div>
        </FrostedCard>

        {/* Cosmic network visualization */}
        <NetworkUniverseCard />

        {/* Divider */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(255,23,68,0.55),rgba(0,229,255,0.3),transparent)' }} />
          <span className="text-[9px] font-black tracking-[0.28em] uppercase text-white/30">System Status</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(270deg,rgba(255,23,68,0.55),rgba(0,229,255,0.3),transparent)' }} />
        </div>

        {/* Temperature */}
        <FrostedCard delay={0.1} className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${tempColor}20`, border: `1px solid ${tempColor}40` }}>
              <ThermometerSun className="w-4 h-4" style={{ color: tempColor }} />
            </div>
            <div>
              <div className="text-white font-black text-sm uppercase tracking-wider">Device Temp</div>
              <div className="text-[10px] font-bold text-white/38 uppercase tracking-widest">{tempVal < 45 ? 'Cool · Normal' : tempVal < 52 ? 'Warm · Moderate' : 'Hot · Throttling'}</div>
            </div>
          </div>
          <motion.div key={Math.round(tempVal)} initial={{ scale: 1.15 }} animate={{ scale: 1 }}
            className="text-2xl font-black tabular-nums"
            style={{ color: tempColor, textShadow: `0 0 12px ${tempColor}88` }}>{Math.round(tempVal)}°C</motion.div>
        </FrostedCard>

        <GaugeMonitor label="RAM" value={ramVal} color="#FF1744" detail={`${(ramVal * 0.06).toFixed(1)} / 6.0 GB`}
          icon={<MemoryStick className="w-4 h-4" />} peak={Math.round(ramPeak)} min={Math.round(ramMin)} />
        <GaugeMonitor label="CPU" value={cpuVal} color="#00E5FF" detail="4 Cores Active"
          icon={<Cpu className="w-4 h-4" />} peak={Math.round(cpuPeak)} min={Math.round(cpuMin)} />

        {/* Quick Toggles */}
        <FrostedCard delay={0.25} className="px-4 py-1 relative">
          <ParticleField color="#FACC15" count={8} className="opacity-15" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 py-3 border-b border-white/8 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-white font-black text-[10px] tracking-widest uppercase">Quick Toggles</span>
            </div>
            <SwitchRow id="home_high_perf" icon={<Rocket className="w-3.5 h-3.5" />} label="High Performance Mode" description="Max CPU & GPU clocks for gaming" onLabel="High Performance ON" offLabel="High Performance OFF" color="#FF1744" />
            <SwitchRow id="home_dns" icon={<Wifi className="w-3.5 h-3.5" />} label="Gaming DNS" description="Cloudflare 1.1.1.1 — lower ping" onLabel="Gaming DNS ON" offLabel="Gaming DNS OFF" color="#00E5FF" />
            <SwitchRow id="home_power" icon={<Battery className="w-3.5 h-3.5" />} label="Power Saver" description="Reduce background drain when idle" onLabel="Power Saver ON" offLabel="Power Saver OFF" color="#22c55e" />
            <SwitchRow id="home_shield" icon={<Shield className="w-3.5 h-3.5" />} label="Anti-Cheat Shield" description="Hides optimizer from game detection" onLabel="Anti-Cheat Shield ON" offLabel="Anti-Cheat Shield OFF" color="#a855f7" />
          </div>
        </FrostedCard>

        {/* Apply button */}
        <motion.button
          onClick={() => setShowProcess(true)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.012 }}
          className="w-full py-3.5 rounded-xl font-black text-xs tracking-[0.22em] uppercase relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#FF1744 0%,#8B0000 100%)', color: 'white', boxShadow: applied ? '0 0 32px rgba(255,23,68,0.65)' : '0 0 20px rgba(255,23,68,0.4)' }}>
          {/* Shimmer */}
          <motion.div className="absolute inset-0 pointer-events-none"
            animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Rocket className="w-4 h-4" />
            {applied ? 'Re-Apply Settings' : 'Apply Settings'}
          </span>
          {applied && (
            <motion.div className="absolute right-3 top-1/2 -translate-y-1/2"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
              <CheckCircle2 className="w-4 h-4 text-white/60" />
            </motion.div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
