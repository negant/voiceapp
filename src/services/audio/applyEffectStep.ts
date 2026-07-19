import { applyAdvancedEffect } from '@/services/audio/advancedEffects';
import { applyAiEffect } from '@/services/audio/aiEffects';
import { discardAiTempFile } from '@/services/audio/aiEffects/waveSpeed/applyWaveSpeedAiEffect';
import { readAudioFileArrayBuffer } from '@/services/audio/audioDecode';
import { applyAudioEffects } from '@/services/audio/audioDsp';
import { toFileUri } from '@/services/audio/audioStorage';
import type { ProcessingProgress } from '@/services/audio/basicEffects/types';
import type { SavedVoicePresetSource } from '@/types/voiceStudio';
import { getPresetEffects } from '@/utils/voiceStudioEffects';

export type ApplyEffectStepOptions = {
  onProgress?: (progress: ProcessingProgress) => void;
  signal?: AbortSignal;
  pitchStorage?: number;
};

export type EffectStepAudio = {
  bytes: Uint8Array;
  extension: 'wav' | 'mp3';
};

/** Applies a single built-in effect and returns audio bytes + container extension. */
export async function applyEffectStep(
  sourceUri: string,
  ref: SavedVoicePresetSource,
  options?: ApplyEffectStepOptions,
): Promise<EffectStepAudio> {
  if (ref.tier === 'ai') {
    const result = await applyAiEffect(sourceUri, ref.effectId, options);
    try {
      const arrayBuffer = await readAudioFileArrayBuffer(toFileUri(result.path));
      return {
        bytes: new Uint8Array(arrayBuffer),
        extension: result.extension,
      };
    } finally {
      await discardAiTempFile(result.path);
    }
  }

  if (ref.tier === 'advanced') {
    const bytes = await applyAdvancedEffect(sourceUri, ref.effectId, {
      ...options,
      pitchStorage: options?.pitchStorage,
    });
    return { bytes, extension: 'wav' };
  }

  const bytes = await applyAudioEffects(
    sourceUri,
    getPresetEffects(ref.presetId),
    {
      ...options,
      voicePresetId: ref.presetId,
    },
  );
  return { bytes, extension: 'wav' };
}
