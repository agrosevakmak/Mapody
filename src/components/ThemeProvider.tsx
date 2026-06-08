'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type LayoutDensity = 'compact' | 'comfortable' | 'spacious';
export type AccentColor = 'blue' | 'purple' | 'teal' | 'rose' | 'amber' | 'emerald';

interface ThemePreferences {
  darkMode: boolean;
  fontSize: FontSize;
  layoutDensity: LayoutDensity;
  reducedMotion: boolean;
  accentColor: AccentColor;
  sidebarCollapsed: boolean;
}

interface ThemeContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  layoutDensity: LayoutDensity;
  setLayoutDensity: (density: LayoutDensity) => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
}

const ACCENT_COLORS: Record<AccentColor, string> = {
  blue: '#4361ee',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  rose: '#f43f5e',
  amber: '#f59e0b',
  emerald: '#10b981',
};

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
  xlarge: 'text-xl',
};

const DENSITY_PADDING: Record<LayoutDensity, string> = {
  compact: 'compact-layout',
  comfortable: 'comfortable-layout',
  spacious: 'spacious-layout',
};

const STORAGE_KEY = 'mapody-theme';

const defaultPreferences: ThemePreferences = {
  darkMode: false,
  fontSize: 'medium',
  layoutDensity: 'comfortable',
  reducedMotion: false,
  accentColor: 'blue',
  sidebarCollapsed: false,
};

function loadPreferences(): ThemePreferences {
  if (typeof window === 'undefined') return defaultPreferences;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch {}
  return defaultPreferences;
}

function savePreferences(prefs: ThemePreferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ThemePreferences>(defaultPreferences);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loaded = loadPreferences();
    setPrefs(loaded);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.classList.toggle('dark', prefs.darkMode);

    Object.values(FONT_SIZE_CLASSES).forEach((cls) => {
      document.documentElement.classList.remove(cls);
    });
    document.documentElement.classList.add(FONT_SIZE_CLASSES[prefs.fontSize]);

    Object.values(DENSITY_PADDING).forEach((cls) => {
      document.documentElement.classList.remove(cls);
    });
    document.documentElement.classList.add(DENSITY_PADDING[prefs.layoutDensity]);

    document.documentElement.classList.toggle('reduced-motion', prefs.reducedMotion);

    document.documentElement.style.setProperty('--blue', ACCENT_COLORS[prefs.accentColor]);

    savePreferences(prefs);
  }, [prefs, mounted]);

  const toggleDarkMode = useCallback(() => {
    setPrefs((p) => ({ ...p, darkMode: !p.darkMode }));
  }, []);

  const setDarkMode = useCallback((value: boolean) => {
    setPrefs((p) => ({ ...p, darkMode: value }));
  }, []);

  const setFontSize = useCallback((fontSize: FontSize) => {
    setPrefs((p) => ({ ...p, fontSize }));
  }, []);

  const setLayoutDensity = useCallback((layoutDensity: LayoutDensity) => {
    setPrefs((p) => ({ ...p, layoutDensity }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setPrefs((p) => ({ ...p, reducedMotion: !p.reducedMotion }));
  }, []);

  const setAccentColor = useCallback((accentColor: AccentColor) => {
    setPrefs((p) => ({ ...p, accentColor }));
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setPrefs((p) => ({ ...p, sidebarCollapsed: !p.sidebarCollapsed }));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        darkMode: prefs.darkMode,
        toggleDarkMode,
        setDarkMode,
        fontSize: prefs.fontSize,
        setFontSize,
        layoutDensity: prefs.layoutDensity,
        setLayoutDensity,
        reducedMotion: prefs.reducedMotion,
        toggleReducedMotion,
        accentColor: prefs.accentColor,
        setAccentColor,
        sidebarCollapsed: prefs.sidebarCollapsed,
        toggleSidebarCollapsed,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
