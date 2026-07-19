import ReactNativeBlobUtil from 'react-native-blob-util';
import {
  AudioRecorder,
  FileDirectory,
  FileFormat,
  type FileInfo,
} from 'react-native-audio-api';

import { getAudioDurationSec } from '@/services/audio/getAudioDuration';
import {
  copyToImportsDir,
  deleteStoredAudioFile,
  toFileUri,
} from '@/services/audio/audioStorage';
import type { SelectedAudioFile } from '@/types/voiceStudio';
import { isWithinDemoDuration } from '@/utils/audioDuration';
import {
  isSupportedAudioExtension,
  isWithinMaxUploadSize,
} from '@/utils/audioFile';
import { computeRecordingLevel } from '@/utils/recordingLevel';
import { logger } from '@/utils/logger';

const LOG_SCOPE = 'AudioRecording';
export const RECORDING_EXTENSION = 'm4a';

export type FinalizeRecordingOptions = {
  supportedFormats: readonly string[];
  maxSizeMb: number;
  maxDurationSec: number;
};

export type FinalizeRecordingFailureReason =
  | 'unsupported_format'
  | 'file_too_large'
  | 'duration_exceeded'
  | 'copy_failed'
  | 'stat_failed'
  | 'empty_recording'
  | 'stop_failed';

export type FinalizeRecordingResult =
  | { ok: true; file: SelectedAudioFile }
  | {
      ok: false;
      reason: FinalizeRecordingFailureReason;
      detail?: string;
    };

export function buildRecordingFileName(timestampMs: number = Date.now()): string {
  return `recording-${timestampMs}.${RECORDING_EXTENSION}`;
}

export type RecordingLevelListener = (level: number) => void;

const LEVEL_SMOOTHING = 0.55;

function isSuccessfulFileInfo(
  result: Awaited<ReturnType<AudioRecorder['stop']>>,
): result is { status: 'success' } & FileInfo {
  return result.status === 'success' && Array.isArray(result.paths) && result.paths.length > 0;
}

export async function finalizeRecordedAudio(
  sourcePath: string,
  options: FinalizeRecordingOptions,
): Promise<FinalizeRecordingResult> {
  const extension = RECORDING_EXTENSION;

  if (!isSupportedAudioExtension(extension, options.supportedFormats)) {
    return { ok: false, reason: 'unsupported_format' };
  }

  const fileName = buildRecordingFileName();

  let destPath: string;
  try {
    destPath = await copyToImportsDir(sourcePath, fileName);
  } catch (error) {
    logger.error(LOG_SCOPE, 'copy recorded file failed', error);
    return {
      ok: false,
      reason: 'copy_failed',
      detail: error instanceof Error ? error.message : String(error),
    };
  }

  const uri = toFileUri(destPath);

  let sizeBytes = 0;
  try {
    const stat = await ReactNativeBlobUtil.fs.stat(destPath);
    sizeBytes = Number(stat.size);
  } catch (error) {
    logger.error(LOG_SCOPE, 'stat recorded file failed', { destPath, error });
    await ReactNativeBlobUtil.fs.unlink(destPath).catch(() => undefined);
    return {
      ok: false,
      reason: 'stat_failed',
      detail: error instanceof Error ? error.message : String(error),
    };
  }

  if (sizeBytes <= 0) {
    await ReactNativeBlobUtil.fs.unlink(destPath).catch(() => undefined);
    return { ok: false, reason: 'empty_recording' };
  }

  if (!isWithinMaxUploadSize(sizeBytes, options.maxSizeMb)) {
    await ReactNativeBlobUtil.fs.unlink(destPath).catch(() => undefined);
    return { ok: false, reason: 'file_too_large' };
  }

  let durationSec: number | null = null;
  try {
    durationSec = await getAudioDurationSec(destPath, extension);
  } catch (error) {
    logger.warn(LOG_SCOPE, 'duration metadata read failed (continuing)', {
      destPath,
      error,
    });
  }

  if (!isWithinDemoDuration(durationSec, options.maxDurationSec)) {
    await ReactNativeBlobUtil.fs.unlink(destPath).catch(() => undefined);
    return { ok: false, reason: 'duration_exceeded' };
  }

  const file: SelectedAudioFile = {
    uri,
    name: fileName,
    sizeBytes,
    durationSec,
    extension,
  };

  logger.debug(LOG_SCOPE, 'finalizeRecordedAudio success', file);
  return { ok: true, file };
}

