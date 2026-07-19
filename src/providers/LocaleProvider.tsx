import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { translate, type TranslationParams } from '@/i18n';
import type { TranslationKey } from '@/i18n/types';
import { useDatabase } from '@/hooks/useDatabase';
import {
  getAppLocale,
  setAppLocale as persistAppLocale,
} from '@/services/database';
import type { AppLocale } from '@/types/locale';
import { resolveDeviceAppLocale } from '@/utils/deviceLocale';

type LocaleContextValue = {
  locale: AppLocale;
  isHydrated: boolean;
  setLocale: (locale: AppLocale) => Promise<void>;
  t: (key: TranslationKey, params?: TranslationParams) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { isReady } = useDatabase();
  const [locale, setLocaleState] = useState<AppLocale>(() =>
    resolveDeviceAppLocale(),
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const savedLocale = await getAppLocale();
        if (!cancelled) {
          // Explicit user choice in SQLite overrides the device locale.
          if (savedLocale) {
            setLocaleState(savedLocale);
          }
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
  }, [isReady]);

  const setLocale = useCallback(
    async (nextLocale: AppLocale) => {
      setLocaleState(nextLocale);
      if (isReady) {
        await persistAppLocale(nextLocale);
      }
    },
    [isReady],
  );

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) =>
      translate(locale, key, params),
    [locale],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      isHydrated,
      setLocale,
      t,
    }),
    [isHydrated, locale, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocaleContext must be used within LocaleProvider');
  }
  return context;
}
