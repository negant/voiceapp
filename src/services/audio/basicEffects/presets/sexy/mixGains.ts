import type { AudioEffectDspParams } from '@/utils/audioEffectParams';
import { feedbackDecaySec, mixTailFromParams, WET_TAIL_PADDING_SEC } from '@/services/audio/basicEffects/shared/wetDuration';
import type { WetMixGains } from '@/services/audio/basicEffects/wetPresetTypes';

export function calculateSexyVoiceWetTailSec(params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>): number {
  const mixTail = mixTailFromParams(params);
    const hauntedDelaySec = 0.078; const hauntedFeedback = 0.52; const shriekSlapSec = 0.142; const reverbSec = 0.052 + 0.148;
  return Math.max(shriekSlapSec + 0.16, hauntedDelaySec + feedbackDecaySec(hauntedDelaySec, hauntedFeedback), reverbSec + 0.2, mixTail) + WET_TAIL_PADDING_SEC;
}

export function resolveSexyVoiceMixGains(params: AudioEffectDspParams): WetMixGains {
    const wetSend = Math.min(0.95, params.echoMix + params.reverbMix);
  return { bassGainDb: Math.min(params.bassGainDb, -4), masterGain: 0.88, wetSend, dryGain: Math.max(0.28, 1 - wetSend * 0.72), reverbDelay1Sec: 0.052, reverbDelay2Sec: 0.148, reverbWetGain: Math.min(0.7, params.reverbMix * 1.25) };
}
