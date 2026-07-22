import { env } from '@/config/env';

/**
 * WaveSpeed Chatterbox Speech-to-Speech paths under `AI_EFFECTS_API_BASE_URL`.
 * Docs: https://wavespeed.ai/models/chatterbox/speech-to-speech
 */
export const WAVESPEED_API_BASE_URL = env.aiEffectsApiBaseUrl;
export const WAVESPEED_STS_ENDPOINT = `${WAVESPEED_API_BASE_URL}/chatterbox/speech-to-speech`;
export const WAVESPEED_MEDIA_UPLOAD_ENDPOINT = `${WAVESPEED_API_BASE_URL}/media/upload/binary`;
export const WAVESPEED_PREDICTIONS_BASE_URL = `${WAVESPEED_API_BASE_URL}/predictions`;

export const WAVESPEED_POLL_INTERVAL_MS = 2_000;
export const WAVESPEED_REQUEST_TIMEOUT_MS = 180_000;
