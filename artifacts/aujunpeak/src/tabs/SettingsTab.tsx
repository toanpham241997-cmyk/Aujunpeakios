import React, { useState } from 'react';
import {
  Globe, Info, MessageSquare, FileText, ChevronRight, Check, Star,
  ArrowLeft, Mail, Shield, Code2, Clock, Award, ExternalLink,
  Lock, Eye, Database, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { ParticleField } from '@/components/ui/ParticleField';
import { useAppContext } from '@/contexts/AppContext';
import { submitFeedback } from '@/lib/api';
import { toast } from 'sonner';

const LANGS = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'id', label: 'Indonesia',  flag: '🇮🇩' },
  { code: 'th', label: 'ภาษาไทย',    flag: '🇹🇭' },
  { code: 'ph', label: 'Filipino',   flag: '🇵🇭' },
  { code: 'my', label: 'Melayu',     flag: '🇲🇾' },
];

type SettingsView = 'main' | 'language' | 'about' | 'feedback' | 'policy';

/* ─── Back Header ─── */
function ViewHeader({ title, onBack, color = '#FF1744' }: { title: string; onBack: () => void; color?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-2 pb-4">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onBack}
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <ArrowLeft className="w-4 h-4 text-white/70" />
      </motion.button>
      <div className="flex-1">
        <div className="text-white font-black text-sm uppercase tracking-[0.2em]">{title}</div>
        <div className="h-0.5 w-8 mt-1 rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

/* ─── Language View ─── */
function LanguageView({ onBack }: { onBack: () => void }) {
  const { language, setLanguage } = useAppContext();
  return (
    <motion.div
      key="language"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className="space-y-4 pb-8"
    >
      <ViewHeader title="Select Language" onBack={onBack} color="#00E5FF" />
      <div className="px-4">
        <FrostedCard className="overflow-hidden">
          {LANGS.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                setLanguage(lang.code);
                toast.success(`Language: ${lang.label}`, {
                  style: { background: '#111', border: '1px solid rgba(0,229,255,0.3)', color: '#fff' },
                  duration: 2000,
                });
              }}
              className="w-full flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/4 active:bg-white/6 transition-colors text-left press-effect"
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className={`text-[13px] font-bold flex-1 ${language === lang.code ? 'text-[#00E5FF]' : 'text-white/70'}`}>
                {lang.label}
              </span>
              {language === lang.code && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#00E5FF22', border: '1px solid #00E5FF55' }}>
                    <Check className="w-3.5 h-3.5 text-[#00E5FF]" />
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </FrostedCard>
      </div>
    </motion.div>
  );
}

/* ─── About View ─── */
function AboutView({ onBack }: { onBack: () => void }) {
  const stats = [
    { label: 'Version', value: '2.1.0', icon: <Code2 className="w-4 h-4" />, color: '#FF1744' },
    { label: 'Build', value: '2025071401', icon: <Award className="w-4 h-4" />, color: '#00E5FF' },
    { label: 'Platform', value: 'Android / iOS', icon: <Globe className="w-4 h-4" />, color: '#22c55e' },
    { label: 'License', value: 'VIP', icon: <Star className="w-4 h-4" />, color: '#facc15' },
  ];

  const info = [
    { k: 'Developer', v: 'Aujunpeak Team' },
    { k: 'Support', v: 'Telegram @aujunpeak' },
    { k: 'Game Focus', v: 'Free Fire / PUBG / CODM' },
    { k: 'Engine', v: 'AJP Optimizer v3' },
    { k: 'Anti-Detect', v: 'Stealth Layer 2.0' },
    { k: 'Updated', v: 'July 2025' },
  ];

  return (
    <motion.div
      key="about"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className="space-y-4 pb-8"
    >
      <ViewHeader title="About Aujunpeak" onBack={onBack} color="#FF1744" />

      <div className="px-4 space-y-4">
        {/* Hero card */}
        <FrostedCard className="p-6 relative overflow-hidden">
          <ParticleField color="#FF1744" count={16} />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <motion.div
              animate={{ boxShadow: ['0 0 24px rgba(255,23,68,0.4)', '0 0 48px rgba(255,23,68,0.7)', '0 0 24px rgba(255,23,68,0.4)'] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black"
              style={{ background: 'linear-gradient(135deg, #FF1744, #8B0000)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <span className="text-white font-black text-3xl italic">A</span>
            </motion.div>
            <div className="text-center">
              <div className="text-white font-black text-xl uppercase tracking-[0.25em]">AUJUNPEAK</div>
              <div className="text-primary text-[10px] font-black tracking-widest mt-1 uppercase">Game Optimizer · VIP Edition</div>
            </div>
          </div>
        </FrostedCard>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
            >
              <FrostedCard className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30` }}>
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-white font-black text-sm truncate" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-white/35 text-[9px] font-bold uppercase tracking-wider">{s.label}</div>
                </div>
              </FrostedCard>
            </motion.div>
          ))}
        </div>

        {/* Info rows */}
        <FrostedCard className="overflow-hidden">
          {info.map((item, i) => (
            <motion.div
              key={item.k}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="flex justify-between items-center px-5 py-3.5 border-b border-white/5 last:border-0"
            >
              <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">{item.k}</span>
              <span className="text-white text-[11px] font-bold">{item.v}</span>
            </motion.div>
          ))}
        </FrostedCard>

        {/* Contact button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="w-full py-3.5 rounded-xl font-black text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        >
          <ExternalLink className="w-4 h-4" /> Join Telegram Community
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Feedback View ─── */
function FeedbackView({ onBack }: { onBack: () => void }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !rating) return;
    setSending(true);
    await submitFeedback({ title, content, type: 'feedback', rating });
    setSending(false);
    setTitle(''); setContent(''); setRating(0);
    toast.success('Feedback sent! Thank you 🙏', {
      style: { background: '#111', border: '1px solid rgba(34,197,94,0.4)', color: '#fff' },
      duration: 3000,
    });
  };

  return (
    <motion.div
      key="feedback"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className="space-y-4 pb-8"
    >
      <ViewHeader title="Send Feedback" onBack={onBack} color="#22c55e" />

      <div className="px-4 space-y-4">
        {/* Rating */}
        <FrostedCard className="p-5 relative overflow-hidden">
          <ParticleField color="#facc15" count={8} className="opacity-20" />
          <div className="relative z-10">
            <div className="text-white/45 text-[9px] font-black tracking-widest uppercase mb-3 text-center">Rate Your Experience</div>
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map(s => (
                <motion.button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.15 }}
                  className="press-effect"
                >
                  <Star
                    className="w-9 h-9 transition-all"
                    fill={s <= rating ? '#facc15' : 'transparent'}
                    style={{ color: s <= rating ? '#facc15' : 'rgba(255,255,255,0.15)', filter: s <= rating ? 'drop-shadow(0 0 8px #facc15)' : 'none' }}
                  />
                </motion.button>
              ))}
            </div>
            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-2 text-[10px] font-bold"
                style={{ color: '#facc15' }}
              >
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
              </motion.div>
            )}
          </div>
        </FrostedCard>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="text-white/35 text-[9px] font-black tracking-widest uppercase mb-1.5 px-1">Subject</div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's this about?"
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder:text-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${title ? 'rgba(255,23,68,0.4)' : 'rgba(255,255,255,0.08)'}` }}
            />
          </div>
          <div>
            <div className="text-white/35 text-[9px] font-black tracking-widest uppercase mb-1.5 px-1">Message</div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tell us more..."
              rows={5}
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder:text-white/20 resize-none transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${content ? 'rgba(255,23,68,0.4)' : 'rgba(255,255,255,0.08)'}` }}
            />
          </div>
          <motion.button
            type="submit"
            disabled={!title || !content || !rating || sending}
            whileTap={{ scale: 0.96 }}
            className="w-full h-12 font-black text-xs tracking-[0.2em] uppercase rounded-xl disabled:opacity-35 text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #22c55e, #166534)', boxShadow: '0 0 24px rgba(34,197,94,0.3)' }}
          >
            <Mail className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Feedback'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}

/* ─── Privacy Policy View ─── */
function PolicyView({ onBack }: { onBack: () => void }) {
  const sections = [
    {
      icon: <Database className="w-4 h-4" />,
      title: 'Data Collection',
      color: '#00E5FF',
      content: 'Aujunpeak does not collect, store, or sell any personal data. All optimization operations run entirely on your local device without transmitting data externally.',
    },
    {
      icon: <Lock className="w-4 h-4" />,
      title: 'License Validation',
      color: '#FF1744',
      content: 'License keys are validated against our secure API. Only a device-specific identifier is used to prevent multi-device abuse. No other personal information is collected.',
    },
    {
      icon: <Eye className="w-4 h-4" />,
      title: 'Data Sharing',
      color: '#22c55e',
      content: 'Usage data is never shared with third parties. We do not use advertising networks, analytics trackers, or any form of behavioral profiling.',
    },
    {
      icon: <Shield className="w-4 h-4" />,
      title: 'Security',
      color: '#a855f7',
      content: 'All API communications are encrypted with TLS 1.3. License keys are hashed and never stored in plain text. Stealth mode ensures optimizer processes remain hidden.',
    },
    {
      icon: <AlertCircle className="w-4 h-4" />,
      title: 'Terms of Use',
      color: '#facc15',
      content: 'By using Aujunpeak, you agree to use it only for lawful purposes and in accordance with the terms of service of the games you play. This software is provided "as is" without warranty.',
    },
  ];

  return (
    <motion.div
      key="policy"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className="space-y-4 pb-8"
    >
      <ViewHeader title="Privacy Policy" onBack={onBack} color="#facc15" />

      <div className="px-4 space-y-3">
        {/* Intro */}
        <FrostedCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <Shield className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <div className="text-white font-bold text-[12px]">Your Privacy Matters</div>
            <div className="text-white/35 text-[10px] mt-0.5">Last updated: July 2025</div>
          </div>
        </FrostedCard>

        {/* Sections */}
        {sections.map((sec, i) => (
          <motion.div
            key={sec.title}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 + i * 0.07 }}
          >
            <FrostedCard className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${sec.color}18`, color: sec.color, border: `1px solid ${sec.color}30` }}>
                  {sec.icon}
                </div>
                <div className="text-white font-black text-[11px] uppercase tracking-widest">{sec.title}</div>
              </div>
              <p className="text-white/50 text-[11px] leading-relaxed">{sec.content}</p>
            </FrostedCard>
          </motion.div>
        ))}

        <div className="text-white/20 text-[9px] uppercase tracking-widest text-center font-bold py-2">
          Aujunpeak v2.1.0 · All rights reserved
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Settings View ─── */
function MainView({ onNavigate }: { onNavigate: (v: SettingsView) => void }) {
  const { language } = useAppContext();
  const currentLang = LANGS.find(l => l.code === language) || LANGS[0];

  const rows = [
    { icon: <Globe className="w-5 h-5" />, color: '#00E5FF', label: 'Language', sub: `${currentLang.flag} ${currentLang.label}`, view: 'language' as SettingsView },
    { icon: <Info className="w-5 h-5" />, color: '#FF1744', label: 'About', sub: 'Aujunpeak v2.1.0 · VIP', view: 'about' as SettingsView },
    { icon: <MessageSquare className="w-5 h-5" />, color: '#22c55e', label: 'Feedback', sub: 'Rate & send comments', view: 'feedback' as SettingsView },
    { icon: <FileText className="w-5 h-5" />, color: '#facc15', label: 'Privacy Policy', sub: 'Terms of use & privacy', view: 'policy' as SettingsView },
  ];

  return (
    <motion.div
      key="main"
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className="space-y-4 pb-8"
    >
      {/* Header */}
      <FrostedCard delay={0.04} className="p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-400/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="text-white font-black text-xs tracking-[0.28em] uppercase mb-0.5">Settings</div>
          <div className="text-white/35 text-[10px] font-bold tracking-wider">App version 2.1.0 · Build 2025</div>
        </div>
      </FrostedCard>

      {/* Rows */}
      <FrostedCard delay={0.1} className="overflow-hidden divide-y divide-white/5">
        {rows.map((row, i) => (
          <motion.button
            key={row.label}
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.08 + i * 0.07 }}
            onClick={() => onNavigate(row.view)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/4 active:bg-white/6 transition-colors text-left press-effect"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: `${row.color}18`, color: row.color, border: `1px solid ${row.color}30` }}>
              {row.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm leading-tight">{row.label}</div>
              <div className="text-white/35 text-[10px] font-medium mt-0.5 truncate">{row.sub}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
          </motion.button>
        ))}
      </FrostedCard>
    </motion.div>
  );
}

/* ─── Main Export ─── */
export function SettingsTab() {
  const [view, setView] = useState<SettingsView>('main');

  return (
    <div className="p-4">
      <AnimatePresence mode="wait">
        {view === 'main' && <MainView key="main" onNavigate={setView} />}
        {view === 'language' && <LanguageView key="language" onBack={() => setView('main')} />}
        {view === 'about' && <AboutView key="about" onBack={() => setView('main')} />}
        {view === 'feedback' && <FeedbackView key="feedback" onBack={() => setView('main')} />}
        {view === 'policy' && <PolicyView key="policy" onBack={() => setView('main')} />}
      </AnimatePresence>
    </div>
  );
}
