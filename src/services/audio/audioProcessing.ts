import ReactNativeBlobUtil from 'react-native-blob-util';

import { slugifyPresetName } from '@/utils/presetAppearance';
import { logger } from '@/utils/logger';
import { writeBinaryFile } from '@/utils/binaryFile';

import {
  applyAudioEffects,
  writeProcessedWav,
  type ProcessingProgress,
} from './audioDsp';
import { applyAdvancedEffect } from './advancedEffects';
import { applyAiEffect } from './aiEffects';
import { discardAiTempFile } from './aiEffects/waveSpeed/applyWaveSpeedAiEffect';
import { exportProcessedAudio } from './audioExport';
import { playAudioFile } from './audioPlayback';
import { ProcessingAbortedError } from './processingErrors';
import {
  buildProcessedOutputPath,
  deleteStoredAudioFile,
  ensureAudioDirs,
  normalizePathForBlobUtil,
  toFileUri,
} from './audioStorage';
import { trimAudioFileIfNeeded, prepareAiSourceForSts } from './audioTrim';

import type {
  AdvancedEffectId,
  AiEffectId,
  AudioEffects,
  AudioProcessingResult,
  EffectTier,
  SavedVoicePresetSource,
  SelectedAudioFile,
  VoicePresetId,
} from '@/types/voiceStudio';
import { processEffectChain } from './processEffectChain';

const LOG_SCOPE = 'AudioProcessing';

export type ProcessAudioInput = {
  file: SelectedAudioFile;
  effectTier: EffectTier;
  presetId?: VoicePresetId;
  advancedEffectId?: AdvancedEffectId;
  aiEffectId?: AiEffectId;
  presetLabel?: string;
  effects?: AudioEffects;
  /** Pitch storage 0–100 for advanced tier pitch tweak (50 = neutral). */
  pitchStorage?: number;
  /** When set, runs two built-in effects sequentially (step 2 on step 1 output). */
  effectChain?: [SavedVoicePresetSource, SavedVoicePresetSource];
  maxDurationSec: number;
};

export type ProcessAudioOptions = {
  onProgress?: (progress: ProcessingProgress) => void;
  signal?: AbortSignal;
};

export type ProcessAudioResult =
  | { ok: true; result: AudioProcessingResult }
  | {
      ok: false;
      reason:
        | 'duration_exceeded'
        | 'missing_file'
        | 'processing_failed'
        | 'cancelled';
    };

async function moveProcessedFile(
  sourcePath: string,
  outputPath: string,
): Promise<void> {
  try {
    await ReactNativeBlobUtil.fs.mv(sourcePath, outputPath);
  } catch {
    await ReactNativeBlobUtil.fs.cp(sourcePath, outputPath);
    await discardAiTempFile(sourcePath);
  }
}

async function resolveProcessingFile(
  file: SelectedAudioFile,
  maxDurationSec: number,
  options?: ProcessAudioOptions,
): Promise<
  | { ok: true; file: SelectedAudioFile; tempUri?: string }
  | { ok: false; reason: 'processing_failed' }
> {
  const trimResult = await trimAudioFileIfNeeded(file, maxDurationSec, {
    signal: options?.signal,
    outputSuffix: 'process-trim',
    replaceSource: false,
  });

  if (!trimResult.ok) {
    return { ok: false, reason: 'processing_failed' };
  }

  const tempUri =
    trimResult.trimmed && trimResult.file.uri !== file.uri
      ? trimResult.file.uri
      : undefined;

  return { ok: true, file: trimResult.file, tempUri };
}

async function discardStsCacheFile(path: string | undefined): Promise<void> {
  if (!path) {
    return;
  }

  const normalized = normalizePathForBlobUtil(path);
  const exists = await ReactNativeBlobUtil.fs.exists(normalized);
  if (exists) {
    await ReactNativeBlobUtil.fs.unlink(normalized).catch(() => undefined);
  }
}

async function processAiTierAudio(
  input: ProcessAudioInput,
  options: ProcessAudioOptions | undefined,
  startedAt: number,
): Promise<ProcessAudioResult> {
  if (!input.aiEffectId) {
    return { ok: false, reason: 'processing_failed' };
  }

  let stsCachePath: string | undefined;

  try {
    options?.onProgress?.({ stage: 'preparing', progress: 0.1 });

    const prepared = await prepareAiSourceForSts(
      input.file,
      input.maxDurationSec,
      { signal: options?.signal },
    );

    if (!prepared.ok) {
      logger.error(LOG_SCOPE, 'ai source prepare failed', prepared);
      return { ok: false, reason: 'processing_failed' };
    }

    if (prepared.mode === 'base64') {
      stsCachePath = prepared.cachePath;
    }

    const rawBaseName = input.file.name.replace(/\.[^.]+$/, '');
    const baseName = slugifyPresetName(rawBaseName) || 'audio';
    const presetSlug = slugifyPresetName(input.presetLabel ?? input.aiEffectId);
    const fileName = `${baseName}-${presetSlug}-processed.mp3`;

    await ensureAudioDirs();
    const outputPath = buildProcessedOutputPath(fileName);
    if (await ReactNativeBlobUtil.fs.exists(outputPath)) {
      await ReactNativeBlobUtil.fs.unlink(outputPath);
    }

    const aiResult = await applyAiEffect(
      prepared.mode === 'file' ? prepared.sourceUri : input.file.uri,
      input.aiEffectId,
      {
        ...options,
        audioBase64:
          prepared.mode === 'base64' ? prepared.audioBase64 : undefined,
        sourceExtension:
          prepared.mode === 'base64' ? prepared.extension : undefined,
        sourceMime: prepared.mode === 'base64' ? prepared.mime : undefined,
      },
    );

    try {
      await moveProcessedFile(
        normalizePathForBlobUtil(aiResult.path),
        outputPath,
      );
    } catch (error) {
      await discardAiTempFile(aiResult.path);
      throw error;
    }

    options?.onProgress?.({ stage: 'saving', progress: 1 });
    logger.debug(LOG_SCOPE, 'completed', {
      fileName,
      totalMs: Date.now() - startedAt,
      format: 'mp3',
      aiTrimmed: prepared.mode === 'base64',
    });

    return {
      ok: true,
      result: {
        outputUri: toFileUri(outputPath),
        fileName,
      },
    };
  } catch (error) {
    if (
      error instanceof ProcessingAbortedError ||
      (error instanceof DOMException && error.name === 'AbortError')
    ) {
      logger.debug(LOG_SCOPE, 'cancelled', {
        totalMs: Date.now() - startedAt,
      });
      return { ok: false, reason: 'cancelled' };
    }

    logger.error(LOG_SCOPE, 'failed', {
      error,
      message: error instanceof Error ? error.message : String(error),
      totalMs: Date.now() - startedAt,
      tier: 'ai',
    });
    return { ok: false, reason: 'processing_failed' };
  } finally {
    await discardStsCacheFile(stsCachePath);
  }
}

