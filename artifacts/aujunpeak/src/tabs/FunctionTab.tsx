import React, { useState } from 'react';
import {
  CheckSquare2, Square, Zap, ChevronDown, ChevronUp,
  Star, Shield, Gauge, Wifi, Battery, MemoryStick,
  Monitor, Aperture, Layers, Signal, Radio, RefreshCw,
  Cpu, Network, Settings, CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { SwitchRow } from '@/components/ui/SwitchRow';
import { ParticleField } from '@/components/ui/ParticleField';
import { ProcessingScreen } from '@/components/ui/ProcessingScreen';

const FF_LAUNCH: import('@/components/ui/ProcessingScreen').LaunchAction = {
  logoUrl: 'https://play-lh.googleusercontent.com/TaRNa5NkrN9gHlz9HsE-KP2EBsxM44eNFrZvTMQgKUNLJeQn7Bb2OO_pTLIxVx0KQ',
  appName: 'Free Fire',
  deepLink: 'freefire://',
};

const CATEGORIES = [
  {
    id: 'performance', label: 'Performance', icon: <Gauge className="w-4 h-4" />, color: '#FF1744',
    items: [
      { id: 'p1', label: 'Kill Background Apps', desc: 'Free up RAM by closing unused apps' },
      { id: 'p2', label: 'CPU Governor Boost', desc: 'Force performance governor on all cores' },
      { id: 'p3', label: 'Disable Thermal Throttle', desc: 'Prevent CPU slowdown at high temp' },
      { id: 'p4', label: 'GPU Render Override', desc: 'Use hardware renderer for game graphics' },
      { id: 'p5', label: 'Disable Animations', desc: 'Set window animation to 0.5x speed' },
    ],
  },
  {
    id: 'network', label: 'Network', icon: <Wifi className="w-4 h-4" />, color: '#00E5FF',
    items: [
      { id: 'n1', label: 'Gaming DNS 1.1.1.1', desc: 'Cloudflare ultra-fast DNS resolver' },
      { id: 'n2', label: 'TCP Optimization', desc: 'Tune TCP buffers for low-latency' },
      { id: 'n3', label: 'WiFi Lock Mode', desc: 'Prevent WiFi from switching to sleep' },
      { id: 'n4', label: 'Disable Background Sync', desc: 'Block background app data usage' },
      { id: 'n5', label: 'Network Queue Tuning', desc: 'Reduce packet queue latency' },
    ],
  },
  {
    id: 'battery', label: 'Battery', icon: <Battery className="w-4 h-4" />, color: '#22c55e',
    items: [
      { id: 'b1', label: 'Game Power Mode', desc: 'Balance performance with battery life' },
      { id: 'b2', label: 'Screen Lock Power', desc: 'Reduce brightness drain while gaming' },
      { id: 'b3', label: 'Doze Override', desc: 'Prevent aggressive doze during gaming' },
    ],
  },
  {
    id: 'ram', label: 'RAM', icon: <MemoryStick className="w-4 h-4" />, color: '#a855f7',
    items: [
      { id: 'r1', label: 'RAM Pre-Flush', desc: 'Flush inactive pages before game launch' },
      { id: 'r2', label: 'ZRAM Tune', desc: 'Optimize swap compression ratio' },
      { id: 'r3', label: 'Memory Compaction', desc: 'Compact fragmented memory blocks' },
    ],
  },
  {
    id: 'security', label: 'Anti-Detect', icon: <Shield className="w-4 h-4" />, color: '#facc15',
    items: [
      { id: 's1', label: 'Hide Optimizer Process', desc: 'Mask aujunpeak from process list' },
      { id: 's2', label: 'Root Cloaking', desc: 'Prevent root detection by game' },
      { id: 's3', label: 'Package Spoof', desc: 'Mask modified package signatures' },
    ],
  },
];

const EXTRA_SWITCHES = [
  { id: 'ex_fps', icon: <Monitor className="w-3.5 h-3.5" />, label: 'Unlock 90/120 FPS', description: 'Override device FPS cap for Free Fire', color: '#FF1744' },
  { id: 'ex_touch', icon: <Aperture className="w-3.5 h-3.5" />, label: 'Touch Response Boost', description: 'Lower touch polling latency by 12ms', color: '#00E5FF' },
  { id: 'ex_gfx', icon: <Layers className="w-3.5 h-3.5" />, label: 'GFX Tool Mode', description: 'Force Ultra graphics pipeline', color: '#a855f7' },
  { id: 'ex_ping', icon: <Signal className="w-3.5 h-3.5" />, label: 'Ping Stabilizer', description: 'Clamp network variance < 5ms', color: '#22c55e' },
  { id: 'ex_radio', icon: <Radio className="w-3.5 h-3.5" />, label: 'Background Radio Off', description: 'Disable unused radio components', color: '#facc15' },
  { id: 'ex_refresh', icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'Auto Re-apply', description: 'Re-apply optimizations every 10 min', color: '#f97316' },
];

const FF_STEPS = [
  { icon: <Zap />,          label: 'Khởi động FF Optimizer Engine', color: '#FF1744' },
  { icon: <MemoryStick />,  label: 'RAM Pre-Flush — 2.1 GB freed',   color: '#a855f7' },
  { icon: <Cpu />,          label: 'CPU Governor → Performance',      color: '#00E5FF' },
  { icon: <Settings />,     label: 'Applying selected patches',       color: '#FF1744' },
  { icon: <Network />,      label: 'Tuning TCP/UDP network stack',    color: '#00E5FF' },
  { icon: <Monitor />,      label: 'GPU HWUI render override',        color: '#facc15' },
  { icon: <Shield />,       label: 'Anti-detect stealth layer 2.0',   color: '#facc15' },
  { icon: <CheckCircle2 />, label: 'Free Fire environment ready ✓',   color: '#22c55e' },
];

function ChecklistItem({ id, label, desc, checked, onToggle }: {
  id: string; label: string; desc: string; checked: boolean; onToggle: () => void;
}) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} onClick={onToggle}
      className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 cursor-pointer press-effect">
      <motion.div animate={checked ? { scale: [1.2, 1] } : { scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }}>
        {checked
          ? <CheckSquare2 className="flex-shrink-0 text-primary" style={{ width: 18, height: 18 }} />
          : <Square className="flex-shrink-0 text-white/20" style={{ width: 18, height: 18 }} />}
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className={`text-[12px] font-bold transition-colors ${checked ? 'text-white' : 'text-white/50'}`}>{label}</div>
        <div className="text-white/25 text-[9px] font-medium mt-0.5 truncate">{desc}</div>
      </div>
      {checked && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"
          style={{ boxShadow: '0 0 8px rgba(255,23,68,0.8)' }} />
      )}
    </motion.div>
  );
}

