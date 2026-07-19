import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

import { useDatabase } from '@/hooks/useDatabase';
import { getThemeMode, setThemeMode as persistThemeMode } from '@/services/database';
import type { ThemeMode } from '@/types/theme';

type ThemeContextValue = {
  colorScheme: 'light' | 'dark';
  isDark: boolean;
  isHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleColorScheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isReady } = useDatabase();
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const savedMode = await getThemeMode();
        if (savedMode && !cancelled) {
          setColorScheme(savedMode);
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady, setColorScheme]);

  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      setColorScheme(mode);
      if (isReady) {
        await persistThemeMode(mode);
      }
    },
    [isReady, setColorScheme],
  );

  const resolvedScheme = colorScheme ?? 'light';

  const toggleTheme = useCallback(async () => {
    const nextMode = resolvedScheme === 'dark' ? 'light' : 'dark';
    await setThemeMode(nextMode);
  }, [resolvedScheme, setThemeMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme: resolvedScheme,
      isDark: resolvedScheme === 'dark',
      isHydrated,
      setThemeMode,
      toggleColorScheme: toggleTheme,
    }),
    [isHydrated, resolvedScheme, setThemeMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}
