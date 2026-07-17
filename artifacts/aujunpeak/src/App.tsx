import React, { useState, useRef } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider, useAppContext, TabType, getLockedTabs } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { FreeKeyScreen } from '@/screens/FreeKeyScreen';
import { HomeTab } from '@/tabs/HomeTab';
import { GameTab } from '@/tabs/GameTab';
import { FunctionTab } from '@/tabs/FunctionTab';
import { SettingsTab } from '@/tabs/SettingsTab';
import { ProfileTab } from '@/tabs/ProfileTab';
import { LockedTabScreen } from '@/components/ui/LockedTabScreen';
import NotFound from '@/pages/not-found';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string || '';

const TAB_ORDER: TabType[] = ['home', 'game', 'function', 'settings', 'profile'];

function getDirection(prev: TabType, next: TabType) {
  const pi = TAB_ORDER.indexOf(prev);
  const ni = TAB_ORDER.indexOf(next);
  return ni > pi ? 1 : -1;
}

function TabRouter() {
  const { currentTab, authState } = useAppContext();
  const prevTabRef = useRef<TabType>(currentTab);
  const [displayTab, setDisplayTab] = React.useState<TabType>(currentTab);
  const dir = useRef(1);

  React.useLayoutEffect(() => {
    if (currentTab !== displayTab) {
      dir.current = getDirection(prevTabRef.current, currentTab);
      prevTabRef.current = currentTab;
      setDisplayTab(currentTab);
    }
  }, [currentTab]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '26%' : '-26%', opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-26%' : '26%', opacity: 0, scale: 0.96 }),
  };

  const tabMap: Record<TabType, React.ReactNode> = {
    home:     <HomeTab />,
    game:     <GameTab />,
    function: <FunctionTab />,
    settings: <SettingsTab />,
    profile:  <ProfileTab />,
  };

  const lockedTabs = getLockedTabs(authState);
  const isLocked = lockedTabs.includes(displayTab);

  return (
    <div className="relative">
      <AnimatePresence custom={dir.current} mode="wait" initial={false}>
        <motion.div
          key={isLocked ? `locked-${displayTab}` : displayTab}
          custom={dir.current}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x:       { type: 'spring', stiffness: 340, damping: 32, mass: 0.9 },
            opacity: { duration: 0.22 },
            scale:   { duration: 0.28 },
          }}
          style={{ willChange: 'transform' }}
        >
          {isLocked
            ? <LockedTabScreen tab={displayTab} />
            : tabMap[displayTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MainApp() {
  return (
    <MainLayout>
      <TabRouter />
    </MainLayout>
  );
}

function AppInner() {
  const [splashDone, setSplashDone] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            background: '#111',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '12px',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
          },
        }}
      />

      <AnimatePresence>
        {!splashDone && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            className="fixed inset-0 z-[200]"
          >
            <SplashScreen onComplete={() => {
              setSplashDone(true);
              // Always return to root after splash so the URL is never "/login" or "/free-key"
              setLocation('/');
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      <Switch>
        <Route path="/" component={MainApp} />
        <Route path="/login" component={LoginScreen} />
        <Route path="/free-key" component={FreeKeyScreen} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function WithGoogle({ children }: { children: React.ReactNode }) {
  // Always provide GoogleOAuthProvider so useGoogleLogin hook never crashes.
  // If no real client ID, use a placeholder — the button is hidden anyway when CLIENT_ID is empty.
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'no-client-id'}>
      {children}
    </GoogleOAuthProvider>
  );
}

export default function App() {
  return (
    <WithGoogle>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </WithGoogle>
  );
}
