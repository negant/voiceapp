import ReactNativeBlobUtil from 'react-native-blob-util';

import {
  applyEffectStep,
  type EffectStepAudio,
} from '@/services/audio/applyEffectStep';
import type { ProcessingProgress } from '@/services/audio/basicEffects/types';
import { throwIfAborted } from '@/services/audio/processingErrors';
import {
  buildProcessedOutputPath,
  ensureAudioDirs,
  toFileUri,
} from '@/services/audio/audioStorage';
import { writeProcessedWav } from '@/services/audio/audioDsp';
import type { SavedVoicePresetSource } from '@/types/voiceStudio';

export type ProcessEffectChainOptions = {
  onProgress?: (progress: ProcessingProgress) => void;
  signal?: AbortSignal;
  pitchStorage?: number;
};

function scaleChainProgress(
  stepIndex: 0 | 1,
  progress: ProcessingProgress,
): ProcessingProgress {
  const offset = stepIndex === 0 ? 0 : 0.5;
  return {
    stage: progress.stage,
    progress: offset + progress.progress * 0.5,
  };
}

/** Runs up to two effects sequentially — step 2 receives the output of step 1. */
export async function processEffectChain(
  sourceUri: string,
  chain: [SavedVoicePresetSource, SavedVoicePresetSource],
  options?: ProcessEffectChainOptions,
): Promise<EffectStepAudio> {
  throwIfAborted(options?.signal);

  options?.onProgress?.({ stage: 'preparing', progress: 0 });

  const step1 = await applyEffectStep(sourceUri, chain[0], {
    signal: options?.signal,
    pitchStorage: options?.pitchStorage,
    onProgress: progress => {
      options?.onProgress?.(scaleChainProgress(0, progress));
    },
  });

  throwIfAborted(options?.signal);

  await ensureAudioDirs();
  const tempPath = buildProcessedOutputPath(
    `.chain-temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${step1.extension}`,
  );

  try {
    await writeProcessedWav(step1.bytes, tempPath);
    const intermediateUri = toFileUri(tempPath);

    return await applyEffectStep(intermediateUri, chain[1], {
      signal: options?.signal,
      pitchStorage: options?.pitchStorage,
      onProgress: progress => {
        options?.onProgress?.(scaleChainProgress(1, progress));
      },
    });
  } finally {
    const exists = await ReactNativeBlobUtil.fs.exists(tempPath);
    if (exists) {
      await ReactNativeBlobUtil.fs.unlink(tempPath).catch(() => undefined);
    }
  }
}
