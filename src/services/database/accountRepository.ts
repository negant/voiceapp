import { DEFAULT_ACCOUNT_PLAN } from '@/config/account';
import { SETTING_KEYS } from '@/services/database/constants';
import { getSetting, setSetting } from '@/services/database/settingsRepository';
import type { AccountPlanId } from '@/types/account';

const VALID_PLANS = new Set<AccountPlanId>(['free', 'premium']);

export function parseAccountPlan(
  value: string | null | undefined,
): AccountPlanId | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (!VALID_PLANS.has(normalized as AccountPlanId)) {
    return null;
  }

  return normalized as AccountPlanId;
}

export async function getAccountPlan(): Promise<AccountPlanId> {
  const raw = await getSetting(SETTING_KEYS.ACCOUNT_PLAN);
  return parseAccountPlan(raw) ?? DEFAULT_ACCOUNT_PLAN;
}

export async function ensureInitialAccountPlan(): Promise<AccountPlanId> {
  const raw = await getSetting(SETTING_KEYS.ACCOUNT_PLAN);
  const parsed = parseAccountPlan(raw);

  if (parsed !== null) {
    return parsed;
  }

  await setSetting(SETTING_KEYS.ACCOUNT_PLAN, DEFAULT_ACCOUNT_PLAN);
  return DEFAULT_ACCOUNT_PLAN;
}

export async function setAccountPlan(plan: AccountPlanId): Promise<void> {
  if (!VALID_PLANS.has(plan)) {
    throw new Error('Invalid account plan');
  }

  await setSetting(SETTING_KEYS.ACCOUNT_PLAN, plan);
}

export function isPremiumAccountPlan(plan: AccountPlanId): boolean {
  return plan !== 'free';
}
