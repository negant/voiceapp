/**
 * Domain constants for Voice App credits economy.
 * Keep aligned with app `src/config/credits.ts` and `.aiassistant/rules/credits-backend.md`.
 */

export const FREE_CREDITS_VALIDITY_MONTHS = 3;
export const PREMIUM_RENEWAL_MONTHS = 1;

export type AccountPlan = 'free' | 'premium';
export type Platform = 'ios' | 'android';

export type PlanEventType =
  | 'installed'
  | 'plan_enabled'
  | 'plan_disabled'
  | 'plan_renewed';

/** Add calendar months in UTC (day-of-month clamped by Date). */
export function addMonthsUtc(from: Date, months: number): Date {
  const next = new Date(from.getTime());
  const day = next.getUTCDate();
  next.setUTCMonth(next.getUTCMonth() + months);
  // Clamp overflow (e.g. Jan 31 + 1 month)
  if (next.getUTCDate() < day) {
    next.setUTCDate(0);
  }
  return next;
}

export function resolvePremiumPackTotal(
  premiumCredits: number,
  gratisCredits: number,
): number {
  const paid =
    Number.isFinite(premiumCredits) && premiumCredits > 0
      ? Math.floor(premiumCredits)
      : 0;
  const gratis =
    Number.isFinite(gratisCredits) && gratisCredits > 0
      ? Math.floor(gratisCredits)
      : 0;
  return paid + gratis;
}

export function totalBalance(credits: number, freeCredits: number): number {
  return Math.max(0, credits) + Math.max(0, freeCredits);
}

export function toDate(
  value: Date | string | null | undefined,
): Date | null {
  if (!value) {
    return null;
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isFinite(date.getTime()) ? date : null;
}

/**
 * Free-credit deadline = installed_at + N months.
 * Used at register and when restoring expiry after Premium downgrade.
 */
export function resolveFreeCreditsExpiresAt(
  installedAt: Date | string,
  validityMonths: number = FREE_CREDITS_VALIDITY_MONTHS,
): Date {
  const installed = toDate(installedAt) ?? new Date();
  return addMonthsUtc(installed, validityMonths);
}

export function isFreeCreditsExpired(
  expiresAt: Date | string | null | undefined,
  now: Date = new Date(),
): boolean {
  const expiry = toDate(expiresAt ?? null);
  if (!expiry) {
    return false;
  }
  return expiry.getTime() <= now.getTime();
}

/**
 * Free credits expire 3 months after install — but never while plan is premium
 * (Premium keeps remaining free credits permanently).
 */
export function shouldExpireFreeCredits(params: {
  plan: AccountPlan;
  freeCredits: number;
  freeCreditsExpiresAt: Date | string | null | undefined;
  installedAt?: Date | string | null;
  validityMonths?: number;
  now?: Date;
}): boolean {
  if (params.plan === 'premium') {
    return false;
  }
  if (params.freeCredits <= 0) {
    return false;
  }

  const now = params.now ?? new Date();
  const explicit = toDate(params.freeCreditsExpiresAt ?? null);
  if (explicit) {
    return isFreeCreditsExpired(explicit, now);
  }

  // Fallback: derive from installed_at when expires_at was cleared
  if (params.installedAt) {
    const derived = resolveFreeCreditsExpiresAt(
      params.installedAt,
      params.validityMonths ?? FREE_CREDITS_VALIDITY_MONTHS,
    );
    return isFreeCreditsExpired(derived, now);
  }

  return false;
}
