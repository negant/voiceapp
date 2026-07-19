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
import { Platform } from 'react-native';

import { appVersion } from '@/config/app';
import { AI_STARTED_MINUTE_SEC } from '@/config/credits';
import { env } from '@/config/env';
import { useDatabase } from '@/hooks/useDatabase';
import {
  ensureInitialAccountPlan,
  isPremiumAccountPlan,
  setAccountPlan as persistAccountPlan,
} from '@/services/database/accountRepository';
import {
  ensureInitialCreditsEconomy,
  setCreditsPerAi10Sec as persistCreditsPerAi10Sec,
} from '@/services/database/creditsEconomyRepository';
import {
  ensureInitialCreditsBalance,
  setCreditsBalance as persistCreditsBalance,
} from '@/services/database/creditsRepository';
import { fetchCreditsBootstrap } from '@/services/credits/creditsBootstrap';
import { ensureDeviceId } from '@/services/device';
import type { AccountPlanId } from '@/types/account';

type CreditsContextValue = {
  balance: number;
  /** Credits charged per started minute of AI (usually 1). */
  creditsPerStartedMinute: number;
  /** @deprecated Alias of creditsPerStartedMinute for older callers. */
  creditsPerAiSecond: number;
  creditsPerAi10Sec: number;
  aiBillingChunkSec: number;
  accountPlan: AccountPlanId;
  isPremium: boolean;
  isHydrated: boolean;
  deviceId: string | null;
  refreshBalance: () => Promise<number>;
  setBalance: (balance: number) => Promise<void>;
  refreshAccount: () => Promise<AccountPlanId>;
  setAccountPlan: (plan: AccountPlanId) => Promise<void>;
  setCreditsPerAi10Sec: (rate: number) => Promise<void>;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { isReady } = useDatabase();
  const [balance, setBalanceState] = useState(0);
  const [creditsPerAi10Sec, setCreditsPerAi10SecState] = useState(114);
  const [accountPlan, setAccountPlanState] = useState<AccountPlanId>('free');
  const [isHydrated, setIsHydrated] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const apiBootstrapAttempted = useRef(false);

  const refreshAccount = useCallback(async () => {
    if (!isReady) {
      setAccountPlanState('free');
      return 'free';
    }

    const nextPlan = await ensureInitialAccountPlan();
    setAccountPlanState(nextPlan);
    return nextPlan;
  }, [isReady]);

  const refreshBalance = useCallback(async () => {
    if (!isReady) {
      setBalanceState(0);
      setIsHydrated(false);
      return 0;
    }

    const id = await ensureDeviceId();
    setDeviceId(id);

    if (env.creditsApiBaseUrl && !apiBootstrapAttempted.current) {
      apiBootstrapAttempted.current = true;
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const bootstrap = await fetchCreditsBootstrap({
        deviceId: id,
        platform,
        appVersion,
      });

      if (bootstrap.status !== 'local_fallback') {
        await persistCreditsBalance(bootstrap.balance);
        await persistAccountPlan(bootstrap.accountPlan);
        setBalanceState(bootstrap.balance);
        setAccountPlanState(bootstrap.accountPlan);
        setCreditsPerAi10SecState(bootstrap.creditsPerAi10Sec);
        setIsHydrated(true);
        return bootstrap.balance;
      }
    }

    const [nextBalance, economy] = await Promise.all([
      ensureInitialCreditsBalance(),
      ensureInitialCreditsEconomy(),
      refreshAccount(),
    ]);
    setBalanceState(nextBalance);
    setCreditsPerAi10SecState(economy.creditsPerAi10Sec);
    setIsHydrated(true);
    return nextBalance;
  }, [isReady, refreshAccount]);

  const setBalance = useCallback(
    async (nextBalance: number) => {
      if (!isReady) {
        return;
      }

      await persistCreditsBalance(nextBalance);
      setBalanceState(nextBalance);
      setIsHydrated(true);
    },
    [isReady],
  );

  const setAccountPlan = useCallback(
    async (plan: AccountPlanId) => {
      if (!isReady) {
        return;
      }

      await persistAccountPlan(plan);
      setAccountPlanState(plan);
      setIsHydrated(true);
    },
    [isReady],
  );

  const setCreditsPerAi10Sec = useCallback(
    async (rate: number) => {
      if (!isReady) {
        return;
      }

      await persistCreditsPerAi10Sec(rate);
      setCreditsPerAi10SecState(rate);
      setIsHydrated(true);
    },
    [isReady],
  );

  useEffect(() => {
    refreshBalance().catch(() => undefined);
  }, [refreshBalance]);

  const isPremium = isPremiumAccountPlan(accountPlan);

  const value = useMemo(
    () => ({
      balance,
      creditsPerStartedMinute: env.creditsPerStartedMinute,
      creditsPerAiSecond: env.creditsPerStartedMinute,
      creditsPerAi10Sec,
      aiBillingChunkSec: AI_STARTED_MINUTE_SEC,
      accountPlan,
      isPremium,
      isHydrated,
      deviceId,
      refreshBalance,
      setBalance,
      refreshAccount,
      setAccountPlan,
      setCreditsPerAi10Sec,
    }),
    [
      balance,
      creditsPerAi10Sec,
      accountPlan,
      isPremium,
      isHydrated,
      deviceId,
      refreshBalance,
      setBalance,
      refreshAccount,
      setAccountPlan,
      setCreditsPerAi10Sec,
    ],
  );

  return (
    <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);

  if (!context) {
    throw new Error('useCredits must be used within CreditsProvider');
  }

  return context;
}
