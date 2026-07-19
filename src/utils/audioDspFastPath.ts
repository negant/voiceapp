import {
  combinedPlaybackRate,
  type AudioEffectDspParams,
} from '@/utils/audioEffectParams';
import { throwIfAborted } from '@/services/audio/processingErrors';
import {
  resampleByPlaybackRate,
  resampleByPlaybackRateAsync,
} from '@/utils/audioResample';
import { CooperativeYield, COOPERATIVE_FRAME_BATCH } from '@/utils/asyncYield';

const LOW_SHELF_HZ = 180;

/** One-pole low-pass + gain — approximates lowshelf bass boost without OfflineAudioContext. */
export function applyLowShelfBoost(
  samples: Float32Array,
  sampleRate: number,
  gainDb: number,
): Float32Array {
  if (Math.abs(gainDb) <= 0.2) {
    return samples;
  }

  const output = new Float32Array(samples.length);
  const rc = 1 / (2 * Math.PI * LOW_SHELF_HZ);
  const alpha = 1 / (sampleRate * rc + 1);
  const gain = 10 ** (gainDb / 20) - 1;
  let low = 0;

  for (let i = 0; i < samples.length; i += 1) {
    const sample = samples[i];
    low += alpha * (sample - low);
    output[i] = sample + low * gain;
  }

  return output;
}

export async function applyLowShelfBoostAsync(
  samples: Float32Array,
  sampleRate: number,
  gainDb: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  if (Math.abs(gainDb) <= 0.2) {
    return samples;
  }

  const output = new Float32Array(samples.length);
  const rc = 1 / (2 * Math.PI * LOW_SHELF_HZ);
  const alpha = 1 / (sampleRate * rc + 1);
  const gain = 10 ** (gainDb / 20) - 1;
  let low = 0;
  const cooperativeYield = new CooperativeYield();

  for (let i = 0; i < samples.length; i += COOPERATIVE_FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(samples.length, i + COOPERATIVE_FRAME_BATCH);

    for (let index = i; index < batchEnd; index += 1) {
      const sample = samples[index];
      low += alpha * (sample - low);
      output[index] = sample + low * gain;
    }

    await cooperativeYield.maybeYield();
  }

  return output;
}

export { combinedPlaybackRate };

/** Dry voice effects in plain JS — avoids slow OfflineAudioContext on mobile. */
export function applyDryVoiceEffects(
  samples: Float32Array,
  sampleRate: number,
  params: AudioEffectDspParams,
): Float32Array {
  let output = resampleByPlaybackRate(samples, combinedPlaybackRate(params));
  output = applyLowShelfBoost(output, sampleRate, params.bassGainDb);
  return output;
}

/** Dry voice effects with yields — keeps cancel/timer responsive during conversion. */
export async function applyDryVoiceEffectsAsync(
  samples: Float32Array,
  sampleRate: number,
  params: AudioEffectDspParams,
  signal?: AbortSignal,
): Promise<Float32Array> {
  throwIfAborted(signal);
  let output = await resampleByPlaybackRateAsync(
    samples,
    combinedPlaybackRate(params),
    signal,
  );
  output = await applyLowShelfBoostAsync(
    output,
    sampleRate,
    params.bassGainDb,
    signal,
  );
  return output;
}
