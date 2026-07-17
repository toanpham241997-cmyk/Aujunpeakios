import React, { useState, useMemo, useEffect } from 'react';
import {
  User, KeyRound, LogOut, LogIn, Crown, Clock, Shield, Copy, Check,
  Zap, Wifi, MemoryStick, AlertTriangle, CheckCircle2, Star,
  Activity, Smartphone, Key, RefreshCw, Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { ParticleField } from '@/components/ui/ParticleField';
import { WaveBar } from '@/components/ui/WaveBar';
import { useAppContext, isFreeKey, isVipKey } from '@/contexts/AppContext';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { getLoginHistory, type LoginHistoryItem } from '@/lib/api';

const STATS = [
  { label: 'Sessions', value: '47',    icon: <Activity    className="w-3.5 h-3.5" />, color: '#FF1744' },
  { label: 'Optimized', value: '2.3K', icon: <Zap         className="w-3.5 h-3.5" />, color: '#00E5FF' },
  { label: 'Ping',      value: '-18ms',icon: <Wifi        className="w-3.5 h-3.5" />, color: '#22c55e' },
  { label: 'RAM',       value: '4.1GB',icon: <MemoryStick className="w-3.5 h-3.5" />, color: '#a855f7' },
];

function getKeyStatus(expiry: string | null) {
  if (!expiry) return { label: 'ACTIVE', color: '#22c55e', bgColor: 'rgba(34,197,94,0.12)', icon: <CheckCircle2 className="w-3.5 h-3.5" />, daysLeft: null };
  try {
    const exp = new Date(expiry);
    const now = new Date();
    const diff = Math.ceil((exp.getTime() - now.getTime()) / 86_400_000);
    if (diff < 0) return { label: 'EXPIRED',  color: '#FF1744', bgColor: 'rgba(255,23,68,0.15)',  icon: <AlertTriangle className="w-3.5 h-3.5" />, daysLeft: 0 };
    if (diff <= 7) return { label: 'EXPIRING', color: '#facc15', bgColor: 'rgba(250,204,21,0.12)', icon: <AlertTriangle className="w-3.5 h-3.5" />, daysLeft: diff };
    return { label: 'ACTIVE', color: '#22c55e', bgColor: 'rgba(34,197,94,0.12)', icon: <CheckCircle2 className="w-3.5 h-3.5" />, daysLeft: diff };
  } catch {
    return { label: 'ACTIVE', color: '#22c55e', bgColor: 'rgba(34,197,94,0.12)', icon: <CheckCircle2 className="w-3.5 h-3.5" />, daysLeft: null };
  }
}

function KeyCopyRow({ keyValue }: { keyValue: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(keyValue).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Key đã sao chép!', { style: { background: '#111', border: '1px solid rgba(255,23,68,0.3)', color: '#fff' }, duration: 1800 });
  };
  return (
    <motion.div whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer press-effect"
      style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
      onClick={handleCopy}>
      <span className="flex-1 font-mono text-primary text-sm font-bold tracking-widest truncate">{keyValue}</span>
      <AnimatePresence mode="wait">
        {copied
          ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="w-4 h-4 text-green-400 flex-shrink-0" /></motion.div>
          : <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy className="w-4 h-4 text-white/35 flex-shrink-0" /></motion.div>}
      </AnimatePresence>
    </motion.div>
  );
}

function KeyStatusCard({ keyData }: { keyData: any }) {
  const expiry = keyData.expiryDate || keyData.expiry || null;
  const status = useMemo(() => getKeyStatus(expiry), [expiry]);
  const pct = status.daysLeft != null ? Math.min(100, (status.daysLeft / 365) * 100) : 85;
  const keyType = (keyData.type || keyData.tier || 'free').toUpperCase();
  const isVip = isVipKey(keyData);

  return (
    <FrostedCard className="p-5 relative overflow-hidden">
      <ParticleField color="#FF1744" count={8} className="opacity-20" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: isVip ? 'rgba(250,204,21,0.15)' : 'rgba(0,229,255,0.12)', border: `1px solid ${isVip ? 'rgba(250,204,21,0.3)' : 'rgba(0,229,255,0.25)'}` }}>
              {isVip ? <Crown className="w-4 h-4 text-yellow-400" /> : <Key className="w-4 h-4 text-[#00E5FF]" />}
            </div>
            <div>
              <div className="text-white font-black text-xs tracking-widest uppercase">{keyType} Key</div>
              <div className="text-white/30 text-[9px] font-bold mt-0.5">
                {keyData.maxDevices || 1} thiết bị · {keyData.deviceCount ?? 0} đang dùng
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: status.bgColor, border: `1px solid ${status.color}30` }}>
            <span style={{ color: status.color }}>{status.icon}</span>
            <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: status.color }}>{status.label}</span>
          </div>
        </div>

        <KeyCopyRow keyValue={keyData.keyValue || keyData.key || '—'} />

        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-bold">
            <span className="text-white/30 uppercase tracking-widest flex items-center gap-1">
              <Clock className="w-3 h-3" /> Hết hạn
            </span>
            <span style={{ color: status.color }}>
              {expiry
                ? status.daysLeft != null
                  ? status.daysLeft > 0 ? `${status.daysLeft} ngày` : 'Hôm nay'
                  : 'Vô hạn'
                : 'Vĩnh viễn'}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${status.color}, ${status.color}88)`, boxShadow: `0 0 8px ${status.color}60` }} />
          </div>
          <div className="text-white/20 text-[8px] font-bold tracking-widest">
            {expiry ? new Date(expiry).toLocaleDateString('vi-VN') : 'Không giới hạn'}
          </div>
        </div>

        <div className="flex gap-1 h-6">
          {Array.from({ length: 20 }).map((_, i) => <WaveBar key={i} index={i} color={isVip ? '#facc15' : '#FF1744'} />)}
        </div>
      </div>
    </FrostedCard>
  );
}

function LoginHistorySection({ keyValue }: { keyValue: string }) {
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (showLoader = false) => {
    if (showLoader) setRefreshing(true);
    try {
      const data = await getLoginHistory(keyValue, 10);
      setHistory(data);
    } catch {
      // keep empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [keyValue]);

  const formatUA = (ua: string | null) => {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Samsung')) return 'Samsung Galaxy';
    if (ua.includes('Redmi') || ua.includes('Mi ')) return 'Xiaomi Device';
    if (ua.includes('OPPO')) return 'OPPO Device';
    if (ua.includes('vivo')) return 'Vivo Device';
    if (ua.includes('Huawei')) return 'Huawei Device';
    if (ua.includes('Android')) return 'Android Device';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Mac')) return 'Mac';
    return 'Mobile Device';
  };

  return (
    <FrostedCard delay={0.22} className="p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-white font-black text-[10px] tracking-widest uppercase">Login History</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/20 text-[8px] font-bold uppercase tracking-wider">{history.length} sessions</span>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => load(true)}
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <motion.div animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.6, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw className="w-3 h-3 text-white/40" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="py-4 flex justify-center">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="py-4 text-center text-white/25 text-[10px] font-bold uppercase tracking-wider">
          Chưa có lịch sử đăng nhập
        </div>
      ) : (
        history.map((h, i) => (
          <motion.div key={h.id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Smartphone className="w-3.5 h-3.5 text-white/30" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[11px] font-bold truncate">{formatUA(h.userAgent)}</div>
              <div className="text-white/25 text-[9px] font-medium mt-0.5">
                {new Date(h.createdAt).toLocaleString('vi-VN')}
                {h.ipAddress ? ` · ${h.ipAddress}` : ''}
              </div>
            </div>
            <span className="text-green-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border border-green-500/20 flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.08)' }}>{h.action}</span>
          </motion.div>
        ))
      )}
    </FrostedCard>
  );
}

/* ─────────────────────────────────────────────────────
   Floating orbs visible over the gif background
──────────────────────────────────────────────────── */
function BgOrbs({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* top bloom */}
      <motion.div
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-[90px]"
        style={{ background: `radial-gradient(circle, ${color}28 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* bottom bloom */}
      <motion.div
        className="absolute -bottom-10 right-0 w-56 h-56 rounded-full blur-[80px]"
        style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.22, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      />
    </div>
  );
}

