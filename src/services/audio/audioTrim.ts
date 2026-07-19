import ReactNativeBlobUtil from 'react-native-blob-util';

import { decodeAudioFile, type RenderableAudioBuffer } from '@/services/audio/audioDecode';
import { getAudioDurationSec } from '@/services/audio/getAudioDuration';
import {
  AUDIO_IMPORTS_DIR,
  deleteStoredAudioFile,
  ensureAudioDirs,
  sanitizeImportFileName,
  toFileUri,
} from '@/services/audio/audioStorage';
import type { SelectedAudioFile } from '@/types/voiceStudio';
import { mixDownToMonoAsync } from '@/utils/audioBufferMix';
import { isWithinDemoDuration } from '@/utils/audioDuration';
import { writeBinaryFile } from '@/utils/binaryFile';
import { logger } from '@/utils/logger';
import { encodeAudioBufferToWavBytesAsync, wavBytesToBase64 } from '@/utils/wavEncoder';

const LOG_SCOPE = 'AudioTrim';
const STS_CACHE_DIR_NAME = 'voice-app-sts';

export type PreparedAiSourceResult =
  | { ok: true; mode: 'file'; sourceUri: string; trimmed: false }
  | {
      ok: true;
      mode: 'base64';
      audioBase64: string;
      extension: string;
      mime: string;
      trimmed: true;
      durationSec: number;
      cachePath?: string;
    }
  | { ok: false; reason: string; detail?: string };

/**
 * Prepares AI (STS) input — trims in memory when needed so the user's import file
 * stays untouched and WaveSpeed receives a reliable base64 payload.
 */
