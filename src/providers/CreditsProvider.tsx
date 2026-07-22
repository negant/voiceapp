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
import {
  AI_STARTED_MINUTE_SEC,
  resolvePremiumIncludedStartedMinutes,
} from '@/config/credits';
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
import {
  clearPendingWelcomeCreditsPrompt,
  getPendingWelcomeCreditsPrompt,
  setPendingWelcomeCreditsPrompt,
} from '@/services/database/welcomeCreditsPromptRepository';
import {
  isCreditsApiConfigured,
  setPlanWithApi,
  spendCreditsWithApi,
  syncCreditsWithApi,
} from '@/services/credits/creditsApi';
import type { CreditsDeviceSnapshot } from '@/services/credits/creditsApi.types';
import { fetchCreditsBootstrap } from '@/services/credits/creditsBootstrap';
import { resolveWelcomeCreditsPromptAmount } from '@/services/credits/resolveWelcomeCreditsPrompt';
import { createDeviceId, ensureDeviceId } from '@/services/device';
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
  /**
   * Free-pool welcome grant to announce once after install.
   * Null when there is nothing to show.
   */
  welcomeCreditsGrant: number | null;
  dismissWelcomeCreditsGrant: () => Promise<void>;
  refreshBalance: () => Promise<number>;
  setBalance: (balance: number) => Promise<void>;
  /** Prefer this for AI usage — syncs spend to API when configured. */
  spendCredits: (amount: number, reason?: string) => Promise<number>;
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
  const [welcomeCreditsGrant, setWelcomeCreditsGrant] = useState<number | null>(
    null,
  );
  const apiStartSyncAttempted = useRef(false);
  const balanceRef = useRef(0);
  const planRef = useRef<AccountPlanId>('free');

  balanceRef.current = balance;
  planRef.current = accountPlan;

  const dismissWelcomeCreditsGrant = useCallback(async () => {
    await clearPendingWelcomeCreditsPrompt();
    setWelcomeCreditsGrant(null);
  }, []);

  const applyDeviceSnapshot = useCallback(
    async (device: CreditsDeviceSnapshot) => {
      await persistCreditsBalance(device.balance);
      await persistAccountPlan(device.plan);
      setBalanceState(device.balance);
      setAccountPlanState(device.plan);
      setIsHydrated(true);
      return device.balance;
    },
    [],
  );

  const refreshAccount = useCallback(async () => {
    if (!isReady) {
      setAccountPlanState('free');
      return 'free';
    }

    const nextPlan = await ensureInitialAccountPlan();
    setAccountPlanState(nextPlan);
    return nextPlan;
  }, [isReady]);

  const ensureRegisteredOnApi = useCallback(
    async (id: string) => {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      await fetchCreditsBootstrap({
        deviceId: id,
        platform,
        appVersion,
      });
    },
    [],
  );

  const refreshBalance = useCallback(async () => {
    if (!isReady) {
      setBalanceState(0);
      setIsHydrated(false);
      return 0;
    }

    const id = await ensureDeviceId();
    setDeviceId(id);

    if (isCreditsApiConfigured() && !apiStartSyncAttempted.current) {
      apiStartSyncAttempted.current = true;
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const bootstrap = await fetchCreditsBootstrap({
        deviceId: id,
        platform,
        appVersion,
      });

      if (bootstrap.status !== 'local_fallback') {
        const promptAmount = resolveWelcomeCreditsPromptAmount(
          bootstrap.status,
          bootstrap.grantedCredits,
        );
        if (promptAmount != null) {
          // Persist until the user taps OK (survives kill / relaunch).
          await setPendingWelcomeCreditsPrompt(promptAmount);
        }

        await persistCreditsBalance(bootstrap.balance);
        await persistAccountPlan(bootstrap.accountPlan);
        setBalanceState(bootstrap.balance);
        setAccountPlanState(bootstrap.accountPlan);
        setCreditsPerAi10SecState(bootstrap.creditsPerAi10Sec);

        const pendingPrompt = await getPendingWelcomeCreditsPrompt();
        setWelcomeCreditsGrant(pendingPrompt);

        // Sync applies free expiry + monthly premium renew after register
        const synced = await syncCreditsWithApi({
          deviceId: id,
          appVersion,
        });
        if (synced) {
          return applyDeviceSnapshot(synced);
        }

        setIsHydrated(true);
        return bootstrap.balance;
      }
    } else if (isCreditsApiConfigured() && apiStartSyncAttempted.current) {
      const synced = await syncCreditsWithApi({
        deviceId: id,
        appVersion,
      });
      if (synced) {
        const pendingPrompt = await getPendingWelcomeCreditsPrompt();
        setWelcomeCreditsGrant(pendingPrompt);
        return applyDeviceSnapshot(synced);
      }
    }

    const [seedResult, economy, pendingPrompt] = await Promise.all([
      ensureInitialCreditsBalance(),
      ensureInitialCreditsEconomy(),
      getPendingWelcomeCreditsPrompt(),
      refreshAccount(),
    ]);
    setBalanceState(seedResult.balance);
    setCreditsPerAi10SecState(economy.creditsPerAi10Sec);
    setWelcomeCreditsGrant(pendingPrompt);
    // No local welcome grant — free credits only when API returns `granted`.
    setIsHydrated(true);
    return seedResult.balance;
  }, [applyDeviceSnapshot, isReady, refreshAccount]);

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

  const spendCredits = useCallback(
    async (amount: number, reason = 'spend_ai') => {
      if (!isReady) {
        return balanceRef.current;
      }

      const spendAmount = Math.floor(amount);
      if (!Number.isFinite(spendAmount) || spendAmount <= 0) {
        return balanceRef.current;
      }

      const id = deviceId ?? (await ensureDeviceId());
      setDeviceId(id);

      if (isCreditsApiConfigured()) {
        await ensureRegisteredOnApi(id);
        const device = await spendCreditsWithApi({
          deviceId: id,
          amount: spendAmount,
          clientRequestId: createDeviceId(),
          reason,
        });
        if (device) {
          return applyDeviceSnapshot(device);
        }
      }

      const next = Math.max(0, balanceRef.current - spendAmount);
      await persistCreditsBalance(next);
      setBalanceState(next);
      setIsHydrated(true);
      return next;
    },
    [applyDeviceSnapshot, deviceId, ensureRegisteredOnApi, isReady],
  );

  const setAccountPlan = useCallback(
    async (plan: AccountPlanId) => {
      if (!isReady) {
        return;
      }

      const id = deviceId ?? (await ensureDeviceId());
      setDeviceId(id);

      if (isCreditsApiConfigured()) {
        await ensureRegisteredOnApi(id);
        const device = await setPlanWithApi({
          deviceId: id,
          plan,
          clientRequestId: createDeviceId(),
        });
        if (device) {
          await applyDeviceSnapshot(device);
          return;
        }
      }

      // Local fallback (no API / offline): mirror server pack rules
      const previous = planRef.current;
      await persistAccountPlan(plan);
      setAccountPlanState(plan);

      if (plan === 'premium' && previous !== 'premium') {
        const pack = resolvePremiumIncludedStartedMinutes(
          env.premiumCredits,
          env.premiumGratisCredits,
        );
        const next = balanceRef.current + pack;
        await persistCreditsBalance(next);
        setBalanceState(next);
      } else if (plan === 'free' && previous === 'premium') {
        const next = env.startingCredits;
        await persistCreditsBalance(next);
        setBalanceState(next);
      }

      setIsHydrated(true);
    },
    [applyDeviceSnapshot, deviceId, ensureRegisteredOnApi, isReady],
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
      welcomeCreditsGrant,
      dismissWelcomeCreditsGrant,
      refreshBalance,
      setBalance,
      spendCredits,
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
      welcomeCreditsGrant,
      dismissWelcomeCreditsGrant,
      refreshBalance,
      setBalance,
      spendCredits,
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
