import { applyNoiseReduceAsync, softLimitPeaks } from '@/services/audio/advancedEffects/shared/noiseReduction';
import { timeStretchWithSoundTouchAsync } from '@/services/audio/advancedEffects/shared/soundtouchTimeStretch';

function buildSineWave(length: number, cycles: number, amplitude = 1): Float32Array {
  const samples = new Float32Array(length);

  for (let index = 0; index < samples.length; index += 1) {
    samples[index] =
      Math.sin((index / length) * Math.PI * 2 * cycles) * amplitude;
  }

  return samples;
}

function meanAbsolute(samples: Float32Array): number {
  let sum = 0;

  for (let index = 0; index < samples.length; index += 1) {
    sum += Math.abs(samples[index] ?? 0);
  }

  return sum / Math.max(1, samples.length);
}

function peakAbsolute(samples: Float32Array): number {
  let peak = 0;

  for (let index = 0; index < samples.length; index += 1) {
    peak = Math.max(peak, Math.abs(samples[index] ?? 0));
  }

  return peak;
}

describe('timeStretchWithSoundTouchAsync', () => {
  it('lengthens audio when tempo factor is below one', async () => {
    const input = buildSineWave(8_192, 4);
    const output = await timeStretchWithSoundTouchAsync(input, 22_050, 0.88);

    expect(output.length).toBeGreaterThan(input.length * 1.05);
  });
});

describe('applyNoiseReduceAsync', () => {
  it('reduces hiss-only sections while keeping voiced body audible', async () => {
    const hissOnly = buildSineWave(1_024, 180, 0.04);
    const voicedOnly = buildSineWave(2_048, 6, 0.35);
    const input = new Float32Array(3_072);

    input.set(hissOnly, 0);
    input.set(voicedOnly, 1_024);

    const output = await applyNoiseReduceAsync(input, 22_050, 0.6);

    expect(meanAbsolute(output.slice(0, 1_024))).toBeLessThan(
      meanAbsolute(hissOnly) * 0.75,
    );
    expect(meanAbsolute(output.slice(1_024, 3_072))).toBeGreaterThan(0.07);
  });

  it('import mode tames hot peaks without gating voiced lows', async () => {
    const voiced = buildSineWave(2_048, 4, 0.95);
    const output = await applyNoiseReduceAsync(voiced, 22_050, 0.58, undefined, {
      mode: 'import',
    });

    expect(peakAbsolute(output)).toBeLessThan(0.92);
    expect(meanAbsolute(output)).toBeGreaterThan(0.2);
  });

  it('softLimitPeaks keeps signal below the configured ceiling', () => {
    const hot = Float32Array.from([0, 0.7, 1.2, -1.35, 0.2]);
    const limited = softLimitPeaks(hot, 0.88, 0.1);

    expect(peakAbsolute(limited)).toBeLessThanOrEqual(0.88 + 1e-6);
  });
});
