import { throwIfAborted } from '@/services/audio/processingErrors';
import { CooperativeYield } from '@/utils/asyncYield';

const FRAME_SIZE = 2_048;
const FRAME_HOP = 1_024;
const FRAME_BATCH = 4_096;

/** Import: HPF + HF tame + peak limit — no gate (avoids pumping artifacts on source). */
export type NoiseReduceMode = 'import' | 'processing';

export type NoiseReduceOptions = {
  mode?: NoiseReduceMode;
};

function frameRms(samples: Float32Array, start: number, end: number): number {
  let sum = 0;
  const length = Math.max(1, end - start);

  for (let index = start; index < end; index += 1) {
    const sample = samples[index] ?? 0;
    sum += sample * sample;
  }

  return Math.sqrt(sum / length);
}

function estimateNoiseFloor(samples: Float32Array): number {
  const rmsValues: number[] = [];

  for (let start = 0; start < samples.length; start += FRAME_HOP) {
    const end = Math.min(samples.length, start + FRAME_SIZE);
    rmsValues.push(frameRms(samples, start, end));
  }

  if (rmsValues.length === 0) {
    return 0.001;
  }

  const sorted = [...rmsValues].sort((left, right) => left - right);
  const quietIndex = Math.floor(sorted.length * 0.12);

  return Math.max(sorted[quietIndex] ?? 0.001, 0.000_5);
}

function onePoleHighPass(
  samples: Float32Array,
  sampleRate: number,
  frequencyHz: number,
): Float32Array {
  const output = new Float32Array(samples.length);
  const rc = 1 / (2 * Math.PI * frequencyHz);
  const dt = 1 / sampleRate;
  const alpha = rc / (rc + dt);
  let previousInput = samples[0] ?? 0;
  let previousOutput = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const input = samples[index] ?? 0;
    const filtered = alpha * (previousOutput + input - previousInput);
    output[index] = filtered;
    previousInput = input;
    previousOutput = filtered;
  }

  return output;
}

/** Transparent knee limiter — tames hot peaks before downstream saturation. */
export function softLimitPeaks(
  samples: Float32Array,
  ceiling = 0.88,
  knee = 0.1,
): Float32Array {
  const output = new Float32Array(samples.length);
  const threshold = Math.max(0.5, ceiling - knee);

  for (let index = 0; index < samples.length; index += 1) {
    const input = samples[index] ?? 0;
    const sign = Math.sign(input);
    const magnitude = Math.abs(input);

    if (magnitude <= threshold) {
      output[index] = input;
      continue;
    }

    const excess = magnitude - threshold;
    output[index] = sign * (threshold + knee * Math.tanh(excess / knee));
  }

  return output;
}

/**
 * Noise cleanup for phone uploads — rumble HPF, optional gate, HF/presence tame, peak limit.
 * Import mode skips the gate so later pipelines do not inherit gate pumping artifacts.
 */
export async function applyNoiseReduceAsync(
  samples: Float32Array,
  sampleRate: number,
  strength = 0.55,
  signal?: AbortSignal,
  options?: NoiseReduceOptions,
): Promise<Float32Array> {
  if (strength <= 0) {
    return samples.slice();
  }

  const clampedStrength = Math.max(0, Math.min(1, strength));
  const mode = options?.mode ?? 'processing';
  const useGate = mode === 'processing';

  const rumbleCutHz = mode === 'import' ? 90 : 78;
  const highPassed = onePoleHighPass(samples, sampleRate, rumbleCutHz);

  const output = new Float32Array(highPassed.length);
  const noiseFloor = estimateNoiseFloor(highPassed);
  const gateThreshold = noiseFloor * (1.9 + clampedStrength * 1.15);
  const minimumGain = 0.05 + (1 - clampedStrength) * 0.1;
  const hissCut = 0.24 + clampedStrength * 0.34;
  const presenceCut = 0.12 + clampedStrength * 0.22;
  const presenceRatioThreshold = 0.28 + (1 - clampedStrength) * 0.08;

  const hissRc = 1 / (2 * Math.PI * 2_600);
  const presenceRc = 1 / (2 * Math.PI * 3_400);
  const dt = 1 / sampleRate;
  const hissAlpha = dt / (hissRc + dt);
  const presenceAlpha = dt / (presenceRc + dt);

  let envelope = 0;
  let hissState = highPassed[0] ?? 0;
  let presenceState = highPassed[0] ?? 0;
  const attack = 0.018;
  const release = 0.000_7;
  const cooperativeYield = new CooperativeYield();

  for (let index = 0; index < highPassed.length; index += FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(highPassed.length, index + FRAME_BATCH);

    for (let i = index; i < batchEnd; i += 1) {
      const input = highPassed[i] ?? 0;
      const magnitude = Math.abs(input);
      const smoothing = magnitude > envelope ? attack : release;
      envelope += (magnitude - envelope) * smoothing;

      let gain = 1;
      if (useGate && envelope < gateThreshold) {
        const ratio = envelope / gateThreshold;
        gain = minimumGain + (1 - minimumGain) * ratio * ratio;
      }

      hissState += hissAlpha * (input - hissState);
      const highBand = input - hissState;
      const hissAttenuation =
        hissCut *
        (useGate
          ? 1 - Math.min(1, envelope / gateThreshold)
          : 0.55 + clampedStrength * 0.25);

      presenceState += presenceAlpha * (input - presenceState);
      const presenceBand = input - presenceState;
      const presenceRatio =
        envelope > 1e-4 ? Math.abs(presenceBand) / envelope : 0;
      const presenceAttenuation =
        presenceRatio > presenceRatioThreshold
          ? presenceCut * Math.min(1, (presenceRatio - presenceRatioThreshold) * 2.5)
          : 0;

      const cleaned =
        input -
        highBand * hissAttenuation -
        presenceBand * presenceAttenuation;

      output[i] = cleaned * gain;
    }

    await cooperativeYield.maybeYield();
  }

  const peakCeiling = mode === 'import' ? 0.9 - clampedStrength * 0.04 : 0.86;
  return softLimitPeaks(output, peakCeiling);
}
