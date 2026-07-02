'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settings.store';
import { useAuthStore } from '@/store/auth.store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, fetchSettings } = useSettingsStore();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  // Load settings when authenticated
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (_hasHydrated && isAuthenticated && token) {
      fetchSettings();
    }
  }, [_hasHydrated, isAuthenticated, fetchSettings]);

  // Determine active theme
  const theme = settings?.theme || (typeof window !== 'undefined' ? localStorage.getItem('theme') as any : null) || 'system';


  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (themeName: 'light' | 'dark' | 'system') => {
      let isDark = false;
      if (themeName === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = themeName === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme(theme);

    // If theme is system, listen to media query changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  return <>{children}</>;
}
