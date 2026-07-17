import React, { useRef } from 'react';
import { Home, Gamepad2, User, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext, TabType, getLockedTabs } from '@/contexts/AppContext';

export function BottomNav() {
  const { currentTab, setCurrentTab, authState } = useAppContext();
  const lockedTabs = getLockedTabs(authState);

  const tabs: { id: TabType; icon?: React.ElementType; iconClass?: string; label: string }[] = [
    { id: 'home',     icon: Home,                        label: 'Home' },
    { id: 'game',     icon: Gamepad2,                    label: 'Game' },
    { id: 'function', iconClass: 'fi fi-sr-apps',        label: 'Function' },
    { id: 'settings', iconClass: 'fi fi-sr-module',      label: 'Settings' },
    { id: 'profile',  icon: User,                        label: 'Profile' },
  ];

  return (
    <nav
      className="fixed bottom-0 w-full max-w-[430px] z-50 pb-[env(safe-area-inset-bottom,0px)]"
      style={{
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,23,68,0.22)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.55)',
      }}
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 w-full h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,23,68,0.6) 30%, rgba(0,229,255,0.3) 70%, transparent)', boxShadow: '0 0 12px rgba(255,23,68,0.5)' }}
      />

      <div className="flex items-center justify-around h-[62px] px-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const isLocked = lockedTabs.includes(tab.id);
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              whileTap={{ scale: isLocked ? 0.88 : 0.82 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="relative flex flex-col items-center justify-center w-full h-full overflow-visible"
              style={{ opacity: isLocked ? 0.42 : 1 }}
            >
              {/* Active background pill */}
              <AnimatePresence>
                {isActive && !isLocked && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-x-1 inset-y-1.5 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{ background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.2)' }}
                  />
                )}
              </AnimatePresence>

              {/* Glow blob */}
              <AnimatePresence>
                {isActive && !isLocked && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="w-10 h-10 rounded-full blur-xl" style={{ background: 'rgba(255,23,68,0.35)' }} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative z-10 flex flex-col items-center gap-0.5">
                {/* Active indicator dot */}
                <AnimatePresence>
                  {isActive && !isLocked && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                      className="absolute -top-3.5 w-1 h-1 rounded-full"
                      style={{ background: '#FF1744', boxShadow: '0 0 6px rgba(255,23,68,0.9)' }}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  animate={isActive && !isLocked ? { y: -1, scale: 1.12 } : { y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  className="relative"
                >
                  {Icon ? (
                    <Icon
                      style={{
                        width: 22, height: 22,
                        color: isLocked ? 'rgba(255,255,255,0.22)' : isActive ? '#FF1744' : 'rgba(255,255,255,0.38)',
                        filter: isActive && !isLocked ? 'drop-shadow(0 0 6px rgba(255,23,68,0.7))' : 'none',
                        transition: 'color 0.2s ease, filter 0.2s ease',
                      }}
                    />
                  ) : (
                    <i
                      className={tab.iconClass}
                      style={{
                        fontSize: 20, lineHeight: 1, width: 22, height: 22,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isLocked ? 'rgba(255,255,255,0.22)' : isActive ? '#FF1744' : 'rgba(255,255,255,0.38)',
                        filter: isActive && !isLocked ? 'drop-shadow(0 0 6px rgba(255,23,68,0.7))' : 'none',
                        transition: 'color 0.2s ease, filter 0.2s ease',
                      }}
                    />
                  )}

                  {/* Lock badge */}
                  {isLocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(8,8,8,0.95)', border: '1px solid rgba(255,23,68,0.5)' }}
                    >
                      <Lock style={{ width: 7, height: 7, color: 'rgba(255,23,68,0.8)' }} />
                    </motion.div>
                  )}
                </motion.div>

                <motion.span
                  animate={isActive && !isLocked ? { opacity: 1 } : { opacity: isLocked ? 0.35 : 0.38 }}
                  transition={{ duration: 0.18 }}
                  className="text-[9px] font-black tracking-wider uppercase"
                  style={{ color: isActive && !isLocked ? '#FF1744' : undefined }}
                >
                  {tab.label}
                </motion.span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
