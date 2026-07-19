export const WET_TAIL_PADDING_SEC = 0.35;

export function mixTailFromParams(
  params: Pick<import('@/utils/audioEffectParams').AudioEffectDspParams, 'echoMix' | 'reverbMix'>,
): number {
  return 0.2 + params.echoMix * 0.35 + params.reverbMix * 0.4;
}

export function feedbackDecaySec(
  delaySec: number,
  feedbackGain: number,
  targetLinear = 0.01,
): number {
  if (feedbackGain <= 0) {
    return delaySec;
  }

  if (feedbackGain >= 1) {
    return delaySec * 12;
  }

  return delaySec * (Math.log(targetLinear) / Math.log(feedbackGain));
}
