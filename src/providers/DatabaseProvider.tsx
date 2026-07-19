import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  getSQLiteManager,
  runMigrations,
} from '@/services/database';

type DatabaseContextValue = {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
};

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitializing = useRef(false);

  useEffect(() => {
    let cancelled = false;

    if (isInitializing.current) {
      return;
    }

    isInitializing.current = true;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const db = getSQLiteManager();
        await db.initDatabase();
        await runMigrations(db);
        if (!cancelled) {
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Database init failed');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          isInitializing.current = false;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ isReady, isLoading, error }),
    [error, isLoading, isReady],
  );

  return (
    <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>
  );
}

export function useDatabaseContext(): DatabaseContextValue {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within DatabaseProvider');
  }
  return context;
}
