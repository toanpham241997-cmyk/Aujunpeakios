import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { KeyRound, Lock, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAppContext } from '@/contexts/AppContext';
import { verifyKey } from '@/lib/api';
import { ParticleField } from '@/components/ui/ParticleField';
import { toast } from 'sonner';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export function LoginScreen() {
  const [, setLocation] = useLocation();
  const { authState, setAuthState, deviceId, setCurrentTab } = useAppContext();
  const [keyInput, setKeyInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  /* ── Google OAuth ── */
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(r => r.json());

        const googleUser = {
          avatar: userInfo.picture ?? null,
          name:   userInfo.name   ?? 'Google User',
          email:  userInfo.email  ?? '',
          sub:    userInfo.sub    ?? '',
        };
        setAuthState({ ...authState, googleUser });
        toast.success(`Xin chào, ${googleUser.name}!`, {
          style: { background: '#111', border: '1px solid rgba(66,133,244,0.4)', color: '#fff' },
        });
        setCurrentTab('profile');
        setLocation('/');
      } catch {
        toast.error('Không lấy được thông tin Google.', {
          style: { background: '#111', border: '1px solid rgba(255,23,68,0.4)', color: '#fff' },
        });
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      toast.error('Đăng nhập Google thất bại.', {
        style: { background: '#111', border: '1px solid rgba(255,23,68,0.4)', color: '#fff' },
      });
    },
  });

  /* ── Key login ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await verifyKey(keyInput.trim(), deviceId, navigator.userAgent);
      setStatus('success');
      setTimeout(() => {
        setAuthState({
          isLoggedIn: true,
          keyData: res.data,
          googleUser: authState.googleUser,
        });
        setCurrentTab('home');
        setLocation('/');
      }, 900);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Key không hợp lệ.');
    }
  };

  const raindrops = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${(i * 3.33) % 100}%`,
    delay: `${(i * 0.07) % 2}s`,
    duration: `${0.8 + (i % 7) * 0.1}s`,
  }));

  return (
    <div className="fixed inset-0 z-[100] bg-[#080808] max-w-[430px] mx-auto flex flex-col overflow-hidden">
      {/* BG image */}
      <div className="absolute inset-0 pointer-events-none">
        <img src="/bg.gif" alt="" className="w-full h-full object-cover opacity-10" draggable={false} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.5) 50%, rgba(8,8,8,0.85) 100%)' }} />
      </div>

      {/* Code rain */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
        {raindrops.map(d => (
          <div key={d.id} className="absolute text-primary text-[10px] font-mono font-black select-none"
            style={{ left: d.left, top: '-20px', animationName: 'code-rain', animationDuration: d.duration, animationDelay: d.delay, animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}>
            {String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))}
          </div>
        ))}
      </div>

      {/* Particles */}
      <ParticleField color="#FF1744" count={18} className="opacity-25" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col flex-1 px-6 pt-16 pb-8 overflow-y-auto">

        {/* Logo */}
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 relative"
            style={{ background: 'rgba(255,23,68,0.12)', border: '1px solid rgba(255,23,68,0.3)', boxShadow: '0 0 40px rgba(255,23,68,0.2)' }}>
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Lock className="w-9 h-9 text-primary" />
            </motion.div>
            <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,23,68,0.18), transparent 70%)' }} />
          </div>
          <h1 className="text-2xl font-black tracking-[0.25em] uppercase text-white mb-1"
            style={{ textShadow: '0 0 24px rgba(255,23,68,0.6)' }}>AUJUNPEAK</h1>
          <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase">Game Optimizer · Pro Edition</p>
        </motion.div>

        {/* Key form */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.12 }}
          className="w-full space-y-4">

          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(16,16,16,0.85)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>

            <div className="flex items-center gap-2 pb-1">
              <KeyRound className="w-4 h-4 text-primary" />
              <span className="text-white/60 text-[10px] font-black tracking-widest uppercase">Kích hoạt Key</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={keyInput}
                  onChange={e => { setKeyInput(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                  placeholder="Nhập key của bạn..."
                  autoComplete="off"
                  autoCapitalize="characters"
                  className="w-full h-14 bg-black/40 border rounded-xl px-4 pr-12 text-sm font-mono font-bold text-white placeholder:text-white/20 focus:outline-none transition-all tracking-widest"
                  style={{
                    borderColor: status === 'error' ? 'rgba(255,23,68,0.6)' : status === 'success' ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.1)',
                    boxShadow: status === 'success' ? '0 0 20px rgba(34,197,94,0.2)' : 'none',
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <KeyRound className="w-4 h-4" style={{ color: status === 'error' ? '#FF1744' : status === 'success' ? '#22c55e' : 'rgba(255,255,255,0.2)' }} />
                </div>
              </div>

              <AnimatePresence>
                {errorMsg && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-[11px] font-bold px-1" style={{ color: '#FF1744' }}>
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Activate button */}
              <motion.button
                type="submit"
                disabled={!keyInput.trim() || status === 'loading' || status === 'success'}
                whileTap={{ scale: 0.96 }}
                className="w-full h-14 rounded-xl font-black text-xs tracking-[0.25em] uppercase relative overflow-hidden disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#FF1744 0%,#8B0000 100%)', color: 'white', boxShadow: '0 0 30px rgba(255,23,68,0.4)' }}
              >
                <motion.div className="absolute inset-0 pointer-events-none"
                  animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {status === 'loading' ? (
                    <>
                      {['-0.32s', '-0.16s', '0s'].map((d, i) => (
                        <span key={i} className="w-2 h-2 bg-white rounded-full inline-block"
                          style={{ animation: `bounce-dot 1.4s infinite ease-in-out both`, animationDelay: d }} />
                      ))}
                    </>
                  ) : status === 'success' ? (
                    <><span className="text-green-300">✓</span> Kích hoạt thành công!</>
                  ) : (
                    <><KeyRound className="w-4 h-4" /> Kích hoạt Key</>
                  )}
                </span>
              </motion.button>

              {/* GET KEY FREE button */}
              <motion.button
                type="button"
                onClick={() => setLocation('/free-key')}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.01 }}
                className="w-full h-12 rounded-xl font-black text-[11px] tracking-[0.2em] uppercase relative overflow-hidden flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(0,180,200,0.08) 100%)',
                  border: '1px solid rgba(0,229,255,0.35)',
                  color: '#00E5FF',
                  boxShadow: '0 0 20px rgba(0,229,255,0.15)',
                }}
              >
                <motion.div className="absolute inset-0 pointer-events-none"
                  animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.12), transparent)' }} />
                <Gift className="w-4 h-4 relative z-10" />
                <span className="relative z-10">GET KEY FREE</span>
                <motion.div className="absolute right-4 z-10"
                  animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <span className="text-[#00E5FF] text-xs">›</span>
                </motion.div>
              </motion.button>
            </form>
          </div>

          {/* Google login */}
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: 'rgba(16,16,16,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
            {CLIENT_ID ? (
              <motion.button
                onClick={() => { setGoogleLoading(true); googleLogin(); }}
                disabled={googleLoading}
                whileTap={{ scale: 0.96 }}
                className="w-full h-14 bg-white text-black font-black tracking-widest uppercase text-xs rounded-xl flex items-center justify-center gap-3 relative overflow-hidden disabled:opacity-70"
                style={{ boxShadow: '0 4px 24px rgba(255,255,255,0.15)' }}
              >
                {googleLoading ? (
                  <div className="flex items-center gap-2">
                    {['-0.32s', '-0.16s', '0s'].map((d, i) => (
                      <span key={i} className="w-2 h-2 bg-black rounded-full"
                        style={{ animation: `bounce-dot 1.4s infinite ease-in-out both`, animationDelay: d }} />
                    ))}
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Đăng nhập với Google
                  </>
                )}
              </motion.button>
            ) : (
              <div className="w-full h-14 rounded-xl border border-white/10 flex items-center justify-center gap-3 opacity-40 cursor-not-allowed">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-white text-xs font-black tracking-wider">Đăng nhập với Google</span>
              </div>
            )}
            <p className="text-white/20 text-[9px] font-bold text-center tracking-wider uppercase">
              Google → mở Settings · Key FREE → mở Home+Settings · Key VIP → toàn bộ
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
