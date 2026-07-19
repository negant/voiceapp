import type { AudioEffectDspParams } from '@/utils/audioEffectParams';
import { feedbackDecaySec, mixTailFromParams, WET_TAIL_PADDING_SEC } from '@/services/audio/basicEffects/shared/wetDuration';
import type { WetMixGains } from '@/services/audio/basicEffects/wetPresetTypes';

export function calculateOldRadioWetTailSec(params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>): number {
  const mixTail = mixTailFromParams(params);
    const cabinetDelaySec = 0.042; const cabinetFeedback = 0.48; const slapSec = 0.118; const roomSlapSec = 0.086; const reverbSec = 0.052 + 0.132;
  return Math.max(slapSec + 0.18, roomSlapSec + 0.14, cabinetDelaySec + feedbackDecaySec(cabinetDelaySec, cabinetFeedback), reverbSec + 0.2, mixTail) + WET_TAIL_PADDING_SEC;
}

export function resolveOldRadioMixGains(params: AudioEffectDspParams): WetMixGains {
    const wetSend = Math.min(0.88, params.echoMix + params.reverbMix);
  return { bassGainDb: Math.min(params.bassGainDb, 1), masterGain: 0.9, wetSend, dryGain: Math.max(0.3, 1 - wetSend * 0.72), reverbDelay1Sec: 0.052, reverbDelay2Sec: 0.132, reverbWetGain: Math.min(0.72, params.reverbMix * 1.28) };
}
