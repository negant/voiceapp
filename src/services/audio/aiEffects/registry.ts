import type { AiEffectDefinition } from '@/services/audio/aiEffects/types';
import { WAVESPEED_REFERENCE_AUDIO_ASSETS } from '@/constants/waveSpeedReferences';
import type { AiEffectId } from '@/types/voiceStudio';

export const AI_EFFECT_DEFINITIONS: Record<AiEffectId, AiEffectDefinition> = {
  narratorka: {
    id: 'narratorka',
    engine: 'wavespeed',
    referenceAudioAsset: WAVESPEED_REFERENCE_AUDIO_ASSETS.narratorka,
  },
  narrator: {
    id: 'narrator',
    engine: 'wavespeed',
    referenceAudioAsset: WAVESPEED_REFERENCE_AUDIO_ASSETS.narrator,
  },
  legionista: {
    id: 'legionista',
    engine: 'wavespeed',
    referenceAudioAsset: WAVESPEED_REFERENCE_AUDIO_ASSETS.legionista,
  },
};