async function deleteTempRecordingPaths(paths: string[]): Promise<void> {
  for (const path of paths) {
    await deleteStoredAudioFile(path).catch(() => undefined);
  }
}

export class AudioRecordingSession {
  private recorder: AudioRecorder | null = null;
  private levelListener: RecordingLevelListener | null = null;
  private smoothedLevel = 0;

  get isActive(): boolean {
    return this.recorder?.isRecording() ?? false;
  }

  getCurrentDurationSec(): number {
    return this.recorder?.getCurrentDuration() ?? 0;
  }

  setLevelListener(listener: RecordingLevelListener | null): void {
    this.levelListener = listener;
    if (!listener) {
      this.smoothedLevel = 0;
    }
  }

  private emitLevel(rawLevel: number): void {
    this.smoothedLevel =
      this.smoothedLevel * LEVEL_SMOOTHING + rawLevel * (1 - LEVEL_SMOOTHING);
    this.levelListener?.(this.smoothedLevel);
  }

  async start(): Promise<{ ok: true } | { ok: false; detail: string }> {
    if (this.recorder?.isRecording()) {
      return { ok: false, detail: 'already_recording' };
    }

    const recorder = new AudioRecorder();
    recorder.enableFileOutput({
      directory: FileDirectory.Cache,
      subDirectory: 'VoiceAppRecordings',
      fileNamePrefix: 'recording',
      channelCount: 1,
      format: FileFormat.M4A,
    });

    recorder.onAudioReady(
      { sampleRate: 44100, bufferLength: 2048, channelCount: 1 },
      event => {
        this.emitLevel(computeRecordingLevel(event.buffer));
      },
    );

    const startResult = await recorder.start({
      fileNameOverride: buildRecordingFileName(),
    });

    if (startResult.status === 'error') {
      recorder.clearOnError();
      recorder.clearOnAudioReady();
      return { ok: false, detail: startResult.message };
    }

    this.recorder = recorder;
    logger.debug(LOG_SCOPE, 'recording started');
    return { ok: true };
  }

  async stopAndFinalize(
    options: FinalizeRecordingOptions,
  ): Promise<FinalizeRecordingResult> {
    const recorder = this.recorder;
    if (!recorder) {
      return { ok: false, reason: 'stop_failed', detail: 'no_active_session' };
    }

    let stopResult: Awaited<ReturnType<AudioRecorder['stop']>>;
    try {
      stopResult = await recorder.stop();
    } catch (error) {
      logger.error(LOG_SCOPE, 'recorder.stop failed', error);
      this.disposeRecorder();
      return {
        ok: false,
        reason: 'stop_failed',
        detail: error instanceof Error ? error.message : String(error),
      };
    } finally {
      this.disposeRecorder();
    }

    if (!isSuccessfulFileInfo(stopResult)) {
      const detail =
        stopResult.status === 'error' ? stopResult.message : 'missing_paths';
      await deleteTempRecordingPaths(
        stopResult.status === 'success' ? stopResult.paths : [],
      );
      return { ok: false, reason: 'stop_failed', detail };
    }

    const sourcePath = stopResult.paths[0];
    const finalizeResult = await finalizeRecordedAudio(sourcePath, options);

    if (!finalizeResult.ok) {
      await deleteTempRecordingPaths(stopResult.paths);
      return finalizeResult;
    }

    const extraPaths = stopResult.paths.slice(1);
    if (extraPaths.length > 0) {
      await deleteTempRecordingPaths(extraPaths);
    }

    return finalizeResult;
  }

  async cancel(): Promise<void> {
    const recorder = this.recorder;
    if (!recorder) {
      return;
    }

    try {
      if (recorder.isRecording()) {
        const stopResult = await recorder.stop();
        if (stopResult.status === 'success') {
          await deleteTempRecordingPaths(stopResult.paths);
        }
      }
    } catch (error) {
      logger.warn(LOG_SCOPE, 'cancel recording failed', error);
    } finally {
      this.disposeRecorder();
    }
  }

  private disposeRecorder(): void {
    if (!this.recorder) {
      return;
    }

    this.recorder.clearOnError();
    this.recorder.clearOnAudioReady();
    this.levelListener = null;
    this.smoothedLevel = 0;
    this.recorder = null;
  }
}
