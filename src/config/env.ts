import {
  APP_DISPLAY_NAME,
  APP_ENV,
  APP_USD_PER_STARTED_MINUTE,
  DEBUG_MODE,
  ENABLE_AUDIO_PREVIEW,
  ENABLE_WAVESPEED_STS,
  ENABLE_SOURCE_DENOISE,
  CREDITS_PER_STARTED_MINUTE,
  PREMIUM_CREDITS,
  PREMIUM_GRATIS_CREDITS,
  PREMIUM_PRICE_USD,
  STARTING_CREDITS,
  MAX_AUDIO_DURATION_FREE_SEC,
  MAX_AUDIO_DURATION_PREMIUM_SEC,
  MAX_UPLOAD_SIZE_MB,
  PROCESSING_THREADS,
  SOURCE_DENOISE_STRENGTH,
  SUPPORTED_AUDIO_FORMATS,
  WAVESPEED_API_KEY,
  CREDITS_API_BASE_URL,
  CREDITS_API_TOKEN,
} from '@env';

import {
  DEFAULT_APP_USD_PER_STARTED_MINUTE,
  DEFAULT_CREDITS_PER_STARTED_MINUTE,
  DEFAULT_PREMIUM_CREDITS,
  DEFAULT_PREMIUM_GRATIS_CREDITS,
  DEFAULT_PREMIUM_PRICE_USD,
  DEFAULT_STARTING_CREDITS,
} from '@/config/credits';
import {
  DEFAULT_MAX_AUDIO_DURATION_FREE_SEC,
  DEFAULT_MAX_AUDIO_DURATION_PREMIUM_SEC,
} from '@/constants/audioDurationDefaults';

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = parseNumber(value, fallback);
  return parsed > 0 ? parsed : fallback;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Math.floor(parseNumber(value, fallback));
  return parsed > 0 ? parsed : fallback;
}

/** Allows 0 (e.g. STARTING_CREDITS / bonus) while rejecting negatives / NaN. */
function parseNonNegativeInt(
  value: string | undefined,
  fallback: number,
): number {
  if (value === undefined || value === '') {
    return fallback;
  }
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') {
    return fallback;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

function parseFormats(value: string | undefined): string[] {
  if (!value) {
    return ['mp3'];
  }
  return value
    .split(',')
    .map(format => format.trim().toLowerCase())
    .filter(Boolean);
}

function parseOptionalSecret(value: string | undefined): string | null {
  let trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  // Strip accidental quotes from .env (WAVESPEED_API_KEY="wsk_...")
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed || null;
}

export const env = {
  appEnv: APP_ENV || 'development',
  debugMode: parseBoolean(DEBUG_MODE, __DEV__),
  maxUploadSizeMb: parseNumber(MAX_UPLOAD_SIZE_MB, 500),
  supportedAudioFormats: parseFormats(SUPPORTED_AUDIO_FORMATS),
  processingThreads: parseNumber(PROCESSING_THREADS, 2),
  enableAudioPreview: parseBoolean(ENABLE_AUDIO_PREVIEW, true),
  /** Denoise during Basic/Advanced conversion (not on import/record). */
  enableSourceDenoise: parseBoolean(ENABLE_SOURCE_DENOISE, true),
  sourceDenoiseStrength: parseNumber(SOURCE_DENOISE_STRENGTH, 0.58),
  appDisplayName: APP_DISPLAY_NAME || 'Voice App',
  /** WaveSpeed Chatterbox Speech-to-Speech — never log this value. */
  waveSpeedApiKey: parseOptionalSecret(WAVESPEED_API_KEY),
  enableWaveSpeedSts: parseBoolean(ENABLE_WAVESPEED_STS, true),
  /** Credits charged per started minute of AI (1 credit = 1 min). */
  creditsPerStartedMinute: parsePositiveInt(
    CREDITS_PER_STARTED_MINUTE,
    DEFAULT_CREDITS_PER_STARTED_MINUTE,
  ),
  /** Welcome credits for new accounts (local seed / bootstrap fallback). */
  startingCredits: parseNonNegativeInt(
    STARTING_CREDITS,
    DEFAULT_STARTING_CREDITS,
  ),
  /** Premium tier price in USD (App Store / Play). */
  premiumPriceUsd: parsePositiveNumber(
    PREMIUM_PRICE_USD,
    DEFAULT_PREMIUM_PRICE_USD,
  ),
  /**
   * App retail USD per started minute of AI (margin vs WaveSpeed $0.02).
   * Independent of pack size — pack is env PREMIUM_CREDITS + PREMIUM_GRATIS_CREDITS.
   */
  appUsdPerStartedMinute: parsePositiveNumber(
    APP_USD_PER_STARTED_MINUTE,
    DEFAULT_APP_USD_PER_STARTED_MINUTE,
  ),
  /** Paid credits in the Premium pack. */
  premiumCredits: parsePositiveInt(PREMIUM_CREDITS, DEFAULT_PREMIUM_CREDITS),
  /** Free bonus credits with Premium purchase. */
  premiumGratisCredits: parseNonNegativeInt(
    PREMIUM_GRATIS_CREDITS,
    DEFAULT_PREMIUM_GRATIS_CREDITS,
  ),
  /** Max clip duration (seconds) for free plan AI conversions. */
  maxAudioDurationFreeSec: parsePositiveInt(
    MAX_AUDIO_DURATION_FREE_SEC,
    DEFAULT_MAX_AUDIO_DURATION_FREE_SEC,
  ),
  /** Max clip duration (seconds) for premium — AI, local processing, recording. */
  maxAudioDurationPremiumSec: parsePositiveInt(
    MAX_AUDIO_DURATION_PREMIUM_SEC,
    DEFAULT_MAX_AUDIO_DURATION_PREMIUM_SEC,
  ),
  /** Credits / devices API base URL (empty = local-only credits). */
  creditsApiBaseUrl: parseOptionalSecret(CREDITS_API_BASE_URL),
  /** Bearer token for credits API (never log). */
  creditsApiToken: parseOptionalSecret(CREDITS_API_TOKEN),
} as const;

export function isWaveSpeedStsConfigured(): boolean {
  return Boolean(env.enableWaveSpeedSts && env.waveSpeedApiKey);
}

/** True when cloud AI STS is ready. */
export function isCloudAiConfigured(): boolean {
  return isWaveSpeedStsConfigured();
}

export type EnvConfig = typeof env;
