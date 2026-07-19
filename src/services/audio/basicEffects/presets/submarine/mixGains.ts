import type { AudioEffectDspParams } from '@/utils/audioEffectParams';
import { feedbackDecaySec, mixTailFromParams, WET_TAIL_PADDING_SEC } from '@/services/audio/basicEffects/shared/wetDuration';
import type { WetMixGains } from '@/services/audio/basicEffects/wetPresetTypes';

export function calculateSubmarineWetTailSec(params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>): number {
  const mixTail = mixTailFromParams(params);
    const hullDelaySec = 0.224; const hullFeedback = 0.4; const deepSlapSec = 0.386; const reverbSec = 0.082 + 0.212;
  return Math.max(deepSlapSec + 0.28, hullDelaySec + feedbackDecaySec(hullDelaySec, hullFeedback), reverbSec + 0.32, mixTail) + WET_TAIL_PADDING_SEC;
}

export function resolveSubmarineMixGains(params: AudioEffectDspParams): WetMixGains {
    const wetSend = Math.min(0.92, params.echoMix + params.reverbMix);
  return { bassGainDb: Math.max(params.bassGainDb, 2), masterGain: 0.86, wetSend, dryGain: Math.max(0.26, 1 - wetSend * 0.78), reverbDelay1Sec: 0.082, reverbDelay2Sec: 0.208, reverbWetGain: Math.min(0.82, params.reverbMix * 1.42) };
}
