import { env } from '@/config/env';

import type {
  CreditsApiAuth,
  CreditsDeviceSnapshot,
} from './creditsApi.types';
import type { AccountPlanId } from '@/types/account';

function resolveAuth(overrides?: Partial<CreditsApiAuth>): CreditsApiAuth | null {
  const apiBaseUrl = (overrides?.apiBaseUrl ?? env.backendApiBaseUrl)?.trim();
  if (!apiBaseUrl) {
    return null;
  }
  return {
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    apiToken: overrides?.apiToken ?? env.backendApiToken,
  };
}

function authHeaders(auth: CreditsApiAuth): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth.apiToken) {
    headers.Authorization = `Bearer ${auth.apiToken}`;
  }
  return headers;
}

function logCreditsApi(
  level: 'info' | 'warn',
  message: string,
  meta?: Record<string, unknown>,
): void {
  if (!env.debugMode && !__DEV__) {
    return;
  }
  const line = meta ? `${message} ${JSON.stringify(meta)}` : message;
  if (level === 'warn') {
    console.warn(`[CreditsApi] ${line}`);
    return;
  }
  console.log(`[CreditsApi] ${line}`);
}

async function postJson<T>(
  auth: CreditsApiAuth,
  path: string,
  body: unknown,
): Promise<T | null> {
  const url = `${auth.apiBaseUrl}${path}`;
  try {
    logCreditsApi('info', 'request', { path, body });
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(auth),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      logCreditsApi('warn', 'non-ok response', {
        path,
        status: response.status,
        url,
      });
      return null;
    }
    const json = (await response.json()) as T;
    logCreditsApi('info', 'ok', { path });
    return json;
  } catch (error) {
    logCreditsApi('warn', 'network/fetch failed — check BACKEND_API_BASE_URL (device cannot use localhost)', {
      path,
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

async function getJson<T>(
  auth: CreditsApiAuth,
  path: string,
): Promise<T | null> {
  const url = `${auth.apiBaseUrl}${path}`;
  try {
    logCreditsApi('info', 'request', { path, method: 'GET' });
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(auth),
    });
    if (!response.ok) {
      logCreditsApi('warn', 'non-ok response', {
        path,
        status: response.status,
        url,
      });
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    logCreditsApi('warn', 'network/fetch failed', {
      path,
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

type SyncResponse = {
  device: CreditsDeviceSnapshot;
  balance: number;
  accountPlan: AccountPlanId;
};

type PlanResponse = {
  ok: boolean;
  device: CreditsDeviceSnapshot;
  balance: number;
  accountPlan: AccountPlanId;
};

type SpendResponse = {
  ok: boolean;
  device: CreditsDeviceSnapshot;
  balance: number;
};

/** Sync device state (free expiry + premium renew) after app start. */
export async function syncCreditsWithApi(params: {
  deviceId: string;
  appVersion?: string;
  auth?: Partial<CreditsApiAuth>;
}): Promise<CreditsDeviceSnapshot | null> {
  const auth = resolveAuth(params.auth);
  if (!auth) {
    return null;
  }

  const payload = await postJson<SyncResponse>(auth, '/v1/credits/sync', {
    deviceId: params.deviceId,
    appVersion: params.appVersion,
  });
  return payload?.device ?? null;
}

/** Enable/disable Premium on the backend (authoritative balance). */
export async function setPlanWithApi(params: {
  deviceId: string;
  plan: AccountPlanId;
  clientRequestId?: string;
  googlePlayPurchase?: {
    purchaseToken: string;
    productId: string;
    packageName: string;
    orderId?: string;
  };
  auth?: Partial<CreditsApiAuth>;
}): Promise<CreditsDeviceSnapshot | null> {
  const auth = resolveAuth(params.auth);
  if (!auth) {
    return null;
  }

  const payload = await postJson<PlanResponse>(auth, '/v1/credits/plan', {
    deviceId: params.deviceId,
    plan: params.plan,
    clientRequestId: params.clientRequestId,
    googlePlayPurchase: params.googlePlayPurchase,
  });
  return payload?.device ?? null;
}

export type SetupApiSnapshot = {
  setup: {
    minAppVersion: string;
    latestAppVersion: string;
    forceUpdate: boolean;
    messageEn: string;
    messagePl: string;
    storeUrlIos: string;
    storeUrlAndroid: string;
    freeCreditsInstallCap: number;
  };
  stats?: {
    installCount: number;
    freeCreditsGrants: number;
  };
};

/** Remote setup (versions, force update, store URLs). */
export async function fetchSetupWithApi(params?: {
  auth?: Partial<CreditsApiAuth>;
}): Promise<SetupApiSnapshot | null> {
  const auth = resolveAuth(params?.auth);
  if (!auth) {
    return null;
  }
  return getJson<SetupApiSnapshot>(auth, '/v1/setup');
}

/** Spend AI credits on the backend (free pool first). */
export async function spendCreditsWithApi(params: {
  deviceId: string;
  amount: number;
  clientRequestId?: string;
  reason?: string;
  auth?: Partial<CreditsApiAuth>;
}): Promise<CreditsDeviceSnapshot | null> {
  const auth = resolveAuth(params.auth);
  if (!auth) {
    return null;
  }

  const payload = await postJson<SpendResponse>(auth, '/v1/credits/spend', {
    deviceId: params.deviceId,
    amount: params.amount,
    clientRequestId: params.clientRequestId,
    reason: params.reason ?? 'spend_ai',
  });
  return payload?.device ?? null;
}

export function isBackendApiConfigured(): boolean {
  return Boolean(env.backendApiBaseUrl?.trim());
}

/** @deprecated Use isBackendApiConfigured */
export function isCreditsApiConfigured(): boolean {
  return isBackendApiConfigured();
}
