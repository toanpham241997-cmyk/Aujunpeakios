import React, { useState, useEffect } from 'react';
import { MessageSquare, Bell, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/contexts/AppContext';

const FULL_TEXT = 'AUJUNPEAK';
const LETTER_COLORS = [
  '#FF1744','#FF4444','#FF1744','#FF6060',
  '#FF1744','#FF3333','#FF1744','#FF4444','#FF1744',
];

export function Header() {
  const { unreadNotifCount, notifications, markAllNotificationsRead, markNotificationRead } = useAppContext();
  const [visibleCount, setVisibleCount] = useState(0);
  const [loopKey, setLoopKey] = useState(0);
  const [glitching, setGlitching] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    let active = true;
    const run = () => {
      if (!active) return;
      setVisibleCount(0);
      setGlitching(false);
      let i = 0;
      const tick = () => {
        if (!active) return;
        if (i <= FULL_TEXT.length) {
          setVisibleCount(i);
          i++;
          setTimeout(tick, 110);
        } else {
          setTimeout(() => {
            if (!active) return;
            setGlitching(true);
            setTimeout(() => {
              if (!active) return;
              setGlitching(false);
              setLoopKey(k => k + 1);
              setTimeout(run, 300);
            }, 350);
          }, 2800);
        }
      };
      tick();
    };
    run();
    return () => { active = false; };
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full pt-[env(safe-area-inset-top,0px)]"
        style={{
          background: 'rgba(8,8,8,0.90)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,23,68,0.22)',
          boxShadow: '0 2px 24px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex h-14 items-center justify-between px-4 relative">
          {/* Scan-line texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.8) 2px,rgba(255,255,255,0.8) 3px)', backgroundSize: '100% 3px' }} />

          {/* Logo title */}
          <div className="flex flex-col select-none" style={{ minWidth: 140 }}>
            <div className="flex items-center text-xl font-black tracking-[0.18em]">
              {FULL_TEXT.split('').map((ch, i) => {
                const shown = i < visibleCount;
                const color = shown ? LETTER_COLORS[i] : 'transparent';
                const glitchOffset = glitching && shown ? (i % 2 === 0 ? -1.5 : 1.5) : 0;
                return (
                  <span
                    key={`${loopKey}-${i}`}
                    style={{
                      color,
                      textShadow: shown ? `0 0 14px ${color}cc, 0 0 32px ${color}55` : 'none',
                      opacity: shown ? 1 : 0,
                      transform: `translateX(${glitchOffset}px)`,
                      transition: 'opacity 0.07s, transform 0.05s',
                      display: 'inline-block',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
              <span className="inline-block w-[2px] h-5 bg-primary ml-1" style={{ animation: 'cursor-blink 1s step-end infinite', boxShadow: '0 0 8px rgba(255,23,68,0.9)' }} />
            </div>
            {/* Accent bar under AUJUNPEAK */}
            <div
              className="mt-[3px] h-[2px] rounded-full shimmer-bg"
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #FF1744 0%, #00E5FF 60%, transparent 100%)',
                boxShadow: '0 0 6px rgba(255,23,68,0.7)',
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setShowChat(true)} className="text-white/60 hover:text-white transition-colors press-effect">
              <MessageSquare className="w-[21px] h-[21px]" />
            </button>
            <button onClick={() => setShowNotif(!showNotif)} className="relative text-white/60 hover:text-white transition-colors press-effect">
              <Bell className="w-[21px] h-[21px]" />
              <AnimatePresence>
                {unreadNotifCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary rounded-full border-2 border-[#080808] flex items-center justify-center text-[8px] font-black text-white"
                    style={{ boxShadow: '0 0 8px rgba(255,23,68,0.8)' }}
                  >
                    {unreadNotifCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

        </div>
      </header>

      {/* Notification panel */}
      <AnimatePresence>
        {showNotif && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowNotif(false)} />
            <motion.div
              initial={{ y: -18, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -18, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="fixed top-14 left-0 right-0 z-50 max-w-[430px] mx-auto overflow-hidden"
              style={{ background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}
            >
              <div className="p-4 flex items-center justify-between border-b border-white/6">
                <h3 className="text-white font-black text-xs tracking-widest uppercase">Notifications</h3>
                <button onClick={() => { markAllNotificationsRead(); setShowNotif(false); }} className="text-[10px] font-black text-primary flex items-center gap-1.5 hover:opacity-80 press-effect">
                  <CheckCircle2 className="w-3 h-3" /> Mark all read
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-white/30 text-sm">No notifications</div>
                ) : notifications.map(n => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-4 border-b border-white/5 last:border-0 cursor-pointer transition-colors ${!n.read ? 'bg-white/[0.04] hover:bg-white/[0.07]' : 'hover:bg-white/[0.03]'}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 shrink-0">
                        <motion.div
                          animate={!n.read ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 rounded-full"
                          style={{ background: !n.read ? '#FF1744' : 'rgba(255,255,255,0.15)', boxShadow: !n.read ? '0 0 8px rgba(255,23,68,0.8)' : 'none' }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-[13px] mb-1 ${!n.read ? 'text-white font-bold' : 'text-white/60 font-medium'}`}>{n.title}</h4>
                        <p className="text-[11px] text-white/45 mb-1.5 leading-relaxed">{n.body}</p>
                        <span className="text-[9px] text-white/25 font-medium tracking-wider">{n.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat sheet */}
      <AnimatePresence>
        {showChat && <ChatDialog onClose={() => setShowChat(false)} />}
      </AnimatePresence>
    </>
  );
}

function ChatDialog({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! Welcome to Aujunpeak support. How can I help you today?', time: 'Just now' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text: input, time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Thank you for your message! An admin will respond shortly.', time: 'Just now' }]);
    }, 1800);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm max-w-[430px] mx-auto"
        onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto flex flex-col h-[80vh] rounded-t-3xl overflow-hidden"
        style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', boxShadow: '0 -12px 48px rgba(0,0,0,0.7)' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="h-14 flex items-center justify-between px-5 border-b border-white/6">
          <div>
            <h3 className="text-white font-black text-sm">Aujunpeak Support</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-green-500 rounded-full"
              />
              <span className="text-[10px] text-white/45">Auto bot · Waiting for admin</span>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:text-white press-effect">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-white/10 text-white/90 rounded-tl-sm border border-white/6'
              }`}
              style={msg.sender === 'user' ? { boxShadow: '0 4px 16px rgba(255,23,68,0.3)' } : {}}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-white/25 mt-1 px-1">{msg.time}</span>
            </motion.div>
          ))}
        </div>

        <div className="p-4 border-t border-white/6" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-all placeholder:text-white/25"
            />
            <motion.button
              type="submit"
              disabled={!input.trim()}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white disabled:opacity-40 shrink-0"
              style={{ boxShadow: '0 0 16px rgba(255,23,68,0.4)' }}
            >
              <MessageSquare className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </>
  );
}
