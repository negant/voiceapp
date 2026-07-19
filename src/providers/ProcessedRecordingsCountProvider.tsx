import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useDatabase } from '@/hooks/useDatabase';
import { listProcessedHistory } from '@/services/database/processedHistoryRepository';

type ProcessedRecordingsCountContextValue = {
  count: number;
  refreshCount: () => Promise<number>;
};

const ProcessedRecordingsCountContext =
  createContext<ProcessedRecordingsCountContextValue | null>(null);

export function ProcessedRecordingsCountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isReady } = useDatabase();
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!isReady) {
      setCount(0);
      return 0;
    }

    const entries = await listProcessedHistory();
    setCount(entries.length);
    return entries.length;
  }, [isReady]);

  useEffect(() => {
    refreshCount().catch(() => undefined);
  }, [refreshCount]);

  const value = useMemo(
    () => ({
      count,
      refreshCount,
    }),
    [count, refreshCount],
  );

  return (
    <ProcessedRecordingsCountContext.Provider value={value}>
      {children}
    </ProcessedRecordingsCountContext.Provider>
  );
}

export function useProcessedRecordingsCount() {
  const context = useContext(ProcessedRecordingsCountContext);

  if (!context) {
    throw new Error(
      'useProcessedRecordingsCount must be used within ProcessedRecordingsCountProvider',
    );
  }

  return context;
}
