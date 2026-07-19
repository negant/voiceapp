/** Envelope for short static bursts so they fade in/out like tuner crackle. */
export function radioBurstEnvelope(
  index: number,
  total: number,
  attackSamples: number,
  releaseSamples: number,
): number {
  if (index < attackSamples) {
    return index / attackSamples;
  }

  const releaseStart = total - releaseSamples;
  if (index >= releaseStart) {
    return Math.max(0, (total - index) / releaseSamples);
  }

  return 1;
}
