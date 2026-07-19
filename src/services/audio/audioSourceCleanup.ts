import {
  trimAudioFileIfNeeded,
} from '@/services/audio/audioTrim';
import type { SelectedAudioFile } from '@/types/voiceStudio';
import { logger } from '@/utils/logger';

const LOG_SCOPE = 'AudioSourceCleanup';

export type PrepareSourceAudioOptions = {
  maxSizeMb?: number;
  maxDurationSec?: number;
  signal?: AbortSignal;
};

export type PrepareSourceAudioResult = {
  file: SelectedAudioFile;
  trimmed: boolean;
  originalDurationSec?: number;
};

/**
 * Post-import / post-record prep: trim long clips only (no preliminary denoise).
 * Denoise still runs later for Basic/Advanced conversion via `sourceDenoise.ts`.
 */
export async function prepareSourceAudio(
  file: SelectedAudioFile,
  options?: PrepareSourceAudioOptions,
): Promise<PrepareSourceAudioResult> {
  const trimResult = await trimAudioFileIfNeeded(file, options?.maxDurationSec, {
    signal: options?.signal,
    outputSuffix: 'trim',
  });

  if (!trimResult.ok) {
    logger.warn(LOG_SCOPE, 'prepareSourceAudio trim failed, keeping original', {
      reason: trimResult.reason,
      detail: trimResult.detail,
    });
    return { file, trimmed: false };
  }

  return {
    file: trimResult.file,
    trimmed: trimResult.trimmed,
    originalDurationSec: trimResult.originalDurationSec,
  };
}
