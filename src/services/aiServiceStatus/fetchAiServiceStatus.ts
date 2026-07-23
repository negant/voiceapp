import { env } from '@/config/env';
import { DEFAULT_AI_EFFECTS_API_STATUS_URL } from '@/config/aiEffects';

import {
  buildAiServiceStatusSnapshot,
  unknownAiServiceStatusSnapshot,
} from './resolveAiServiceStatus';
import type {
  AiServiceStatusSnapshot,
  WaveSpeedStatusSummary,
} from './types';

/** @deprecated Prefer DEFAULT_AI_EFFECTS_API_STATUS_URL from config/aiEffects. */
export const DEFAULT_AI_SERVICE_STATUS_URL = DEFAULT_AI_EFFECTS_API_STATUS_URL;

const FETCH_TIMEOUT_MS = 12_000;

/** Uses `AI_EFFECTS_API_STATUS_URL` (via env) — no periodic polling. */
export function resolveAiServiceStatusUrl(
  overrideUrl?: string | null,
): string {
  const trimmed = overrideUrl?.trim();
  if (trimmed) {
    return trimmed.replace(/\/+$/, '');
  }
  return env.aiEffectsApiStatusUrl || DEFAULT_AI_EFFECTS_API_STATUS_URL;
}

export async function fetchAiServiceStatus(
  statusUrl: string = resolveAiServiceStatusUrl(),
): Promise<AiServiceStatusSnapshot> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      return unknownAiServiceStatusSnapshot('fallback');
    }

    const payload = (await response.json()) as WaveSpeedStatusSummary;
    return buildAiServiceStatusSnapshot(payload, 'network');
  } catch {
    return unknownAiServiceStatusSnapshot('fallback');
  } finally {
    clearTimeout(timeoutId);
  }
}