/* ─── FunctionTab ─── */
export function FunctionTab() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedCat, setExpandedCat] = useState<string>('performance');
  const [showProcess, setShowProcess] = useState(false);

  const totalChecked = Object.values(checked).filter(Boolean).length;
  const totalItems = CATEGORIES.reduce((s, c) => s + c.items.length, 0);

  const toggleItem = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const selectAll = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return;
    const allOn = cat.items.every(item => checked[item.id]);
    setChecked(prev => { const n = { ...prev }; cat.items.forEach(i => { n[i.id] = !allOn; }); return n; });
  };

  return (
    <div className="relative">
      {/* Processing screen */}
      <AnimatePresence>
        {showProcess && (
          <ProcessingScreen
            title="FF Optimizer"
            subtitle={`${totalChecked || totalItems} optimizations queued`}
            steps={FF_STEPS}
            accentColor="#FF1744"
            secondaryColor="#00E5FF"
            onClose={() => setShowProcess(false)}
            launchAction={FF_LAUNCH}
          />
        )}
      </AnimatePresence>

      <div className="p-4 space-y-4 pb-8">
        {/* Header */}
        <FrostedCard delay={0.04} className="p-4 relative overflow-hidden">
          <ParticleField color="#FF1744" count={10} className="opacity-25" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-white font-black text-[10px] tracking-widest uppercase">Optimizer Checklist</div>
              <div className="text-white/35 text-[9px] mt-0.5">{totalChecked}/{totalItems} selected</div>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 relative"
              style={{ borderColor: totalChecked > 0 ? '#FF1744' : 'rgba(255,255,255,0.1)' }}>
              <div className="w-6 h-6 rounded-full"
                style={{ background: `conic-gradient(#FF1744 ${(totalChecked / totalItems) * 360}deg, rgba(255,255,255,0.08) 0deg)`, transform: 'rotate(-90deg)' }} />
            </div>
          </div>
        </FrostedCard>

        {/* Categories */}
        {CATEGORIES.map((cat, catIdx) => {
          const isExp = expandedCat === cat.id;
          const catChecked = cat.items.filter(i => checked[i.id]).length;
          const allChecked = catChecked === cat.items.length;
          return (
            <FrostedCard key={cat.id} delay={0.06 + catIdx * 0.05} className="overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer press-effect"
                onClick={() => setExpandedCat(isExp ? '' : cat.id)}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}30` }}>{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-black text-[12px] uppercase tracking-widest">{cat.label}</div>
                  <div className="text-white/35 text-[9px] font-bold">{catChecked}/{cat.items.length} selected</div>
                </div>
                <button onClick={e => { e.stopPropagation(); selectAll(cat.id); }}
                  className="text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border transition-all press-effect"
                  style={{ color: allChecked ? cat.color : 'rgba(255,255,255,0.3)', borderColor: allChecked ? `${cat.color}40` : 'rgba(255,255,255,0.08)', background: allChecked ? `${cat.color}10` : 'transparent' }}>
                  {allChecked ? 'All ✓' : 'All'}
                </button>
                {isExp ? <ChevronUp className="w-4 h-4 text-white/25 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/25 flex-shrink-0" />}
              </div>
              <AnimatePresence initial={false}>
                {isExp && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.26 }} className="overflow-hidden">
                    <div className="px-4 pb-3">
                      <div className="border-t border-white/6 pt-2">
                        {cat.items.map(item => (
                          <ChecklistItem key={item.id} id={item.id} label={item.label} desc={item.desc}
                            checked={!!checked[item.id]} onToggle={() => toggleItem(item.id)} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </FrostedCard>
          );
        })}

        {/* Extra switches */}
        <FrostedCard delay={0.35} className="px-4 py-1 relative overflow-hidden">
          <ParticleField color="#00E5FF" count={8} className="opacity-15" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 py-3 border-b border-white/8 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-black text-[10px] tracking-widest uppercase">Extra Features</span>
            </div>
            {EXTRA_SWITCHES.map(sw => (
              <SwitchRow key={sw.id} id={sw.id} icon={sw.icon} label={sw.label}
                description={sw.description} onLabel={`${sw.label} — ON`} offLabel={`${sw.label} — OFF`} color={sw.color} />
            ))}
          </div>
        </FrostedCard>

        {/* FF Optimizer button */}
        <motion.button
          onClick={() => setShowProcess(true)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.012 }}
          className="w-full py-4 rounded-xl font-black text-xs tracking-[0.22em] uppercase relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#FF1744 0%,#8B0000 100%)', color: 'white', boxShadow: '0 0 32px rgba(255,23,68,0.45)' }}>
          {/* Shimmer */}
          <motion.div className="absolute inset-0 pointer-events-none"
            animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
          {/* Pulse glow */}
          <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{ boxShadow: ['0 0 20px rgba(255,23,68,0.4)', '0 0 40px rgba(255,23,68,0.7)', '0 0 20px rgba(255,23,68,0.4)'] }}
            transition={{ duration: 1.8, repeat: Infinity }} />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            FF Optimizer {totalChecked > 0 ? `(${totalChecked})` : ''}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
