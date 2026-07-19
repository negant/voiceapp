import { env } from '@/config/env';
import {
  DEFAULT_MAX_AUDIO_DURATION_FREE_SEC,
  DEFAULT_MAX_AUDIO_DURATION_PREMIUM_SEC,
} from '@/constants/audioDurationDefaults';
import type { AccountPlanId } from '@/types/account';

export {
  DEFAULT_MAX_AUDIO_DURATION_FREE_SEC,
  DEFAULT_MAX_AUDIO_DURATION_PREMIUM_SEC,
} from '@/constants/audioDurationDefaults';

function resolveFreeMaxDurationSec(): number {
  const value = env.maxAudioDurationFreeSec;
  return typeof value === 'number' && value > 0
    ? value
    : DEFAULT_MAX_AUDIO_DURATION_FREE_SEC;
}

function resolvePremiumMaxDurationSec(): number {
  const value = env.maxAudioDurationPremiumSec;
  return typeof value === 'number' && value > 0
    ? value
    : DEFAULT_MAX_AUDIO_DURATION_PREMIUM_SEC;
}

/**
 * Max clip length for the account plan (import, recording, processing).
 * Free: 1 min (1 AI credit). Premium: 10 min.
 */
export function resolvePlanMaxDurationSec(plan: AccountPlanId): number {
  return plan === 'free'
    ? resolveFreeMaxDurationSec()
    : resolvePremiumMaxDurationSec();
}

/** @deprecated Prefer resolvePlanMaxDurationSec(plan) — premium ceiling only. */
export const LOCAL_MAX_AUDIO_DURATION_SEC = resolvePremiumMaxDurationSec();

/** Free-plan max duration (seconds). Prefer resolvePlanMaxDurationSec('free'). */
export const AI_FREE_MAX_AUDIO_DURATION_SEC = resolveFreeMaxDurationSec();

/** @deprecated Use resolvePlanMaxDurationSec / resolveAiMaxDurationSec. */
export const AI_MAX_AUDIO_DURATION_SEC = AI_FREE_MAX_AUDIO_DURATION_SEC;

/** @deprecated Prefer resolvePlanMaxDurationSec(plan). */
export const RECORDING_MAX_DURATION_SEC = LOCAL_MAX_AUDIO_DURATION_SEC;

export const LOCAL_MAX_DURATION_MINUTES = LOCAL_MAX_AUDIO_DURATION_SEC / 60;

export const FREE_MAX_DURATION_MINUTES = AI_FREE_MAX_AUDIO_DURATION_SEC / 60;

/**
 * Hard safety ceiling for absurdly large imports — primary gate is duration, not size.
 */
export const IMPORT_SAFETY_MAX_SIZE_MB = 500;

/** AI conversion cap by plan (same as overall plan max). */
export function resolveAiMaxDurationSec(plan: AccountPlanId): number {
  return resolvePlanMaxDurationSec(plan);
}

export function resolveMaxDurationSecForTier(
  tier: 'basic' | 'advanced' | 'ai',
  plan: AccountPlanId = 'free',
): number {
  return resolvePlanMaxDurationSec(plan);
}

export function resolveImportMaxSizeMb(envMaxUploadSizeMb: number): number {
  if (!Number.isFinite(envMaxUploadSizeMb) || envMaxUploadSizeMb <= 0) {
    return IMPORT_SAFETY_MAX_SIZE_MB;
  }

  return Math.min(envMaxUploadSizeMb, IMPORT_SAFETY_MAX_SIZE_MB);
}
