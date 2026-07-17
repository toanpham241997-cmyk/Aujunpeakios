import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

/* ─────────────────────────────────────────────
   Top-screen processing modal (portal)
───────────────────────────────────────────── */
type Phase = 'processing' | 'success' | null;

function SwitchModal({ phase, label }: { phase: Phase; label: string }) {
  return createPortal(
    <AnimatePresence>
      {phase && (
        <motion.div
          key={phase}
          initial={{ y: -72, opacity: 0, scale: 0.88 }}
          animate={{ y: 0,   opacity: 1, scale: 1    }}
          exit={{    y: -72, opacity: 0, scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 520, damping: 30 }}
          className="fixed top-[10px] left-1/2 -translate-x-1/2 z-[9999]
                     flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
                     pointer-events-none select-none"
          style={{
            background:
              phase === 'success'
                ? 'linear-gradient(120deg,rgba(14,14,14,0.96),rgba(0,40,16,0.94))'
                : 'linear-gradient(120deg,rgba(14,14,14,0.96),rgba(80,0,10,0.94))',
            border:
              phase === 'success'
                ? '1px solid rgba(34,197,94,0.55)'
                : '1px solid rgba(255,23,68,0.55)',
            backdropFilter: 'blur(22px)',
            boxShadow:
              phase === 'success'
                ? '0 6px 32px rgba(34,197,94,0.28), 0 2px 8px rgba(0,0,0,0.7)'
                : '0 6px 32px rgba(255,23,68,0.28), 0 2px 8px rgba(0,0,0,0.7)',
            maxWidth: 300,
            minWidth: 200,
          }}
        >
          {/* Icon */}
          {phase === 'processing' ? (
            <div className="relative flex-shrink-0 w-[18px] h-[18px]">
              {/* spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
              />
              {/* inner dot pulse */}
              <motion.div
                animate={{ scale: [0.5, 1, 0.5], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.75, repeat: Infinity }}
                className="absolute inset-[4px] rounded-full bg-primary"
              />
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 700, damping: 18 }}
              className="flex-shrink-0 w-[18px] h-[18px] rounded-full bg-green-500
                         flex items-center justify-center"
              style={{ boxShadow: '0 0 10px rgba(34,197,94,0.8)' }}
            >
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
            </motion.div>
          )}

          {/* Text */}
          <div className="flex flex-col min-w-0">
            <span
              className="text-[11px] font-black tracking-wide truncate"
              style={{ color: phase === 'success' ? '#4ade80' : '#FF1744' }}
            >
              {phase === 'processing' ? 'Đang áp dụng...' : 'Thành công!'}
            </span>
            <span className="text-white/55 text-[9px] font-semibold truncate mt-[1px]">
              {label}
            </span>
          </div>

          {/* Right glow dot */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="flex-shrink-0 w-1.5 h-1.5 rounded-full ml-auto"
            style={{
              background: phase === 'success' ? '#22c55e' : '#FF1744',
              boxShadow:
                phase === 'success'
                  ? '0 0 6px rgba(34,197,94,0.9)'
                  : '0 0 6px rgba(255,23,68,0.9)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   SwitchRow component
───────────────────────────────────────────── */
interface SwitchRowProps {
  id: string;
  label: string;
  icon?: React.ReactNode | null;
  description?: string;
  onLabel?: string;
  offLabel?: string;
  color?: string; // kept for compat — toggle is always red when ON
}

const RED = '#FF1744';

export function SwitchRow({
  id,
  label,
  icon,
  description,
  onLabel,
  offLabel,
}: SwitchRowProps) {
  const { switches, setSwitchValue } = useAppContext();
  const on = switches[id] ?? false;
  const [modalPhase, setModalPhase] = useState<Phase>(null);

  const toggle = useCallback(() => {
    const next = !on;
    setSwitchValue(id, next);

    if (next) {
      // ON  → show processing → success → dismiss
      setModalPhase('processing');
      setTimeout(() => setModalPhase('success'),  1000);
      setTimeout(() => setModalPhase(null),        2000);
    }
    // OFF  → no modal (silent)
  }, [on, id, setSwitchValue]);

  return (
    <>
      <SwitchModal phase={modalPhase} label={onLabel || label} />

      <div
        className="flex items-center gap-2.5 py-2 border-b border-white/[0.05] last:border-0"
        onClick={toggle}
        style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Icon */}
        {icon !== null && icon !== undefined && (
          <motion.div
            animate={on
              ? { scale: 1, boxShadow: `0 0 10px ${RED}45` }
              : { scale: 1, boxShadow: '0 0 0px transparent' }
            }
            transition={{ duration: 0.25 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200"
            style={{
              background: on ? `${RED}1E` : 'rgba(255,255,255,0.05)',
              color:      on ? RED      : 'rgba(255,255,255,0.28)',
              border:     `1px solid ${on ? RED + '44' : 'transparent'}`,
            }}
          >
            {icon}
          </motion.div>
        )}

        {/* Label + description */}
        <div className="flex-1 min-w-0">
          <div
            className="font-bold leading-tight transition-colors duration-200 truncate"
            style={{
              fontSize: '11.5px',
              color: on ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.55)',
            }}
          >
            {label}
          </div>
          {description && (
            <div className="text-white/28 truncate" style={{ fontSize: '9px', marginTop: 1 }}>
              {description}
            </div>
          )}
        </div>

        {/* Toggle pill — always red when ON */}
        <button
          type="button"
          onClick={e => { e.stopPropagation(); toggle(); }}
          className="relative flex-shrink-0 rounded-full transition-all duration-250"
          style={{
            width: 38,
            height: 21,
            background: on
              ? `linear-gradient(135deg, #FF1744 0%, #c0000e 100%)`
              : 'rgba(255,255,255,0.09)',
            border: `1.5px solid ${on ? '#FF174488' : 'rgba(255,255,255,0.12)'}`,
            boxShadow: on ? '0 0 10px rgba(255,23,68,0.55)' : 'none',
          }}
        >
          <motion.div
            animate={{ x: on ? 17 : 2 }}
            transition={{ type: 'spring', stiffness: 550, damping: 32 }}
            className="absolute top-[2px] rounded-full"
            style={{
              width: 15,
              height: 15,
              background: '#000',
              boxShadow: on
                ? '0 0 0 1.5px rgba(255,23,68,0.5), 0 0 10px rgba(255,23,68,0.7), 0 1px 4px rgba(0,0,0,0.6)'
                : '0 0 0 1px rgba(255,255,255,0.18), 0 1px 4px rgba(0,0,0,0.5)',
            }}
          />
        </button>
      </div>
    </>
  );
}
