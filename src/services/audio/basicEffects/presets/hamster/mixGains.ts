import type { AudioEffectDspParams } from '@/utils/audioEffectParams';
import { feedbackDecaySec, mixTailFromParams, WET_TAIL_PADDING_SEC } from '@/services/audio/basicEffects/shared/wetDuration';
import type { WetMixGains } from '@/services/audio/basicEffects/wetPresetTypes';

export function calculateHamsterWetTailSec(params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>): number {
  const mixTail = mixTailFromParams(params);
    const bounceDelaySec = 0.062; const bounceFeedback = 0.34; const chirpSlapSec = 0.034; const reverbSec = 0.044 + 0.108;
  return Math.max(chirpSlapSec + 0.1, bounceDelaySec + feedbackDecaySec(bounceDelaySec, bounceFeedback), reverbSec + 0.14, mixTail) + WET_TAIL_PADDING_SEC;
}

export function resolveHamsterMixGains(params: AudioEffectDspParams): WetMixGains {
    const wetSend = Math.min(0.62, params.echoMix + params.reverbMix);
  return { bassGainDb: Math.min(params.bassGainDb, -7), masterGain: 0.96, wetSend, dryGain: Math.max(0.4, 1 - wetSend * 0.66), reverbDelay1Sec: 0.041, reverbDelay2Sec: 0.108, reverbWetGain: Math.min(0.56, params.reverbMix * 1.12) };
}
