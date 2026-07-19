import type { AudioEffectDspParams } from '@/utils/audioEffectParams';

import {
  feedbackDecaySec,
  mixTailFromParams,
  WET_TAIL_PADDING_SEC,
} from '@/services/audio/basicEffects/shared/wetDuration';
import type { WetMixGains } from '@/services/audio/basicEffects/wetPresetTypes';

export function calculateRobotWetTailSec(
  params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>,
): number {
  const mixTail = mixTailFromParams(params);
  const primaryDelaySec = 0.056;
  const primaryFeedback = 0.68;
  const slapSec = 0.124;

  return (
    Math.max(
      slapSec + 0.12,
      primaryDelaySec + feedbackDecaySec(primaryDelaySec, primaryFeedback),
      mixTail,
    ) + WET_TAIL_PADDING_SEC
  );
}

export function resolveRobotMixGains(params: AudioEffectDspParams): WetMixGains {
  const wetSend = Math.min(1.15, params.echoMix + params.reverbMix);

  return {
    bassGainDb: Math.min(params.bassGainDb, -5),
    masterGain: 1,
    wetSend,
    dryGain: Math.max(0.06, 1 - wetSend * 1.05),
    reverbDelay1Sec: 0.024,
    reverbDelay2Sec: 0.064,
    reverbWetGain: Math.min(0.78, params.reverbMix * 1.35),
  };
}
