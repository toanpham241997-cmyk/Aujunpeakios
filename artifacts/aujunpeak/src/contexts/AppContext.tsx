import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getStorage, setStorage } from '@/lib/storage';
import { getNotifications, type ApiNotification } from '@/lib/api';

export type TabType = 'home' | 'game' | 'function' | 'settings' | 'profile';

export const ALL_LOCKABLE_TABS: TabType[] = ['home', 'game', 'function', 'settings'];

/**
 * Dynamic locked tabs based on auth + key type:
 * - VIP / Custom key  → all unlocked
 * - Free key          → game, function locked; home, settings, profile open
 * - Google only       → home, game, function locked; settings open
 * - Not logged in     → home, game, function, settings all locked
 */
export function getLockedTabs(auth: { isLoggedIn: boolean; googleUser: any; keyData: any }): TabType[] {
  if (auth.isLoggedIn && auth.keyData) {
    const tier = (auth.keyData.type || auth.keyData.tier || '').toLowerCase();
    if (tier === 'free') {
      // Free key: only game and function are locked
      return ['game', 'function'];
    }
    // VIP or custom: nothing locked
    return [];
  }
  if (auth.googleUser) return ['home', 'game', 'function'];
  return ['home', 'game', 'function', 'settings'];
}

export function isVipKey(keyData: any): boolean {
  if (!keyData) return false;
  const tier = (keyData.type || keyData.tier || '').toLowerCase();
  return tier === 'vip' || tier === 'custom';
}

export function isFreeKey(keyData: any): boolean {
  if (!keyData) return false;
  const tier = (keyData.type || keyData.tier || '').toLowerCase();
  return tier === 'free';
}

interface AuthState {
  isLoggedIn: boolean;
  keyData: any;
  googleUser: any;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  time: string;
}

interface AppContextType {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  language: string;
  setLanguage: (lang: string) => void;
  uiState: any;
  setUiState: (state: any) => void;
  deviceId: string;
  switches: Record<string, boolean>;
  setSwitchValue: (id: string, val: boolean) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotifCount: number;
  refreshNotifications: () => Promise<void>;
}

const defaultAuth = { isLoggedIn: false, keyData: null, googleUser: null };

const AppContext = createContext<AppContextType | null>(null);

function apiNotifToLocal(n: ApiNotification): Notification {
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    read: n.read,
    time: new Date(n.createdAt).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => getStorage('authState', defaultAuth));
  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    const stored = getStorage<AuthState>('authState', defaultAuth);
    return stored.isLoggedIn ? 'home' : 'profile';
  });
  const [language, setLanguage] = useState<string>(() => getStorage('language', 'vi'));
  const [uiState, setUiState] = useState<any>({ boostRunning: false });
  const [deviceId, setDeviceId] = useState<string>('');
  const [switches, setSwitches] = useState<Record<string, boolean>>(() => getStorage('appSwitches', {}));
  const [notifications, setNotifications] = useState<Notification[]>(() => getStorage('notifications', []));

  // Generate device ID
  useEffect(() => {
    let id = getStorage<string>('deviceId', '');
    if (!id) {
      id = crypto.randomUUID?.() || Math.random().toString(36).substring(2);
      setStorage('deviceId', id);
    }
    setDeviceId(id);
  }, []);

  // Persist auth state
  useEffect(() => { setStorage('authState', authState); }, [authState]);
  useEffect(() => { setStorage('language', language); }, [language]);
  useEffect(() => { setStorage('appSwitches', switches); }, [switches]);
  useEffect(() => { setStorage('notifications', notifications); }, [notifications]);

  // Load notifications from API when logged in
  const refreshNotifications = async () => {
    try {
      const keyValue = authState.keyData?.keyValue || authState.keyData?.key;
      const apiNotifs = await getNotifications(keyValue || undefined);
      if (apiNotifs.length > 0) {
        const localReadState = getStorage<Record<string, boolean>>('notifReadState', {});
        setNotifications(
          apiNotifs.map(n => ({
            ...apiNotifToLocal(n),
            read: localReadState[n.id] ?? n.read,
          }))
        );
      }
    } catch {
      // fallback to localStorage
    }
  };

  useEffect(() => {
    if (authState.isLoggedIn || authState.googleUser) {
      refreshNotifications();
      // Poll every 30 seconds
      const interval = setInterval(refreshNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [authState.isLoggedIn, authState.keyData]);

  const setSwitchValue = (id: string, val: boolean) => {
    setSwitches(prev => ({ ...prev, [id]: val }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const readState = getStorage<Record<string, boolean>>('notifReadState', {});
    setStorage('notifReadState', { ...readState, [id]: true });
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const readState: Record<string, boolean> = {};
    notifications.forEach(n => { readState[n.id] = true; });
    setStorage('notifReadState', readState);
  };

  const unreadNotifCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  return (
    <AppContext.Provider value={{
      authState, setAuthState,
      currentTab, setCurrentTab,
      language, setLanguage,
      uiState, setUiState,
      deviceId,
      switches, setSwitchValue,
      notifications, markNotificationRead, markAllNotificationsRead, unreadNotifCount,
      refreshNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
