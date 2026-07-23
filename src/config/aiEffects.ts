/**
 * Default cloud AI Effects API root (current provider: WaveSpeed v3).
 * Override with env `AI_EFFECTS_API_BASE_URL` when the provider host/path changes.
 */
export const DEFAULT_AI_EFFECTS_API_BASE_URL =
  'https://api.wavespeed.ai/api/v3';

/**
 * Public provider status summary (no API key).
 * Override with env `AI_EFFECTS_API_STATUS_URL`.
 */
export const DEFAULT_AI_EFFECTS_API_STATUS_URL =
  'https://api.wavespeed.ai/public/v3/summary.json';

/** Strip trailing slashes so path joins stay stable. */
export function normalizeAiEffectsApiBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

export function resolveAiEffectsApiBaseUrl(
  raw: string | null | undefined,
  fallback: string = DEFAULT_AI_EFFECTS_API_BASE_URL,
): string {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return normalizeAiEffectsApiBaseUrl(fallback);
  }
  return normalizeAiEffectsApiBaseUrl(trimmed);
}

export function resolveAiEffectsApiStatusUrl(
  raw: string | null | undefined,
  fallback: string = DEFAULT_AI_EFFECTS_API_STATUS_URL,
): string {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return fallback;
  }
  return trimmed.replace(/\/+$/, '');
}
