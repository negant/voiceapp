import type { AudioEffectDspParams } from '@/utils/audioEffectParams';
import { mixTailFromParams, WET_TAIL_PADDING_SEC } from '@/services/audio/basicEffects/shared/wetDuration';
import type { WetMixGains } from '@/services/audio/basicEffects/wetPresetTypes';

export function calculateHeliumWetTailSec(params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>): number {
  const mixTail = mixTailFromParams(params);
    const nasalSlapSec = 0.048; const reverbSec = 0.038 + 0.092;
  return Math.max(nasalSlapSec + 0.08, reverbSec + 0.12, mixTail) + WET_TAIL_PADDING_SEC;
}

export function resolveHeliumMixGains(params: AudioEffectDspParams): WetMixGains {
    const wetSend = Math.min(0.58, params.echoMix + params.reverbMix);
  return { bassGainDb: Math.min(params.bassGainDb, -6), masterGain: 0.94, wetSend, dryGain: Math.max(0.42, 1 - wetSend * 0.62), reverbDelay1Sec: 0.036, reverbDelay2Sec: 0.092, reverbWetGain: Math.min(0.52, params.reverbMix * 1.08) };
}
