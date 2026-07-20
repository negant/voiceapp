import type { AccountPlan, PlanEventType, Platform } from './domain/creditsEconomy.js';

export type DeviceRow = {
  device_id: string;
  platform: Platform;
  plan: AccountPlan;
  credits: number;
  free_credits: number;
  free_credits_expires_at: Date | null;
  premium_credits_renew_at: Date | null;
  installed_at: Date;
  plan_enabled_at: Date;
  plan_disabled_at: Date | null;
  app_version: string | null;
  created_at: Date;
  updated_at: Date;
  last_sync_at: Date | null;
};

export type DeviceSnapshot = {
  deviceId: string;
  platform: Platform;
  plan: AccountPlan;
  credits: number;
  freeCredits: number;
  /** Spendable total after expiry rules applied. */
  balance: number;
  freeCreditsExpiresAt: string | null;
  premiumCreditsRenewAt: string | null;
  installedAt: string;
  planEnabledAt: string;
  planDisabledAt: string | null;
  appVersion: string | null;
  lastSyncAt: string | null;
};

export type PlanEventRow = {
  id: string;
  device_id: string;
  event_type: PlanEventType;
  plan: AccountPlan;
  previous_plan: AccountPlan | null;
  meta: Record<string, unknown> | null;
  created_at: Date;
};

function toIso(value: Date | null | undefined): string | null {
  if (!value) {
    return null;
  }
  return value.toISOString();
}

export function mapDeviceRow(row: DeviceRow): DeviceSnapshot {
  return {
    deviceId: row.device_id,
    platform: row.platform,
    plan: row.plan,
    credits: row.credits,
    freeCredits: row.free_credits,
    balance: row.credits + row.free_credits,
    freeCreditsExpiresAt: toIso(row.free_credits_expires_at),
    premiumCreditsRenewAt: toIso(row.premium_credits_renew_at),
    installedAt: row.installed_at.toISOString(),
    planEnabledAt: row.plan_enabled_at.toISOString(),
    planDisabledAt: toIso(row.plan_disabled_at),
    appVersion: row.app_version,
    lastSyncAt: toIso(row.last_sync_at),
  };
}
