import type { AudioEffectDspParams } from '@/utils/audioEffectParams';
import {
  mixTailFromParams,
  WET_TAIL_PADDING_SEC,
} from '@/services/audio/basicEffects/shared/wetDuration';
import type { WetMixGains } from '@/services/audio/basicEffects/wetPresetTypes';

export function calculateAlienWetTailSec(
  params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>,
): number {
  const mixTail = mixTailFromParams(params);
  const shimmerSec = 0.284;
  const reverbSec = 0.062 + 0.168;

  return Math.max(shimmerSec + 0.22, reverbSec + 0.28, mixTail) + WET_TAIL_PADDING_SEC;
}

export function resolveAlienMixGains(params: AudioEffectDspParams): WetMixGains {
  const wetSend = Math.min(1.08, params.echoMix + params.reverbMix);

  return {
    bassGainDb: Math.min(params.bassGainDb, -3),
    masterGain: 0.9,
    wetSend,
    dryGain: Math.max(0.22, 1 - wetSend * 0.86),
    reverbDelay1Sec: 0.058,
    reverbDelay2Sec: 0.162,
    reverbWetGain: Math.min(0.82, params.reverbMix * 1.42),
  };
}
