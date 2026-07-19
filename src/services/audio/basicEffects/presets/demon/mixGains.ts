import type { AudioEffectDspParams } from '@/utils/audioEffectParams';
import {
  feedbackDecaySec,
  mixTailFromParams,
  WET_TAIL_PADDING_SEC,
} from '@/services/audio/basicEffects/shared/wetDuration';
import type { WetMixGains } from '@/services/audio/basicEffects/wetPresetTypes';

export function calculateDemonWetTailSec(
  params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>,
): number {
  const mixTail = mixTailFromParams(params);
  const abyssDelaySec = 0.248;
  const abyssFeedback = 0.62;
  const deepSlapSec = 0.372;
  const reverbSec = 0.104 + 0.256;

  return (
    Math.max(
      deepSlapSec + 0.24,
      abyssDelaySec + feedbackDecaySec(abyssDelaySec, abyssFeedback),
      reverbSec + 0.34,
      mixTail,
    ) + WET_TAIL_PADDING_SEC
  );
}

export function resolveDemonMixGains(params: AudioEffectDspParams): WetMixGains {
  const wetSend = Math.min(1.15, params.echoMix + params.reverbMix);

  return {
    bassGainDb: Math.max(params.bassGainDb, 10),
    masterGain: 0.84,
    wetSend,
    dryGain: Math.max(0.2, 1 - wetSend * 0.94),
    reverbDelay1Sec: 0.092,
    reverbDelay2Sec: 0.236,
    reverbWetGain: Math.min(0.9, params.reverbMix * 1.55),
  };
}
