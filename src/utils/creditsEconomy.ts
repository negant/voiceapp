import {
  AI_STARTED_MINUTE_SEC,
  DEFAULT_CREDITS_PER_STARTED_MINUTE,
} from '@/config/credits';

export type CreditsEconomy = {
  creditsPerStartedMinute: number;
};

/**
 * Billable AI length in **started minutes** (WaveSpeed-style).
 * 1 s–60 s → 1 min; 61 s–120 s → 2 min; etc.
 */
export function normalizeAiBillableStartedMinutes(durationSec: number): number {
  if (durationSec <= 0) {
    return 0;
  }

  return Math.ceil(durationSec / AI_STARTED_MINUTE_SEC);
}

/** @deprecated Prefer normalizeAiBillableStartedMinutes — returns started minutes × 60. */
export function normalizeAiBillableDurationSec(durationSec: number): number {
  return normalizeAiBillableStartedMinutes(durationSec) * AI_STARTED_MINUTE_SEC;
}

/**
 * Credits charged for AI conversion — started minutes × credits per minute.
 * Default: 1 credit = 1 started minute.
 */
export function calculateCreditsForAiDurationSec(
  durationSec: number,
  creditsPerStartedMinute: number = DEFAULT_CREDITS_PER_STARTED_MINUTE,
): number {
  if (durationSec <= 0 || creditsPerStartedMinute <= 0) {
    return 0;
  }

  return (
    normalizeAiBillableStartedMinutes(durationSec) * creditsPerStartedMinute
  );
}

/**
 * How many whole seconds of AI the balance can afford
 * (started minutes × 60), for duration caps.
 */
export function calculateAiSecondsAffordableFromCredits(
  credits: number,
  creditsPerStartedMinute: number = DEFAULT_CREDITS_PER_STARTED_MINUTE,
): number {
  if (credits <= 0 || creditsPerStartedMinute <= 0) {
    return 0;
  }

  const minutes = Math.floor(credits / creditsPerStartedMinute);
  return minutes * AI_STARTED_MINUTE_SEC;
}

/** How many started minutes the balance can afford. */
export function calculateAiMinutesAffordableFromCredits(
  credits: number,
  creditsPerStartedMinute: number = DEFAULT_CREDITS_PER_STARTED_MINUTE,
): number {
  if (credits <= 0 || creditsPerStartedMinute <= 0) {
    return 0;
  }

  return Math.floor(credits / creditsPerStartedMinute);
}

/** @deprecated Use calculateAiMinutesAffordableFromCredits */
export function calculateAi10SecPreviewsFromCredits(
  credits: number,
  creditsPerStartedMinute: number = DEFAULT_CREDITS_PER_STARTED_MINUTE,
): number {
  return calculateAiMinutesAffordableFromCredits(
    credits,
    creditsPerStartedMinute,
  );
}

export function formatAiDurationSeconds(seconds: number, locale: string): string {
  const value = Math.max(0, seconds);
  const intlLocale = locale === 'pl' ? 'pl-PL' : 'en-US';

  return new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatAiDurationMinutes(minutes: number, locale: string): string {
  return formatAiDurationSeconds(minutes, locale);
}

/** USD price for Premium / billing UI (keeps cents, e.g. 4.99). */
export function formatUsdPrice(amount: number, locale: string): string {
  const value = Math.max(0, amount);
  const intlLocale = locale === 'pl' ? 'pl-PL' : 'en-US';

  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Whole and fractional hours from started minutes (e.g. 250 → "4.2"). */
export function formatStartedMinutesAsHours(
  minutes: number,
  locale: string,
): string {
  const hours = Math.max(0, minutes) / 60;
  const intlLocale = locale === 'pl' ? 'pl-PL' : 'en-US';

  return new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(hours);
}

/** Max AI seconds allowed by plan limit and current credit balance. */
export function resolveEffectiveAiMaxDurationSec(
  planLimitSec: number,
  affordableAiSeconds: number,
): number {
  if (planLimitSec <= 0 || affordableAiSeconds <= 0) {
    return 0;
  }

  return Math.min(planLimitSec, affordableAiSeconds);
}

/**
 * Seconds of audio to send for AI (capped by tier limit).
 * Billing still uses started minutes of this length.
 */
export function resolveAiBillableDurationSec(
  durationSec: number | null,
  maxDurationSec: number,
): number {
  if (durationSec === null || durationSec <= 0) {
    return maxDurationSec;
  }

  const capped = Math.min(durationSec, maxDurationSec);
  return capped > 0 ? capped : 0;
}
