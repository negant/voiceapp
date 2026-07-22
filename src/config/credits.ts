/**
 * Cloud AI provider bills ~**$0.02 per started minute** of source audio (API cost).
 * Retail pricing is `PREMIUM_PRICE_USD` + pack size — not a per-minute env rate.
 */
export const AI_EFFECTS_USD_PER_STARTED_MINUTE = 0.02;

/** @deprecated Use AI_EFFECTS_USD_PER_STARTED_MINUTE */
export const WAVESPEED_USD_PER_STARTED_MINUTE = AI_EFFECTS_USD_PER_STARTED_MINUTE;

/** Single Premium tier price in USD (env `PREMIUM_PRICE_USD`). */
export const DEFAULT_PREMIUM_PRICE_USD = 4.99;

/** Paid credits included in Premium (env `PREMIUM_CREDITS`). */
export const DEFAULT_PREMIUM_CREDITS = 100;

/** Free bonus credits with Premium (env `PREMIUM_GRATIS_CREDITS`). */
export const DEFAULT_PREMIUM_GRATIS_CREDITS = 25;

/** Credits charged per started minute of AI (env `CREDITS_PER_STARTED_MINUTE`). */
export const DEFAULT_CREDITS_PER_STARTED_MINUTE = 1;

/** Seconds in one billing minute. */
export const AI_STARTED_MINUTE_SEC = 60;

/**
 * Free-plan welcome credits on first install (env `STARTING_CREDITS`).
 * 10 credits ≈ $0.20 API cost at $0.02 / started minute if fully used.
 */
export const DEFAULT_STARTING_CREDITS = 10;

/** Free-plan welcome credits valid for this many months (backend + UI copy). */
export const FREE_CREDITS_VALIDITY_MONTHS = 3;

/** Premium pack renews on this interval (months). */
export const PREMIUM_CREDITS_RENEWAL_MONTHS = 1;

/**
 * Promotional pool: first N unique installs may receive the free welcome grant (backend).
 * Server source of truth: voiceapp_setup.free_credits_install_cap (default 30).
 */
export const FREE_INSTALLS_WITH_TEST_CREDITS = 30;

/** Upper bound on credits reserved for the install pool. */
export const FREE_TEST_CREDITS_POOL_TOTAL =
  FREE_INSTALLS_WITH_TEST_CREDITS * Math.max(DEFAULT_STARTING_CREDITS, 1);

/** Total credits granted on Premium purchase (paid + gratis). */
export function resolvePremiumIncludedStartedMinutes(
  premiumCredits: number,
  gratisCredits: number = DEFAULT_PREMIUM_GRATIS_CREDITS,
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

/** @deprecated Prefer DEFAULT_PREMIUM_PRICE_USD / env.premiumPriceUsd */
export const PREMIUM_PRICE_USD = DEFAULT_PREMIUM_PRICE_USD;

/** @deprecated Prefer env.premiumCredits */
export const PREMIUM_BASE_CREDITS = DEFAULT_PREMIUM_CREDITS;

/** @deprecated Prefer env.premiumGratisCredits / DEFAULT_PREMIUM_GRATIS_CREDITS */
export const PREMIUM_BONUS_FREE_CREDITS = DEFAULT_PREMIUM_GRATIS_CREDITS;

/** @deprecated Prefer DEFAULT_PREMIUM_GRATIS_CREDITS */
export const DEFAULT_PREMIUM_BONUS_FREE_CREDITS = DEFAULT_PREMIUM_GRATIS_CREDITS;

/** @deprecated Prefer resolvePremiumIncludedStartedMinutes(env...) */
export const PREMIUM_INCLUDED_STARTED_MINUTES =
  resolvePremiumIncludedStartedMinutes(
    DEFAULT_PREMIUM_CREDITS,
    DEFAULT_PREMIUM_GRATIS_CREDITS,
  );

/** @deprecated Legacy SQLite / API field — prefer started-minute economy. */
export const DEFAULT_CREDITS_PER_AI_10_SEC = 1;

/** @deprecated */
export const AI_CREDITS_BILLING_CHUNK_SEC = AI_STARTED_MINUTE_SEC;

/** @deprecated Use DEFAULT_CREDITS_PER_STARTED_MINUTE */
export const DEFAULT_CREDITS_PER_AI_SECOND = DEFAULT_CREDITS_PER_STARTED_MINUTE;

/** @deprecated Use DEFAULT_STARTING_CREDITS */
export const STARTING_CREDITS = DEFAULT_STARTING_CREDITS;
