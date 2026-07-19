import { throwIfAborted } from '@/services/audio/processingErrors';
import { CooperativeYield } from '@/utils/asyncYield';

const FRAME_BATCH = 4_096;

export type ResonantEchoTap = {
  delaySec: number;
  gain: number;
};

export type ResonantEchoConfig = {
  mix: number;
  /** Soft saturation on the wet bus — adds gravel to echoes. */
  grit?: number;
  taps?: ResonantEchoTap[];
};

const DEFAULT_COMMANDER_TAPS: ResonantEchoTap[] = [
  { delaySec: 0.092, gain: 0.14 },
  { delaySec: 0.228, gain: 0.2 },
  { delaySec: 0.356, gain: 0.15 },
];

/** Longer, louder taps for the Hall advanced preset — spacious tail vs Commander slap. */
export const HALL_RESONANT_TAPS: ResonantEchoTap[] = [
  { delaySec: 0.15, gain: 0.26 },
  { delaySec: 0.35, gain: 0.32 },
  { delaySec: 0.58, gain: 0.28 },
  { delaySec: 0.92, gain: 0.24 },
  { delaySec: 1.1, gain: 0.18 },
];

function applyGrit(sample: number, amount: number): number {
  if (amount <= 0) {
    return sample;
  }

  const drive = 1 + amount * 3.2;
  return Math.tanh(sample * drive) * (1 - amount * 0.08);
}

/**
 * Multi-tap echo with gritty wet bus — lighter take on basic commander hall/slap delays.
 */
export async function applyResonantEchoAsync(
  samples: Float32Array,
  sampleRate: number,
  config: ResonantEchoConfig,
  signal?: AbortSignal,
): Promise<Float32Array> {
  const mix = Math.max(0, Math.min(1, config.mix));
  const grit = config.grit ?? 0;
  const taps = config.taps ?? DEFAULT_COMMANDER_TAPS;

  if (mix <= 0.01 || taps.length === 0) {
    return samples.slice();
  }

  const maxDelaySamples = Math.max(
    ...taps.map(tap => Math.floor(tap.delaySec * sampleRate)),
  );
  const outputLength = samples.length + maxDelaySamples;
  const output = new Float32Array(outputLength);
  const dryGain = Math.max(0.55, 1 - mix * 0.48);
  const cooperativeYield = new CooperativeYield();

  for (let index = 0; index < samples.length; index += FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(samples.length, index + FRAME_BATCH);

    for (let i = index; i < batchEnd; i += 1) {
      output[i] = (samples[i] ?? 0) * dryGain;
    }

    await cooperativeYield.maybeYield();
  }

  for (const tap of taps) {
    const delaySamples = Math.floor(tap.delaySec * sampleRate);
    const wetGain = tap.gain * mix;

    for (let index = 0; index < samples.length; index += FRAME_BATCH) {
      throwIfAborted(signal);
      const batchEnd = Math.min(samples.length, index + FRAME_BATCH);

      for (let i = index; i < batchEnd; i += 1) {
        const targetIndex = i + delaySamples;
        if (targetIndex >= outputLength) {
          continue;
        }

        const wet = applyGrit((samples[i] ?? 0) * wetGain, grit);
        output[targetIndex] = (output[targetIndex] ?? 0) + wet;
      }

      await cooperativeYield.maybeYield();
    }
  }

  return output;
}
