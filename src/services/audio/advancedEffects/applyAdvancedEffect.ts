import { decodeAudioFile } from '@/services/audio/audioDecode';
import { throwIfAborted } from '@/services/audio/processingErrors';
import { denoiseMonoIfEnabled } from '@/services/audio/sourceDenoise';
import type { ProcessingProgress } from '@/services/audio/basicEffects/types';
import { ADVANCED_EFFECT_DEFINITIONS } from '@/services/audio/advancedEffects/registry';
import { applyPitchOverrideToFilters } from '@/services/audio/advancedEffects/shared/applyPitchOverride';
import {
  applyHighPassAsync,
  applyFormantShiftAsync,
  applyGainAsync,
  applyLowPassAsync,
  applyLowShelfAsync,
  applyPeakingEqualizerAsync,
  applySoftClipAsync,
  applyWaveshaperAsync,
  applyNoiseReduceAsync,
  applyResonantEchoAsync,
  pitchShiftPreserveDurationAsync,
  tempoShiftAsync,
} from '@/services/audio/advancedEffects/shared/filters';
import type { FfmpegFilterStep } from '@/services/audio/advancedEffects/types';
import type { AdvancedEffectId } from '@/types/voiceStudio';
import { mixDownToMonoAsync } from '@/utils/audioBufferMix';
import {
  resampleMonoAsync,
  VOICE_PROCESSING_SAMPLE_RATE,
} from '@/utils/audioResample';
import { encodeAudioBufferToWavBytesAsync } from '@/utils/wavEncoder';
import { logger } from '@/utils/logger';

const LOG_SCOPE = 'AdvancedEffects';

export type ApplyAdvancedEffectOptions = {
  onProgress?: (progress: ProcessingProgress) => void;
  signal?: AbortSignal;
  /** Pitch storage 0–100 (50 = neutral) layered on advanced pitch_shift steps. */
  pitchStorage?: number;
};

function reportProgress(
  options: ApplyAdvancedEffectOptions | undefined,
  stage: ProcessingProgress['stage'],
  progress: number,
): void {
  options?.onProgress?.({ stage, progress });
  logger.debug(LOG_SCOPE, stage, { progress, tier: 'advanced' });
}

async function prepareMonoSamples(
  uri: string,
  signal?: AbortSignal,
): Promise<{ samples: Float32Array; sampleRate: number }> {
  const decoded = await decodeAudioFile(uri);
  throwIfAborted(signal);

  const mono = await mixDownToMonoAsync(decoded, signal);
  const sourceRate = decoded.sampleRate;
  const cleaned = await denoiseMonoIfEnabled(mono, sourceRate, signal, uri);

  if (sourceRate === VOICE_PROCESSING_SAMPLE_RATE) {
    return { samples: cleaned, sampleRate: sourceRate };
  }

  return {
    samples: await resampleMonoAsync(
      cleaned,
      sourceRate,
      VOICE_PROCESSING_SAMPLE_RATE,
      signal,
    ),
    sampleRate: VOICE_PROCESSING_SAMPLE_RATE,
  };
}

async function runFilterStep(
  samples: Float32Array,
  sampleRate: number,
  step: FfmpegFilterStep,
  signal?: AbortSignal,
): Promise<Float32Array> {
  switch (step.type) {
    case 'highpass':
      return applyHighPassAsync(samples, sampleRate, step.frequencyHz, signal);
    case 'lowpass':
      return applyLowPassAsync(samples, sampleRate, step.frequencyHz, signal);
    case 'pitch_shift':
      return pitchShiftPreserveDurationAsync(
        samples,
        step.factor,
        signal,
        sampleRate,
      );
    case 'formant_shift':
      return applyFormantShiftAsync(
        samples,
        sampleRate,
        step.factor,
        signal,
      );
    case 'tempo_shift':
      return tempoShiftAsync(samples, sampleRate, step.factor, signal);
    case 'noise_reduce':
      return applyNoiseReduceAsync(
        samples,
        sampleRate,
        step.strength,
        signal,
      );
    case 'equalizer':
      return applyPeakingEqualizerAsync(
        samples,
        sampleRate,
        step.frequencyHz,
        step.gainDb,
        step.q,
        signal,
      );
    case 'lowshelf':
      return applyLowShelfAsync(
        samples,
        sampleRate,
        step.frequencyHz,
        step.gainDb,
        signal,
      );
    case 'soft_clip':
      return applySoftClipAsync(samples, step.amount, signal);
    case 'waveshaper':
      return applyWaveshaperAsync(
        samples,
        step.amount,
        step.inputGain ?? 1,
        signal,
      );
    case 'gain':
      return applyGainAsync(samples, step.linear, signal);
    case 'resonant_echo':
      return applyResonantEchoAsync(
        samples,
        sampleRate,
        { mix: step.mix, grit: step.grit, taps: step.taps },
        signal,
      );
    default:
      return samples;
  }
}

async function runFilterChain(
  samples: Float32Array,
  sampleRate: number,
  filters: FfmpegFilterStep[],
  signal?: AbortSignal,
): Promise<Float32Array> {
  let current = samples;

  for (const step of filters) {
    throwIfAborted(signal);
    current = await runFilterStep(current, sampleRate, step, signal);
  }

  return current;
}

export async function applyAdvancedEffect(
  uri: string,
  effectId: AdvancedEffectId,
  options?: ApplyAdvancedEffectOptions,
): Promise<Uint8Array> {
  const definition = ADVANCED_EFFECT_DEFINITIONS[effectId];

  reportProgress(options, 'preparing', 0);
  throwIfAborted(options?.signal);

  reportProgress(options, 'decoding', 0.1);
  const { samples, sampleRate } = await prepareMonoSamples(uri, options?.signal);

  reportProgress(options, 'rendering', 0.35);
  logger.debug(LOG_SCOPE, 'filter_chain', {
    effectId,
    ffmpegReference: definition.ffmpegReference,
  });

  const processed = await runFilterChain(
    samples,
    sampleRate,
    applyPitchOverrideToFilters(definition.filters, options?.pitchStorage),
    options?.signal,
  );

  reportProgress(options, 'encoding', 0.85);
  return encodeAudioBufferToWavBytesAsync(
    {
      numberOfChannels: 1,
      length: processed.length,
      sampleRate,
      getChannelData: () => processed,
    },
    { signal: options?.signal },
  );
}
