import { OfflineAudioContext } from 'react-native-audio-api';

import {
  decodeAudioFile,
  type RenderableAudioBuffer,
} from '@/services/audio/audioDecode';
import { connectWetChain } from '@/services/audio/basicEffects/shared/connectWetChain';
import {
  isWetPresetVoice,
  resolveWetPresetVoice,
} from '@/services/audio/basicEffects/shared/resolveWetPreset';
import { WET_PRESET_REGISTRY } from '@/services/audio/basicEffects/wetRegistry';
import type {
  ApplyAudioEffectsOptions,
  ProcessingStage,
} from '@/services/audio/basicEffects/types';
import { throwIfAborted } from '@/services/audio/processingErrors';
import { denoiseMonoIfEnabled } from '@/services/audio/sourceDenoise';
import type { AudioEffects } from '@/types/voiceStudio';
import { mixDownToMonoAsync, snapshotChannelData } from '@/utils/audioBufferMix';
import { CooperativeYield } from '@/utils/asyncYield';
import { applyDryVoiceEffectsAsync } from '@/utils/audioDspFastPath';
import {
  type AudioEffectDspParams,
  hasAudibleEffects,
  mapEffectsToDspParams,
  needsWetProcessing,
} from '@/utils/audioEffectParams';
import {
  resampleMonoAsync,
  VOICE_PROCESSING_SAMPLE_RATE,
} from '@/utils/audioResample';
import { writeBinaryFile } from '@/utils/binaryFile';
import { logger } from '@/utils/logger';
import { encodeAudioBufferToWavBytesAsync } from '@/utils/wavEncoder';

import { calculateWetRenderDurationSec } from './shared/connectWetChain';

const LOG_SCOPE = 'AudioDsp';
const MONO_CHANNELS = 1;

class ProcessingTimer {
  private readonly startedAt = Date.now();
  private lastMark = this.startedAt;

  mark(label: string): void {
    const now = Date.now();
    logger.debug(LOG_SCOPE, `timing:${label}`, {
      stageMs: now - this.lastMark,
      totalMs: now - this.startedAt,
    });
    this.lastMark = now;
  }
}

function reportProgress(
  options: ApplyAudioEffectsOptions | undefined,
  stage: ProcessingStage,
  progress: number,
): void {
  options?.onProgress?.({ stage, progress });
  logger.debug(LOG_SCOPE, stage, { progress });
}

function encodeMonoPcmToWav(
  samples: Float32Array,
  sampleRate: number,
  options?: ApplyAudioEffectsOptions,
): Promise<Uint8Array> {
  return encodeAudioBufferToWavBytesAsync(
    {
      numberOfChannels: MONO_CHANNELS,
      length: samples.length,
      sampleRate,
      getChannelData: () => samples,
    },
    { signal: options?.signal },
  );
}

function snapshotNativeMonoBuffer(buffer: RenderableAudioBuffer): Float32Array {
  return snapshotChannelData(buffer)[0] ?? new Float32Array(buffer.length);
}

async function prepareMonoAtProcessingRate(
  decodedBuffer: RenderableAudioBuffer,
  sourceUri: string,
  signal?: AbortSignal,
): Promise<{ samples: Float32Array; sampleRate: number }> {
  const mono = await mixDownToMonoAsync(decodedBuffer, signal);
  const sampleRate = decodedBuffer.sampleRate;
  const cleaned = await denoiseMonoIfEnabled(mono, sampleRate, signal, sourceUri);

  if (sampleRate === VOICE_PROCESSING_SAMPLE_RATE) {
    return { samples: cleaned, sampleRate };
  }

  return {
    samples: await resampleMonoAsync(
      cleaned,
      sampleRate,
      VOICE_PROCESSING_SAMPLE_RATE,
      signal,
    ),
    sampleRate: VOICE_PROCESSING_SAMPLE_RATE,
  };
}

