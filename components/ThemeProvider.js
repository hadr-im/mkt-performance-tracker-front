'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const THEME_KEY = 'mkt-theme';

/**
 * Inline script run before paint so the saved theme is applied with the first
 * frame — without it the page flashes light before React hydrates.
 */
export const themeInitScript = `
(function(){
  try {
    var saved = localStorage.getItem('${THEME_KEY}');
    var dark = saved
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // Adopt whatever the pre-paint script decided.
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const apply = useCallback(next => {
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage blocked */ }
  }, []);

  const toggle = useCallback(() => {
    apply(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
  }, [apply]);

  // Follow the OS only while the user has made no explicit choice.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = e => {
      try { if (localStorage.getItem(THEME_KEY)) return; } catch (err) { /* ignore */ }
      setTheme(e.matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', setTheme: apply, toggle }),
    [theme, apply, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext) || { theme: 'light', isDark: false, toggle: () => { } };
}
