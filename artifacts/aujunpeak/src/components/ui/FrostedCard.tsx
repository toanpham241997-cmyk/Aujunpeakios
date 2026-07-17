import React from 'react';
import { motion } from 'framer-motion';

interface FrostedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  dark?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  id?: string;
}

export function FrostedCard({
  children,
  delay = 0,
  className = '',
  dark = false,
  onClick,
  style,
  id,
}: FrostedCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.38, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        dark
          ? 'bg-black/55 border-white/10'
          : 'bg-black/40 border-white/12'
      } hover:border-white/22 hover:shadow-[0_6px_32px_rgba(0,0,0,0.5)] ${className}`}
      onClick={onClick}
      style={{
        boxShadow: '0 2px 24px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.04)',
        ...style,
      }}
    >
      {/* Subtle inner highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
      />
      {children}
    </motion.div>
  );
}
