import type { AccountPlanId } from '@/types/account';

/** Device snapshot returned by credits API. */
export type CreditsDeviceSnapshot = {
  deviceId: string;
  platform: 'ios' | 'android';
  plan: AccountPlanId;
  credits: number;
  freeCredits: number;
  balance: number;
  freeCreditsExpiresAt: string | null;
  premiumCreditsRenewAt: string | null;
  installedAt: string;
  planEnabledAt: string;
  planDisabledAt: string | null;
  appVersion: string | null;
  lastSyncAt: string | null;
};

export type CreditsApiAuth = {
  apiBaseUrl: string;
  apiToken?: string | null;
};
