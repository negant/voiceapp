import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useDatabase } from '@/hooks/useDatabase';
import {
  fetchAiServiceStatus,
  severityToColor,
  type AiServiceStatusSeverity,
  type AiServiceStatusSnapshot,
  unknownAiServiceStatusSnapshot,
} from '@/services/aiServiceStatus';
import {
  clearDegradedAiServiceStatus,
  getCachedDegradedAiServiceStatus,
  persistDegradedAiServiceStatus,
} from '@/services/database/aiServiceStatusRepository';

type RefreshOptions = {
  /** When true, skip the “Checking…” UI state (used after AI failures). */
  quiet?: boolean;
};

export type AiServiceStatusDebugSeverity = Extract<
  AiServiceStatusSeverity,
  'ok' | 'degraded' | 'outage'
>;

type AiServiceStatusContextValue = {
  status: AiServiceStatusSnapshot | null;
  isChecking: boolean;
  /** Startup / manual refresh. Prefer quiet refresh after AI errors. */
  refreshStatus: (options?: RefreshOptions) => Promise<AiServiceStatusSnapshot>;
  /**
   * Call after a cloud AI conversion failure — re-checks the status endpoint
   * once and updates in-app badge / settings (no polling loop).
   */
  refreshStatusAfterAiFailure: () => Promise<AiServiceStatusSnapshot>;
  /**
   * Dev-only: force green / yellow / red UI + persistence without hitting the
   * status endpoint (Settings → Developer).
   */
  applyDebugStatus: (
    severity: AiServiceStatusDebugSeverity,
  ) => Promise<AiServiceStatusSnapshot>;
};

const AiServiceStatusContext =
  createContext<AiServiceStatusContextValue | null>(null);

async function applyFetchedStatus(
  fresh: AiServiceStatusSnapshot,
): Promise<void> {
  if (fresh.severity === 'degraded' || fresh.severity === 'outage') {
    await persistDegradedAiServiceStatus(fresh);
  } else if (fresh.severity === 'ok') {
    await clearDegradedAiServiceStatus();
  }
}

function buildDebugSnapshot(
  severity: AiServiceStatusDebugSeverity,
): AiServiceStatusSnapshot {
  const pageStatus =
    severity === 'ok'
      ? 'UP'
      : severity === 'degraded'
        ? 'UNDERMAINTENANCE'
        : 'HASISSUES';

  return {
    severity,
    color: severityToColor(severity),
    pageStatus,
    activeIncidentsCount: severity === 'outage' ? 1 : 0,
    activeMaintenancesCount: severity === 'degraded' ? 1 : 0,
    fetchedAt: Date.now(),
    source: 'fallback',
  };
}

export function AiServiceStatusProvider({ children }: { children: ReactNode }) {
  const { isReady } = useDatabase();
  const [status, setStatus] = useState<AiServiceStatusSnapshot | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const refreshInFlightRef = useRef<Promise<AiServiceStatusSnapshot> | null>(
    null,
  );

  const refreshStatus = useCallback(
    async (options?: RefreshOptions): Promise<AiServiceStatusSnapshot> => {
      if (refreshInFlightRef.current) {
        return refreshInFlightRef.current;
      }

      const quiet = options?.quiet === true;
      if (!quiet) {
        setIsChecking(true);
      }

      const run = (async () => {
        try {
          const fresh = await fetchAiServiceStatus();
          setStatus(fresh);
          await applyFetchedStatus(fresh);
          return fresh;
        } catch {
          const fallback = unknownAiServiceStatusSnapshot('fallback');
          setStatus(prev => prev ?? fallback);
          return fallback;
        } finally {
          if (!quiet) {
            setIsChecking(false);
          }
          refreshInFlightRef.current = null;
        }
      })();

      refreshInFlightRef.current = run;
      return run;
    },
    [],
  );

  const refreshStatusAfterAiFailure = useCallback(() => {
    // Only re-query after a real AI problem — not on a timer.
    return refreshStatus({ quiet: true });
  }, [refreshStatus]);

  const applyDebugStatus = useCallback(
    async (
      severity: AiServiceStatusDebugSeverity,
    ): Promise<AiServiceStatusSnapshot> => {
      const snapshot = buildDebugSnapshot(severity);
      setIsChecking(false);
      setStatus(snapshot);
      await applyFetchedStatus(snapshot);
      return snapshot;
    },
    [],
  );

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;

    (async () => {
      const cached = await getCachedDegradedAiServiceStatus();
      if (!cancelled && cached) {
        setStatus(cached);
      }

      if (cancelled) {
        return;
      }

      // Single launch-time probe — avoid frequent status polling.
      await refreshStatus();
    })().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [isReady, refreshStatus]);

  const value = useMemo(
    () => ({
      status,
      isChecking,
      refreshStatus,
      refreshStatusAfterAiFailure,
      applyDebugStatus,
    }),
    [
      status,
      isChecking,
      refreshStatus,
      refreshStatusAfterAiFailure,
      applyDebugStatus,
    ],
  );

  return (
    <AiServiceStatusContext.Provider value={value}>
      {children}
    </AiServiceStatusContext.Provider>
  );
}

export function useAiServiceStatus(): AiServiceStatusContextValue {
  const ctx = useContext(AiServiceStatusContext);
  if (!ctx) {
    throw new Error(
      'useAiServiceStatus must be used within AiServiceStatusProvider',
    );
  }
  return ctx;
}
