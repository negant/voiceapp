import {
  applyWaveSpeedAiEffect,
  type WaveSpeedAiEffectResult,
} from '@/services/audio/aiEffects/waveSpeed/applyWaveSpeedAiEffect';
import { AI_EFFECT_DEFINITIONS } from '@/services/audio/aiEffects/registry';
import type { ApplyAiEffectOptions } from '@/services/audio/aiEffects/types';
import { isWaveSpeedStsConfigured } from '@/config/env';
import type { AiEffectId } from '@/types/voiceStudio';

export type AiEffectResult = WaveSpeedAiEffectResult;

export async function applyAiEffect(
  sourceUri: string,
  effectId: AiEffectId,
  options?: ApplyAiEffectOptions,
): Promise<AiEffectResult> {
  const definition = AI_EFFECT_DEFINITIONS[effectId];
  if (!definition) {
    throw new Error(`Unknown AI effect: ${effectId}`);
  }

  if (!isWaveSpeedStsConfigured()) {
    throw new Error(
      'WaveSpeed Speech-to-Speech is not configured (missing API key)',
    );
  }

  const hasUrl = Boolean(definition.referenceAudioUrl?.trim());
  const hasAsset = definition.referenceAudioAsset != null;
  if (!hasUrl && !hasAsset) {
    throw new Error(
      `Missing WaveSpeed reference audio for effect: ${effectId}`,
    );
  }

  return applyWaveSpeedAiEffect(
    sourceUri,
    {
      referenceAudioUrl: definition.referenceAudioUrl,
      referenceAudioAsset: definition.referenceAudioAsset,
    },
    options,
  );
}
