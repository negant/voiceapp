import { CooperativeYield, COOPERATIVE_FRAME_BATCH } from '@/utils/asyncYield';
import { throwIfAborted } from '@/services/audio/processingErrors';

/** Target rate for voice DSP — halves sample count vs 44.1 kHz with acceptable quality. */
export const VOICE_PROCESSING_SAMPLE_RATE = 22_050;

export function resampleMono(
  samples: Float32Array,
  sourceRate: number,
  targetRate: number,
): Float32Array {
  if (sourceRate === targetRate) {
    return samples.slice();
  }

  const outputLength = Math.max(
    1,
    Math.round((samples.length * targetRate) / sourceRate),
  );
  const output = new Float32Array(outputLength);
  const step = sourceRate / targetRate;

  for (let i = 0; i < outputLength; i += 1) {
    const sourcePosition = i * step;
    const index = Math.floor(sourcePosition);
    const fraction = sourcePosition - index;
    const a = samples[index] ?? 0;
    const b = samples[Math.min(index + 1, samples.length - 1)] ?? 0;
    output[i] = a + (b - a) * fraction;
  }

  return output;
}

export async function resampleMonoAsync(
  samples: Float32Array,
  sourceRate: number,
  targetRate: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  if (sourceRate === targetRate) {
    return samples.slice();
  }

  const outputLength = Math.max(
    1,
    Math.round((samples.length * targetRate) / sourceRate),
  );
  const output = new Float32Array(outputLength);
  const step = sourceRate / targetRate;
  const cooperativeYield = new CooperativeYield();

  for (let i = 0; i < outputLength; i += COOPERATIVE_FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(outputLength, i + COOPERATIVE_FRAME_BATCH);

    for (let index = i; index < batchEnd; index += 1) {
      const sourcePosition = index * step;
      const sourceIndex = Math.floor(sourcePosition);
      const fraction = sourcePosition - sourceIndex;
      const a = samples[sourceIndex] ?? 0;
      const b = samples[Math.min(sourceIndex + 1, samples.length - 1)] ?? 0;
      output[index] = a + (b - a) * fraction;
    }

    await cooperativeYield.maybeYield();
  }

  return output;
}

/** Stretches or compresses audio to mimic combined playbackRate + detune. */
export function resampleByPlaybackRate(
  samples: Float32Array,
  rate: number,
): Float32Array {
  const clampedRate = Math.max(0.5, Math.min(2, rate));

  if (Math.abs(clampedRate - 1) < 0.001) {
    return samples.slice();
  }

  const outputLength = Math.max(1, Math.floor(samples.length / clampedRate));
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i += 1) {
    const sourcePosition = i * clampedRate;
    const index = Math.floor(sourcePosition);
    const fraction = sourcePosition - index;
    const a = samples[index] ?? 0;
    const b = samples[Math.min(index + 1, samples.length - 1)] ?? 0;
    output[i] = a + (b - a) * fraction;
  }

  return output;
}

export async function resampleByPlaybackRateAsync(
  samples: Float32Array,
  rate: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  const clampedRate = Math.max(0.5, Math.min(2, rate));

  if (Math.abs(clampedRate - 1) < 0.001) {
    return samples.slice();
  }

  const outputLength = Math.max(1, Math.floor(samples.length / clampedRate));
  const output = new Float32Array(outputLength);
  const cooperativeYield = new CooperativeYield();

  for (let i = 0; i < outputLength; i += COOPERATIVE_FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(outputLength, i + COOPERATIVE_FRAME_BATCH);

    for (let index = i; index < batchEnd; index += 1) {
      const sourcePosition = index * clampedRate;
      const sourceIndex = Math.floor(sourcePosition);
      const fraction = sourcePosition - sourceIndex;
      const a = samples[sourceIndex] ?? 0;
      const b = samples[Math.min(sourceIndex + 1, samples.length - 1)] ?? 0;
      output[index] = a + (b - a) * fraction;
    }

    await cooperativeYield.maybeYield();
  }

  return output;
}