export function ProfileTab() {
  const { authState, setAuthState, setCurrentTab } = useAppContext();
  const [, setLocation] = useLocation();
  const { isLoggedIn, keyData, googleUser } = authState;

  const handleLogout = () => {
    setAuthState({ isLoggedIn: false, keyData: null, googleUser: null });
    setCurrentTab('profile');
    toast.success('Đã đăng xuất', { style: { background: '#111', border: '1px solid rgba(255,23,68,0.3)', color: '#fff' } });
  };

  const handleLogoutKeyOnly = () => {
    setAuthState({ ...authState, isLoggedIn: false, keyData: null });
    setCurrentTab('profile');
    toast.success('Đã xóa key', { style: { background: '#111', border: '1px solid rgba(255,23,68,0.3)', color: '#fff' } });
  };

  /* ── Not logged in ── */
  if (!isLoggedIn && !googleUser) {
    return (
      /* NO background here — MainLayout's bg.gif shows through */
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 pb-24 relative">
        <BgOrbs color="#FF1744" />
        <ParticleField color="#FF1744" count={14} className="opacity-25" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="relative z-10 flex flex-col items-center gap-6 w-full max-w-xs">

          {/* Icon */}
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.8, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl blur-xl"
              style={{ background: 'rgba(255,23,68,0.35)' }}
            />
            <motion.div
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: 'rgba(255,23,68,0.12)',
                border: '1.5px solid rgba(255,23,68,0.35)',
                boxShadow: '0 0 40px rgba(255,23,68,0.25), inset 0 0 24px rgba(255,23,68,0.08)',
              }}>
              <User className="w-12 h-12 text-primary" style={{ filter: 'drop-shadow(0 0 10px rgba(255,23,68,0.8))' }} />
            </motion.div>
          </div>

          {/* Text */}
          <div className="text-center space-y-2">
            <h2 className="text-white font-black text-xl uppercase tracking-[0.2em]"
              style={{ textShadow: '0 0 20px rgba(255,23,68,0.5)' }}>
              Chưa đăng nhập
            </h2>
            <p className="text-white/35 text-[11px] font-bold leading-relaxed tracking-wide">
              Kích hoạt key để sử dụng<br />đầy đủ tính năng Aujunpeak
            </p>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,23,68,0.35))' }} />
            <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">hoặc</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,23,68,0.35), transparent)' }} />
          </div>

          {/* Login button */}
          <motion.button onClick={() => setLocation('/login')} whileTap={{ scale: 0.95 }}
            className="w-full h-14 rounded-2xl font-black text-sm tracking-[0.2em] uppercase relative overflow-hidden flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg,#FF1744 0%,#8B0000 100%)',
              color: 'white',
              boxShadow: '0 0 40px rgba(255,23,68,0.5), 0 8px 24px rgba(0,0,0,0.5)',
            }}>
            {/* shimmer */}
            <motion.div className="absolute inset-0 pointer-events-none"
              animate={{ x: ['-120%', '220%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)', skewX: '-12deg' }}
            />
            <LogIn className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Đăng nhập / Kích hoạt Key</span>
          </motion.button>

          {/* Info chips */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {[
              { color: '#00E5FF', label: 'Free Key → Home' },
              { color: '#facc15', label: 'VIP → Tất cả' },
            ].map(c => (
              <div key={c.label} className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest"
                style={{ background: `${c.color}12`, border: `1px solid ${c.color}28`, color: c.color }}>
                {c.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Google only (no key) ── */
  if (googleUser && !isLoggedIn) {
    return (
      <div className="min-h-screen overflow-y-auto overscroll-contain pb-24 relative"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <BgOrbs color="#4285F4" />
        <ParticleField color="#4285F4" count={10} className="opacity-15" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 px-4 pt-6 space-y-4">
          <FrostedCard className="p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/15"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              {googleUser.avatar
                ? <img src={googleUser.avatar} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{googleUser.name[0]}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-black text-sm truncate">{googleUser.name}</div>
              <div className="text-white/40 text-[10px] font-bold mt-0.5 truncate">{googleUser.email}</div>
              <div className="flex items-center gap-1 mt-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest">Google Connected</span>
              </div>
            </div>
          </FrostedCard>
          <FrostedCard className="p-5 text-center space-y-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Lock className="w-8 h-8 text-primary mx-auto" style={{ filter: 'drop-shadow(0 0 8px rgba(255,23,68,0.6))' }} />
            </motion.div>
            <div className="text-white font-black text-sm tracking-wide">Cần Key để mở tính năng</div>
            <div className="text-white/30 text-[10px] font-bold leading-relaxed">
              Key FREE → Home + Settings<br />Key VIP → Toàn bộ tính năng
            </div>
            <motion.button onClick={() => setLocation('/login')} whileTap={{ scale: 0.96 }}
              className="w-full py-3 rounded-xl font-black text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#FF1744,#8B0000)', color: 'white', boxShadow: '0 0 24px rgba(255,23,68,0.4)' }}>
              <KeyRound className="w-4 h-4" /> Kích hoạt Key
            </motion.button>
          </FrostedCard>
          <motion.button onClick={handleLogout} whileTap={{ scale: 0.96 }}
            className="w-full py-3 rounded-xl font-black text-[11px] tracking-[0.2em] uppercase border border-red-500/20 text-red-400/70 flex items-center justify-center gap-2 press-effect"
            style={{ background: 'rgba(255,23,68,0.04)' }}>
            <LogOut className="w-4 h-4" /> Đăng xuất
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ── Key activated ── */
  const keyStr = keyData?.keyValue || keyData?.key || '';
  const vip = isVipKey(keyData);
  const free = isFreeKey(keyData);
  const keyType = (keyData?.type || keyData?.tier || 'free').toUpperCase();
  const accentColor = vip ? '#facc15' : '#FF1744';

  return (
    <div className="min-h-screen overflow-y-auto overscroll-contain pb-24 relative"
      style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      <BgOrbs color={accentColor} />
      <ParticleField color={accentColor} count={10} className="opacity-15" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-4 pt-6 space-y-4">

        {/* User card */}
        <FrostedCard className="p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: vip ? 'linear-gradient(90deg,rgba(250,204,21,0.07) 0%,transparent 60%)' : 'linear-gradient(90deg,rgba(255,23,68,0.05) 0%,transparent 60%)' }} />
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/15"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            {googleUser?.avatar
              ? <img src={googleUser.avatar} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  {vip ? <Crown className="w-7 h-7 text-yellow-400" /> : <Key className="w-7 h-7 text-[#00E5FF]" />}
                </div>}
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <div className="text-white font-black text-sm truncate">{googleUser?.name || 'Aujunpeak User'}</div>
            {googleUser?.email && <div className="text-white/40 text-[10px] font-bold mt-0.5 truncate">{googleUser.email}</div>}
            <div className="flex items-center gap-1 mt-1.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: vip ? '#facc15' : '#00E5FF' }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: vip ? '#facc15' : '#00E5FF' }}>
                {keyType} Member
              </span>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <WaveBar key={i} index={i} color={vip ? '#facc15' : '#FF1744'} />
            ))}
          </div>
        </FrostedCard>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {STATS.map((s, idx) => (
            <motion.div key={s.label}
              initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-xl px-1.5 py-2.5 text-center border"
              style={{ background: `${s.color}10`, borderColor: `${s.color}22` }}>
              <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
              <div className="font-black text-[10px] tabular-nums" style={{ color: s.color }}>{s.value}</div>
              <div className="text-white/25 text-[7px] font-black uppercase tracking-widest mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Free key notice */}
        {free && (
          <FrostedCard className="p-4 flex items-center gap-3 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(90deg,rgba(0,229,255,0.06) 0%,transparent 60%)' }} />
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.25)' }}>
              <Lock className="w-4 h-4 text-[#00E5FF]" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <div className="text-[#00E5FF] font-black text-[10px] uppercase tracking-widest">Key FREE đang hoạt động</div>
              <div className="text-white/30 text-[9px] font-bold mt-0.5">Home + Settings mở · Game + Function bị khóa</div>
            </div>
          </FrostedCard>
        )}

        {/* Key status */}
        <KeyStatusCard keyData={keyData} />

        {/* Login history */}
        {keyStr && <LoginHistorySection keyValue={keyStr} />}

        {/* VIP badge */}
        {vip && (
          <FrostedCard delay={0.3} className="px-5 py-4 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg,rgba(250,204,21,0.07) 0%,transparent 60%)' }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.25)' }}>
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}>
                <Star className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <div className="text-yellow-400 font-black text-[11px] uppercase tracking-widest">VIP Priority Access</div>
              <div className="text-white/30 text-[9px] font-bold mt-0.5">All features · Fastest servers · Priority support</div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-yellow-400/60 flex-shrink-0" />
          </FrostedCard>
        )}

        {/* Logout */}
        <div className="space-y-2">
          {googleUser && (
            <motion.button onClick={handleLogoutKeyOnly} whileTap={{ scale: 0.96 }}
              className="w-full py-3 rounded-xl font-black text-[11px] tracking-[0.2em] uppercase border border-white/10 text-white/40 flex items-center justify-center gap-2 press-effect"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <KeyRound className="w-4 h-4" /> Xóa Key · Giữ Google
            </motion.button>
          )}
          <motion.button onClick={handleLogout} whileTap={{ scale: 0.96 }}
            className="w-full py-3 rounded-xl font-black text-[11px] tracking-[0.2em] uppercase border border-red-500/20 text-red-400/70 flex items-center justify-center gap-2 press-effect"
            style={{ background: 'rgba(255,23,68,0.04)' }}>
            <LogOut className="w-4 h-4" /> Đăng xuất hoàn toàn
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
