import type { AudioEffectDspParams } from '@/utils/audioEffectParams';
import {
  feedbackDecaySec,
  mixTailFromParams,
  WET_TAIL_PADDING_SEC,
} from '@/services/audio/basicEffects/shared/wetDuration';
import type { WetMixGains } from '@/services/audio/basicEffects/wetPresetTypes';

export function calculateKratosWetTailSec(
  params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>,
): number {
  const mixTail = mixTailFromParams(params);
  const warDelaySec = 0.048;
  const warFeedback = 0.52;
  const hallSlapSec = 0.092;

  return (
    Math.max(
      hallSlapSec + 0.14,
      warDelaySec + feedbackDecaySec(warDelaySec, warFeedback),
      mixTail,
    ) + WET_TAIL_PADDING_SEC
  );
}

export function resolveKratosMixGains(params: AudioEffectDspParams): WetMixGains {
  const wetSend = Math.min(1.05, params.echoMix + params.reverbMix);

  return {
    bassGainDb: Math.min(params.bassGainDb, 3),
    masterGain: 0.96,
    wetSend,
    dryGain: Math.max(0.18, 1 - wetSend * 0.88),
    reverbDelay1Sec: 0.036,
    reverbDelay2Sec: 0.088,
    reverbWetGain: Math.min(0.74, params.reverbMix * 1.28),
  };
}