export async function processAudio(
  input: ProcessAudioInput,
  options?: ProcessAudioOptions,
): Promise<ProcessAudioResult> {
  const startedAt = Date.now();

  if (!input.file.uri) {
    return { ok: false, reason: 'missing_file' };
  }

  if (
    !input.effectChain &&
    input.effectTier === 'ai' &&
    input.aiEffectId
  ) {
    return processAiTierAudio(input, options, startedAt);
  }

  let tempTrimUri: string | undefined;

  const resolved = await resolveProcessingFile(
    input.file,
    input.maxDurationSec,
    options,
  );

  if (!resolved.ok) {
    return { ok: false, reason: 'processing_failed' };
  }

  tempTrimUri = resolved.tempUri;
  const processingFile = resolved.file;

  const rawBaseName = processingFile.name.replace(/\.[^.]+$/, '');
  const baseName = slugifyPresetName(rawBaseName) || 'audio';
  const presetSlug = slugifyPresetName(
    input.presetLabel ??
      (input.effectTier === 'ai'
        ? input.aiEffectId
        : input.effectTier === 'advanced'
          ? input.advancedEffectId
          : input.presetId),
  );

  try {
    await ensureAudioDirs();
    const sourcePath = normalizePathForBlobUtil(processingFile.uri);
    const sourceExists = await ReactNativeBlobUtil.fs.exists(sourcePath);
    if (!sourceExists) {
      logger.error(LOG_SCOPE, 'processing source missing on disk', {
        sourcePath,
        fileName: processingFile.name,
      });
      return { ok: false, reason: 'missing_file' };
    }

    const processed = input.effectChain
      ? await processEffectChain(processingFile.uri, input.effectChain, {
          ...options,
          pitchStorage: input.pitchStorage,
        })
      : input.effectTier === 'advanced' && input.advancedEffectId
        ? {
            bytes: await applyAdvancedEffect(
              processingFile.uri,
              input.advancedEffectId,
              {
                ...options,
                pitchStorage: input.pitchStorage,
              },
            ),
            extension: 'wav' as const,
          }
        : {
            bytes: await applyAudioEffects(processingFile.uri, input.effects!, {
              ...options,
              voicePresetId: input.presetId,
            }),
            extension: 'wav' as const,
          };

    const fileName = `${baseName}-${presetSlug}-processed.${processed.extension}`;
    const outputPath = buildProcessedOutputPath(fileName);

    if (await ReactNativeBlobUtil.fs.exists(outputPath)) {
      await ReactNativeBlobUtil.fs.unlink(outputPath);
    }

    if (processed.extension === 'wav') {
      await writeProcessedWav(processed.bytes, outputPath);
    } else {
      await writeBinaryFile(outputPath, processed.bytes);
    }

    options?.onProgress?.({ stage: 'saving', progress: 1 });
    logger.debug(LOG_SCOPE, 'completed', {
      fileName,
      totalMs: Date.now() - startedAt,
      format: processed.extension,
    });

    return {
      ok: true,
      result: {
        outputUri: toFileUri(outputPath),
        fileName,
      },
    };
  } catch (error) {
    if (
      error instanceof ProcessingAbortedError ||
      (error instanceof DOMException && error.name === 'AbortError')
    ) {
      logger.debug(LOG_SCOPE, 'cancelled', {
        totalMs: Date.now() - startedAt,
      });
      return { ok: false, reason: 'cancelled' };
    }

    logger.error(LOG_SCOPE, 'failed', {
      error,
      message: error instanceof Error ? error.message : String(error),
      totalMs: Date.now() - startedAt,
    });
    return { ok: false, reason: 'processing_failed' };
  } finally {
    if (tempTrimUri) {
      await deleteStoredAudioFile(tempTrimUri).catch(() => undefined);
    }
  }
}

export type ExportAudioInput = {
  sourceUri: string;
  fileName: string;
};

export { exportProcessedAudio };

export async function previewProcessedAudio(
  input: ProcessAudioInput,
): Promise<AudioProcessingResult | null> {
  const processed = await processAudio(input);
  if (!processed.ok) {
    return null;
  }

  try {
    await playAudioFile(processed.result.outputUri);
    return processed.result;
  } catch {
    return null;
  }
}
