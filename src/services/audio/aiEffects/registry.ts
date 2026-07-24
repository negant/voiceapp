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
  demonMale: {
    id: 'demonMale',
    engine: 'wavespeed',
    referenceAudioAsset: WAVESPEED_REFERENCE_AUDIO_ASSETS.demonMale,
  },
  frenchFemale: {
    id: 'frenchFemale',
    engine: 'wavespeed',
    referenceAudioAsset: WAVESPEED_REFERENCE_AUDIO_ASSETS.frenchFemale,
  },
  matureMale: {
    id: 'matureMale',
    engine: 'wavespeed',
    referenceAudioAsset: WAVESPEED_REFERENCE_AUDIO_ASSETS.matureMale,
  },
  femaleSensual: {
    id: 'femaleSensual',
    engine: 'wavespeed',
    referenceAudioAsset: WAVESPEED_REFERENCE_AUDIO_ASSETS.femaleSensual,
  },
};