async function renderWithOfflineContext(
  monoSamples: Float32Array,
  sampleRate: number,
  sourceDurationSec: number,
  params: AudioEffectDspParams,
  options?: ApplyAudioEffectsOptions,
): Promise<Float32Array> {
  const presetVoice = resolveWetPresetVoice(options?.voicePresetId);
  const renderDurationSec = calculateWetRenderDurationSec(
    sourceDurationSec,
    params,
    presetVoice,
  );
  const renderLength = Math.ceil(renderDurationSec * sampleRate);

  reportProgress(options, 'rendering', 0.55);
  throwIfAborted(options?.signal);

  const offlineCtx = new OfflineAudioContext({
    numberOfChannels: MONO_CHANNELS,
    length: renderLength,
    sampleRate,
  });

  connectWetChain(
    offlineCtx,
    monoSamples,
    sampleRate,
    sourceDurationSec,
    params,
    presetVoice,
  );
  throwIfAborted(options?.signal);

  const renderedBuffer = (await offlineCtx.startRendering()) as RenderableAudioBuffer;
  return snapshotNativeMonoBuffer(renderedBuffer);
}

export async function applyAudioEffects(
  sourceUri: string,
  effects: AudioEffects,
  options?: ApplyAudioEffectsOptions,
): Promise<Uint8Array> {
  const timer = new ProcessingTimer();
  const cooperativeYield = new CooperativeYield();

  reportProgress(options, 'preparing', 0.05);
  throwIfAborted(options?.signal);
  await cooperativeYield.maybeYield(true);
  timer.mark('preparing');

  reportProgress(options, 'decoding', 0.25);
  const decodedBuffer = await decodeAudioFile(sourceUri);
  throwIfAborted(options?.signal);
  timer.mark('decoding');

  const prepareStartedAt = Date.now();
  const { samples: monoSamples, sampleRate: processingRate } =
    await prepareMonoAtProcessingRate(decodedBuffer, sourceUri, options?.signal);
  logger.info(LOG_SCOPE, 'prepare_mono_complete', {
    durationSec: monoSamples.length / processingRate,
    sampleCount: monoSamples.length,
    sampleRate: processingRate,
    prepareMs: Date.now() - prepareStartedAt,
  });
  timer.mark('prepare_mono');

  const params = mapEffectsToDspParams(effects, {
    voicePresetId: options?.voicePresetId,
  });
  const sourceDurationSec = monoSamples.length / processingRate;
  const processingPath = !hasAudibleEffects(params)
    ? 'passthrough'
    : needsWetProcessing(params)
      ? 'wet_offline'
      : 'dry_dsp';

  logger.info(LOG_SCOPE, 'processing_path', {
    path: processingPath,
    echoMix: params.echoMix,
    reverbMix: params.reverbMix,
    sampleRate: processingRate,
  });

  let processedSamples = monoSamples;

  if (!hasAudibleEffects(params)) {
    logger.debug(LOG_SCOPE, 'passthrough', {
      durationSec: sourceDurationSec,
      channels: MONO_CHANNELS,
      sampleRate: processingRate,
    });
    timer.mark('dry_dsp_skipped');
  } else if (!needsWetProcessing(params)) {
    reportProgress(options, 'rendering', 0.55);
    throwIfAborted(options?.signal);
    processedSamples = await applyDryVoiceEffectsAsync(
      monoSamples,
      processingRate,
      params,
      options?.signal,
    );
    logger.info(LOG_SCOPE, 'dry_dsp_complete', {
      durationSec: processedSamples.length / processingRate,
      sampleRate: processingRate,
    });
    timer.mark('dry_dsp');
  } else {
    logger.info(LOG_SCOPE, 'wet_offline_render_start', {
      durationSec: sourceDurationSec,
      sampleRate: processingRate,
      voicePresetId: options?.voicePresetId,
    });
    const presetVoice = resolveWetPresetVoice(options?.voicePresetId);
    const renderInput =
      isWetPresetVoice(presetVoice) &&
      WET_PRESET_REGISTRY[presetVoice].preProcessSamples
        ? WET_PRESET_REGISTRY[presetVoice].preProcessSamples!(monoSamples)
        : monoSamples;
    processedSamples = await renderWithOfflineContext(
      renderInput,
      processingRate,
      sourceDurationSec,
      params,
      options,
    );
    timer.mark('rendering');
  }

  reportProgress(options, 'encoding', 0.8);
  throwIfAborted(options?.signal);
  const wavBytes = await encodeMonoPcmToWav(
    processedSamples,
    processingRate,
    options,
  );
  timer.mark('encoding');

  reportProgress(options, 'saving', 0.95);
  return wavBytes;
}

export async function writeProcessedWav(
  wavBytes: Uint8Array,
  outputPath: string,
): Promise<void> {
  await writeBinaryFile(outputPath, wavBytes);
}
