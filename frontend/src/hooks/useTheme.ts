import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeConfig {
  storageKey?: string;
  defaultTheme?: Theme;
}

export const useTheme = ({
  storageKey = 'theme-preference',
  defaultTheme = 'light',
}: ThemeConfig = {}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage first
    const storedTheme = localStorage.getItem(storageKey);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const setThemePreference = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  return {
    theme,
    toggleTheme,
    setThemePreference,
    isDarkMode: theme === 'dark',
  };
}; 