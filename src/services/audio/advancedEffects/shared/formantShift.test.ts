import { applyFormantShiftAsync } from '@/services/audio/advancedEffects/shared/formantShift';

function meanAbsoluteDifference(a: Float32Array, b: Float32Array): number {
  const length = Math.min(a.length, b.length);
  let sum = 0;

  for (let index = 0; index < length; index += 1) {
    sum += Math.abs((a[index] ?? 0) - (b[index] ?? 0));
  }

  return sum / length;
}

function buildVoicedLikeSignal(length: number, sampleRate: number): Float32Array {
  const samples = new Float32Array(length);

  for (let index = 0; index < length; index += 1) {
    const time = index / sampleRate;
    const f0 = 180;
    samples[index] =
      0.55 * Math.sin(2 * Math.PI * f0 * time) +
      0.25 * Math.sin(2 * Math.PI * f0 * 2.7 * time) +
      0.15 * Math.sin(2 * Math.PI * f0 * 4.1 * time);
  }

  return samples;
}

describe('applyFormantShiftAsync', () => {
  it('returns a copy when factor is neutral', async () => {
    const input = new Float32Array([0.2, -0.1, 0.35, 0.05]);
    const output = await applyFormantShiftAsync(input, 1);

    expect(output).not.toBe(input);
    expect(Array.from(output)).toEqual(Array.from(input));
  });

  it('preserves output length', async () => {
    const input = buildVoicedLikeSignal(8_192, 22_050);
    const output = await applyFormantShiftAsync(input, 1.12);

    expect(output.length).toBe(input.length);
  });

  it('changes spectral envelope for non-neutral factors', async () => {
    const input = buildVoicedLikeSignal(12_288, 22_050);
    const brighter = await applyFormantShiftAsync(input, 1.15);
    const darker = await applyFormantShiftAsync(input, 0.85);

    expect(meanAbsoluteDifference(input, brighter)).toBeGreaterThan(0.002);
    expect(meanAbsoluteDifference(input, darker)).toBeGreaterThan(0.002);
    expect(meanAbsoluteDifference(brighter, darker)).toBeGreaterThan(0.004);
  });
});
