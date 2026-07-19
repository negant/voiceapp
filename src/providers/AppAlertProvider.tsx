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

import { AppAlert } from '@/components/molecules/AppAlert';
import { useNetworkConnectivity } from '@/hooks/useNetworkConnectivity';
import { useTranslation } from '@/hooks/useTranslation';
import type {
  AppAlertContextValue,
  ShowAppAlertOptions,
} from '@/providers/AppAlertProvider.types';

type QueuedAlert = ShowAppAlertOptions & { id: number };

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

/**
 * Global styled alerts (replaces native Alert for user-facing notices).
 * Includes connectivity helpers and auto-notifies when the network returns.
 */
export function AppAlertProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { isOnline } = useNetworkConnectivity();
  const [queue, setQueue] = useState<QueuedAlert[]>([]);
  const nextIdRef = useRef(1);
  const wasOfflineRef = useRef(false);

  const dismissAlert = useCallback(() => {
    setQueue(current => {
      const [head, ...rest] = current;
      head?.onDismiss?.();
      return rest;
    });
  }, []);

  const showAlert = useCallback((options: ShowAppAlertOptions) => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    setQueue(current => [...current, { ...options, id }]);
  }, []);

  const showErrorAlert = useCallback(
    (title: string, message = '') => {
      showAlert({ title, message, variant: 'error' });
    },
    [showAlert],
  );

  const showWarningAlert = useCallback(
    (title: string, message = '') => {
      showAlert({ title, message, variant: 'warning' });
    },
    [showAlert],
  );

  const showOfflineAlert = useCallback(() => {
    showAlert({
      title: t('alerts.offlineTitle'),
      message: t('alerts.offlineMessage'),
      variant: 'warning',
      iconHint: 'offline',
    });
  }, [showAlert, t]);

  const showOnlineAlert = useCallback(() => {
    showAlert({
      title: t('alerts.onlineTitle'),
      message: t('alerts.onlineMessage'),
      variant: 'success',
      iconHint: 'online',
    });
  }, [showAlert, t]);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      return;
    }

    if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      showOnlineAlert();
    }
  }, [isOnline, showOnlineAlert]);

  const value = useMemo<AppAlertContextValue>(
    () => ({
      showAlert,
      dismissAlert,
      showErrorAlert,
      showWarningAlert,
      showOfflineAlert,
      showOnlineAlert,
    }),
    [
      dismissAlert,
      showAlert,
      showErrorAlert,
      showOfflineAlert,
      showOnlineAlert,
      showWarningAlert,
    ],
  );

  const active = queue[0] ?? null;

  return (
    <AppAlertContext.Provider value={value}>
      {children}
      <AppAlert
        visible={active !== null}
        title={active?.title ?? ''}
        message={active?.message ?? ''}
        variant={active?.variant}
        iconHint={active?.iconHint}
        confirmLabel={active?.confirmLabel}
        onClose={dismissAlert}
      />
    </AppAlertContext.Provider>
  );
}

export function useAppAlert(): AppAlertContextValue {
  const context = useContext(AppAlertContext);
  if (!context) {
    throw new Error('useAppAlert must be used within AppAlertProvider');
  }
  return context;
}
