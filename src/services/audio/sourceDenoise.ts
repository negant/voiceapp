import { applyNoiseReduceAsync } from '@/services/audio/advancedEffects/shared/noiseReduction';
import { env } from '@/config/env';

export function isSourcePreCleaned(sourceUri: string): boolean {
  return /-clean\.wav(?:\?|$)/i.test(sourceUri) || sourceUri.includes('-clean.');
}

/** Optional denoise for Basic/Advanced tiers at conversion time — skipped for AI. */
export async function denoiseMonoIfEnabled(
  samples: Float32Array,
  sampleRate: number,
  signal?: AbortSignal,
  sourceUri?: string,
): Promise<Float32Array> {
  if (!env.enableSourceDenoise) {
    return samples;
  }

  let strength = env.sourceDenoiseStrength;
  // Legacy imports may still be named *-clean.wav from the old pre-clean step.
  if (sourceUri && isSourcePreCleaned(sourceUri)) {
    strength *= 0.68;
  }

  return applyNoiseReduceAsync(samples, sampleRate, strength, signal, {
    mode: 'processing',
  });
}
