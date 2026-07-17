import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    /*
     * Scroll architecture (critical — do NOT add overflow-hidden here):
     *
     *  html / body / #root  →  height: 100dvh, overflow: hidden  (set in index.css)
     *  outer shell          →  h-full flex-col  (inherits fixed height from root)
     *  inner shell          →  relative z-10 flex-col h-full
     *  <main>               →  flex-1 min-h-0 overflow-y-scroll
     *
     * The `min-h-0` on <main> is what makes flex + overflow-y work.
     * Without it, the flex child expands to content height and never scrolls.
     * `overflow-y-scroll` is more reliable than `auto` on mobile touch.
     */
    <div
      className="relative w-full max-w-[430px] mx-auto h-full flex flex-col shadow-2xl text-foreground"
      // NO overflow-hidden — it traps touch events and prevents child scroll
    >
      {/* ── Animated Background (its own overflow-hidden is fine — it's isolated) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-none">
        <img
          src="/bg.gif"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center bg-animate"
          style={{ filter: 'brightness(0.5) saturate(1.4)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(170deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.52) 40%, rgba(0,0,0,0.80) 100%)' }}
        />
        <div
          className="absolute inset-0 bg-energy-pulse"
          style={{ background: 'radial-gradient(ellipse 75% 55% at 70% 18%, rgba(0,190,255,0.18) 0%, transparent 65%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 55% 35% at 28% 88%, rgba(255,23,68,0.14) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.6) 2px,rgba(255,255,255,0.6) 3px)',
            backgroundSize: '100% 3px',
          }}
        />
        <AmbientParticles />
      </div>

      {/* ── App Shell ── */}
      <div className="relative z-10 flex flex-col h-full">
        <Header />

        {/*
         * THE scroll container.
         * flex-1      → takes all height left after Header
         * min-h-0     → allows flex to constrain height below content size (crucial!)
         * overflow-y-scroll → momentum scroll on iOS/Android
         * overflow-x-hidden → clips horizontal tab-slide animation bleed
         * pb-[72px]   → space above the fixed BottomNav
         */}
        <main
          className="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden pb-[72px]"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain',
          } as React.CSSProperties}
        >
          {children}
        </main>

        {/* BottomNav is fixed — rendered here for correct z-stacking only */}
        <BottomNav />
      </div>
    </div>
  );
}

function AmbientParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => {
        const left  = `${(i * 5.7  + 3)  % 100}%`;
        const top   = `${(i * 7.3  + 10) % 100}%`;
        const dur   = 6 + (i % 5) * 1.4;
        const delay = (i * 0.7) % 6;
        const size  = 1.5 + (i % 3) * 1;
        const color =
          i % 3 === 0 ? 'rgba(255,23,68,0.6)'
          : i % 3 === 1 ? 'rgba(0,229,255,0.5)'
          : 'rgba(255,200,0,0.4)';
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left, top,
              width:  `${size}px`,
              height: `${size}px`,
              background: color,
              boxShadow: `0 0 ${size * 3}px ${color}`,
              opacity: 0,
              animation: `float-particle ${dur}s infinite linear ${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
