import {
  DEFAULT_CREDITS_PER_AI_10_SEC,
  FREE_INSTALLS_WITH_TEST_CREDITS,
} from '@/config/credits';
import { env } from '@/config/env';

import type {
  CreditsBootstrapApiResponse,
  CreditsBootstrapResult,
  CreditsPoolSnapshot,
} from './types';

/** Whether the promotional install pool can still grant welcome credits. */
export function isFreeTestPoolExhausted(installsGranted: number): boolean {
  return installsGranted >= FREE_INSTALLS_WITH_TEST_CREDITS;
}

export function buildRemainingPoolSlots(installsGranted: number): number {
  return Math.max(0, FREE_INSTALLS_WITH_TEST_CREDITS - installsGranted);
}

/** Map API payload to app-local bootstrap result. */
export function mapCreditsBootstrapResponse(
  response: CreditsBootstrapApiResponse,
): CreditsBootstrapResult {
  return {
    status: response.bootstrapStatus,
    grantedCredits: response.grantedCredits,
    balance: response.balance,
    creditsPerAi10Sec: response.creditsPerAi10Sec,
    accountPlan: response.accountPlan,
    pool: response.pool,
  };
}

/**
 * Offline / no-API fallback — no free welcome credits.
 * Free grants are authoritative on the backend install pool only.
 */
export function resolveLocalBootstrapFallback(): CreditsBootstrapResult {
  return {
    status: 'local_fallback',
    grantedCredits: 0,
    balance: 0,
    creditsPerAi10Sec: DEFAULT_CREDITS_PER_AI_10_SEC,
    accountPlan: 'free',
    pool: {
      installCap: FREE_INSTALLS_WITH_TEST_CREDITS,
      installsGranted: 0,
      remainingSlots: FREE_INSTALLS_WITH_TEST_CREDITS,
    },
  };
}

export function resolvePoolExhaustedBootstrap(
  creditsPerAi10Sec: number = DEFAULT_CREDITS_PER_AI_10_SEC,
): CreditsBootstrapResult {
  const pool: CreditsPoolSnapshot = {
    installCap: FREE_INSTALLS_WITH_TEST_CREDITS,
    installsGranted: FREE_INSTALLS_WITH_TEST_CREDITS,
    remainingSlots: 0,
  };

  return {
    status: 'pool_exhausted',
    grantedCredits: 0,
    balance: 0,
    creditsPerAi10Sec,
    accountPlan: 'free',
    pool,
  };
}

type FetchCreditsBootstrapParams = {
  /** Preferred — stable device id for credits API. */
  deviceId?: string;
  /** @deprecated Alias of deviceId (older stub). */
  installationId?: string;
  platform: 'ios' | 'android';
  appVersion: string;
  apiBaseUrl?: string | null;
  apiToken?: string | null;
};

function resolveDeviceId(params: FetchCreditsBootstrapParams): string {
  return (params.deviceId || params.installationId || '').trim();
}

/**
 * Request welcome credits from backend.
 * Without BACKEND_API_BASE_URL (or on network failure) → local_fallback with 0 free credits.
 */
export async function fetchCreditsBootstrap(
  params: FetchCreditsBootstrapParams,
): Promise<CreditsBootstrapResult> {
  const apiBaseUrl = params.apiBaseUrl ?? env.backendApiBaseUrl;
  const apiToken = params.apiToken ?? env.backendApiToken;
  const deviceId = resolveDeviceId(params);
  const { platform, appVersion } = params;

  if (!apiBaseUrl?.trim() || !deviceId) {
    return resolveLocalBootstrapFallback();
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiToken) {
      headers.Authorization = `Bearer ${apiToken}`;
    }

    const response = await fetch(
      `${apiBaseUrl.replace(/\/$/, '')}/v1/devices/register`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ deviceId, platform, appVersion }),
      },
    );

    if (!response.ok) {
      return resolveLocalBootstrapFallback();
    }

    const payload = (await response.json()) as CreditsBootstrapApiResponse;
    return mapCreditsBootstrapResponse(payload);
  } catch {
    return resolveLocalBootstrapFallback();
  }
}
