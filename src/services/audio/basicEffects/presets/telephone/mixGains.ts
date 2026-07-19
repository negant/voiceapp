import type { AudioEffectDspParams } from '@/utils/audioEffectParams';
import {
  feedbackDecaySec,
  mixTailFromParams,
  WET_TAIL_PADDING_SEC,
} from '@/services/audio/basicEffects/shared/wetDuration';
import type { WetMixGains } from '@/services/audio/basicEffects/wetPresetTypes';

export function calculateTelephoneWetTailSec(
  params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>,
): number {
  const mixTail = mixTailFromParams(params);
  const lineDelaySec = 0.028;
  const lineFeedback = 0.36;
  const slapSec = 0.064;
  const reverbSec = 0.038 + 0.092;

  return (
    Math.max(
      slapSec + 0.12,
      lineDelaySec + feedbackDecaySec(lineDelaySec, lineFeedback),
      reverbSec + 0.14,
      mixTail,
    ) + WET_TAIL_PADDING_SEC
  );
}

export function resolveTelephoneMixGains(params: AudioEffectDspParams): WetMixGains {
  const wetSend = Math.min(0.78, params.echoMix + params.reverbMix);

  return {
    bassGainDb: Math.min(params.bassGainDb, -1),
    masterGain: 0.92,
    wetSend,
    dryGain: Math.max(0.38, 1 - wetSend * 0.68),
    reverbDelay1Sec: 0.034,
    reverbDelay2Sec: 0.086,
    reverbWetGain: Math.min(0.58, params.reverbMix * 1.12),
  };
}
