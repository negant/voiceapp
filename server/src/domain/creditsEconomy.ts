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

export function isFreeCreditsExpired(
  expiresAt: Date | string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!expiresAt) {
    return false;
  }
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return Number.isFinite(expiry.getTime()) && expiry.getTime() <= now.getTime();
}
