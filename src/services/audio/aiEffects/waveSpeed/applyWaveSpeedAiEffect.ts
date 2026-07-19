import ReactNativeBlobUtil from 'react-native-blob-util';

import { convertSpeechToSpeechWithWaveSpeed } from '@/services/audio/aiEffects/waveSpeed/waveSpeedSpeechToSpeech';
import { throwIfAborted } from '@/services/audio/processingErrors';
import type { ApplyAiEffectOptions } from '@/services/audio/aiEffects/types';
import type { ProcessingStage } from '@/services/audio/basicEffects/types';
import { logger } from '@/utils/logger';

const LOG_SCOPE = 'WaveSpeedAi';

function reportProgress(
  options: ApplyAiEffectOptions | undefined,
  stage: ProcessingStage,
  progress: number,
): void {
  options?.onProgress?.({ stage, progress });
  logger.debug(LOG_SCOPE, stage, { progress, engine: 'wavespeed' });
}

export type WaveSpeedReferenceInput = {
  referenceAudioUrl?: string;
  referenceAudioAsset?: number;
};

export type WaveSpeedAiEffectResult = {
  /** Temp MP3 from WaveSpeed — caller moves or deletes. */
  path: string;
  extension: 'mp3';
};

/**
 * Cloud speech-to-speech via WaveSpeed Chatterbox → keep API MP3 as-is.
 */
export async function applyWaveSpeedAiEffect(
  sourceUri: string,
  reference: WaveSpeedReferenceInput,
  options?: ApplyAiEffectOptions,
): Promise<WaveSpeedAiEffectResult> {
  reportProgress(options, 'inference', 0.2);
  const inferenceStartedAt = Date.now();
  const { mp3Path } = await convertSpeechToSpeechWithWaveSpeed({
    sourceUri,
    audioBase64: options?.audioBase64,
    sourceExtension: options?.sourceExtension,
    sourceMime: options?.sourceMime,
    referenceAudioUrl: reference.referenceAudioUrl,
    referenceAudioAsset: reference.referenceAudioAsset,
    signal: options?.signal,
  });
  logger.info(LOG_SCOPE, 'sts complete', {
    inferenceMs: Date.now() - inferenceStartedAt,
    mp3Path,
  });
  throwIfAborted(options?.signal);

  reportProgress(options, 'saving', 1);
  return { path: mp3Path, extension: 'mp3' };
}

/** Deletes a temp cloud STS file if it still exists. */
export async function discardAiTempFile(path: string): Promise<void> {
  const exists = await ReactNativeBlobUtil.fs.exists(path);
  if (exists) {
    await ReactNativeBlobUtil.fs.unlink(path).catch(() => undefined);
  }
}