export async function prepareAiSourceForSts(
  file: SelectedAudioFile,
  maxDurationSec: number,
  options?: { signal?: AbortSignal },
): Promise<PreparedAiSourceResult> {
  if (
    file.durationSec !== null &&
    isWithinDemoDuration(file.durationSec, maxDurationSec)
  ) {
    return { ok: true, mode: 'file', sourceUri: file.uri, trimmed: false };
  }

  try {
    const decoded = await decodeAudioFile(file.uri);
    const { buffer, trimmed } = sliceRenderableAudioBuffer(
      decoded,
      maxDurationSec,
    );

    if (!trimmed && isWithinDemoDuration(decoded.duration, maxDurationSec)) {
      return { ok: true, mode: 'file', sourceUri: file.uri, trimmed: false };
    }

    const mono =
      buffer.numberOfChannels === 1
        ? buffer.getChannelData(0)
        : await mixDownToMonoAsync(buffer, options?.signal);

    const wavBytes = await encodeAudioBufferToWavBytesAsync(
      {
        numberOfChannels: 1,
        length: mono.length,
        sampleRate: buffer.sampleRate,
        getChannelData: () => mono,
      },
      { signal: options?.signal },
    );

    const audioBase64 = wavBytesToBase64(wavBytes);
    let cachePath: string | undefined;

    try {
      const cacheDir = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${STS_CACHE_DIR_NAME}`;
      await ReactNativeBlobUtil.fs.mkdir(cacheDir).catch(() => undefined);
      cachePath = `${cacheDir}/sts-source-${Date.now()}.wav`;
      await writeBinaryFile(cachePath, wavBytes);
    } catch (error) {
      logger.warn(LOG_SCOPE, 'sts cache write failed (using in-memory base64)', error);
    }

    logger.debug(LOG_SCOPE, 'prepareAiSourceForSts base64', {
      originalDurationSec: decoded.duration,
      trimmedDurationSec: buffer.duration,
      maxDurationSec,
      base64Chars: audioBase64.length,
    });

    return {
      ok: true,
      mode: 'base64',
      audioBase64,
      extension: 'wav',
      mime: 'audio/wav',
      trimmed: true,
      durationSec: buffer.duration,
      cachePath,
    };
  } catch (error) {
    logger.warn(LOG_SCOPE, 'prepareAiSourceForSts failed', error);
    return {
      ok: false,
      reason: 'prepare_failed',
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export type TrimAudioFileResult =
  | {
      ok: true;
      file: SelectedAudioFile;
      trimmed: boolean;
      originalDurationSec?: number;
    }
  | {
      ok: false;
      reason: 'decode_failed' | 'encode_failed' | 'write_failed';
      detail?: string;
    };

export function sliceRenderableAudioBuffer(
  buffer: RenderableAudioBuffer,
  maxDurationSec: number,
): { buffer: RenderableAudioBuffer; trimmed: boolean } {
  const maxSamples = Math.min(
    buffer.length,
    Math.max(1, Math.floor(maxDurationSec * buffer.sampleRate)),
  );

  if (maxSamples >= buffer.length) {
    return { buffer, trimmed: false };
  }

  const channelSlices: Float32Array[] = [];
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    channelSlices.push(buffer.getChannelData(channel).slice(0, maxSamples));
  }

  const duration = maxSamples / buffer.sampleRate;
  const sliced: RenderableAudioBuffer = {
    numberOfChannels: buffer.numberOfChannels,
    length: maxSamples,
    sampleRate: buffer.sampleRate,
    duration,
    getChannelData: channel => channelSlices[channel],
    copyToChannel: (source, channelNumber, startInChannel = 0) => {
      channelSlices[channelNumber].set(source, startInChannel);
    },
  };

  return { buffer: sliced, trimmed: true };
}

function buildTrimmedOutputPath(sourceName: string, suffix: string): string {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'audio';
  return `${AUDIO_IMPORTS_DIR}/${Date.now()}-${suffix}-${sanitizeImportFileName(`${base}.wav`)}`;
}

function buildTrimmedFileName(sourceName: string, suffix: string): string {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'audio';
  return `${sanitizeImportFileName(base)}-${suffix}.wav`;
}

export async function trimAudioFileIfNeeded(
  file: SelectedAudioFile,
  maxDurationSec: number | undefined,
  options?: {
    signal?: AbortSignal;
    outputSuffix?: string;
    /** When false, keep the source file (e.g. ephemeral trim before processing). Default: true. */
    replaceSource?: boolean;
  },
): Promise<TrimAudioFileResult> {
  if (!maxDurationSec || maxDurationSec <= 0) {
    return { ok: true, file, trimmed: false };
  }

  if (isWithinDemoDuration(file.durationSec, maxDurationSec)) {
    return { ok: true, file, trimmed: false };
  }

  const outputSuffix = options?.outputSuffix ?? 'trim';
  const replaceSource = options?.replaceSource ?? true;

  try {
    const decoded = await decodeAudioFile(file.uri);
    const { buffer, trimmed } = sliceRenderableAudioBuffer(
      decoded,
      maxDurationSec,
    );

    if (!trimmed) {
      return { ok: true, file, trimmed: false };
    }

    const mono =
      buffer.numberOfChannels === 1
        ? buffer.getChannelData(0)
        : await mixDownToMonoAsync(buffer, options?.signal);

    const wavBytes = await encodeAudioBufferToWavBytesAsync(
      {
        numberOfChannels: 1,
        length: mono.length,
        sampleRate: buffer.sampleRate,
        getChannelData: () => mono,
      },
      { signal: options?.signal },
    );

    await ensureAudioDirs();
    const outputPath = buildTrimmedOutputPath(file.name, outputSuffix);

    try {
      await writeBinaryFile(outputPath, wavBytes);
    } catch (error) {
      logger.error(LOG_SCOPE, 'write trimmed wav failed', error);
      return {
        ok: false,
        reason: 'write_failed',
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    const uri = toFileUri(outputPath);
    let sizeBytes = wavBytes.byteLength;
    try {
      const stat = await ReactNativeBlobUtil.fs.stat(outputPath);
      sizeBytes = Number(stat.size);
    } catch {
      // Fall back to encoded byte length.
    }

    let durationSec: number | null = buffer.duration;
    try {
      durationSec = await getAudioDurationSec(outputPath, 'wav');
    } catch {
      logger.warn(LOG_SCOPE, 'duration metadata read failed (using slice duration)');
    }

    const trimmedFile: SelectedAudioFile = {
      uri,
      name: buildTrimmedFileName(file.name, outputSuffix),
      sizeBytes,
      durationSec,
      extension: 'wav',
    };

    if (replaceSource && file.uri !== uri) {
      await deleteStoredAudioFile(file.uri).catch(() => undefined);
    }

    logger.debug(LOG_SCOPE, 'trimAudioFileIfNeeded success', {
      originalDurationSec: decoded.duration,
      maxDurationSec,
      trimmedFile,
    });

    return {
      ok: true,
      file: trimmedFile,
      trimmed: true,
      originalDurationSec: decoded.duration,
    };
  } catch (error) {
    logger.warn(LOG_SCOPE, 'trimAudioFileIfNeeded failed', error);
    return {
      ok: false,
      reason: 'decode_failed',
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
