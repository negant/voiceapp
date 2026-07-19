import {
  applyGainAsync,
  applyLowShelfAsync,
  applySoftClipAsync,
  applyWaveshaperAsync,
} from '@/services/audio/advancedEffects/shared/filters';

function meanAbsoluteDifference(a: Float32Array, b: Float32Array): number {
  const length = Math.min(a.length, b.length);
  let sum = 0;

  for (let index = 0; index < length; index += 1) {
    sum += Math.abs((a[index] ?? 0) - (b[index] ?? 0));
  }

  return sum / length;
}

describe('applySoftClipAsync', () => {
  it('returns a copy when amount is zero', async () => {
    const input = new Float32Array([0.2, -0.4, 0.6]);
    const output = await applySoftClipAsync(input, 0);

    expect(output).not.toBe(input);
    expect(Array.from(output)).toEqual(Array.from(input));
  });

  it('compresses peaks for non-zero drive', async () => {
    const input = new Float32Array([0, 0.5, 1]);
    const output = await applySoftClipAsync(input, 0.38);

    expect(output[2]).toBeLessThan(input[2] ?? 0);
    expect(output[1]).toBeGreaterThan(0);
  });
});

describe('applyLowShelfAsync', () => {
  it('boosts low-frequency energy', async () => {
    const input = new Float32Array(512).fill(0.2);
    const output = await applyLowShelfAsync(input, 22_050, 180, 12);

    expect(output[output.length - 1]).toBeGreaterThan(input[0] ?? 0);
  });
});

describe('applyGainAsync', () => {
  it('scales samples by linear gain', async () => {
    const input = new Float32Array([0.5, -1]);
    const output = await applyGainAsync(input, 0.5);

    expect(Array.from(output)).toEqual([0.25, -0.5]);
  });
});

describe('applyWaveshaperAsync', () => {
  it('adds harmonics with hot input gain', async () => {
    const input = new Float32Array([0, 0.15, 0.35, 0.55, 0.75]);
    const mild = await applyWaveshaperAsync(input, 0.58, 1);
    const hot = await applyWaveshaperAsync(input, 0.58, 2.6);

    expect(meanAbsoluteDifference(mild, hot)).toBeGreaterThan(0.02);
    expect(hot[4]).not.toBe(input[4]);
  });
});
