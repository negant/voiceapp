import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { getAudioDurationSec } from '@/services/audio/getAudioDuration';
import {
  copyToImportsDir,
  toFileUri,
} from '@/services/audio/audioStorage';
import type { SelectedAudioFile } from '@/types/voiceStudio';
import {
  getAudioExtension,
  isSupportedAudioExtension,
  isWithinMaxUploadSize,
} from '@/utils/audioFile';
import { logger } from '@/utils/logger';

export type PickAudioFileOptions = {
  supportedFormats: readonly string[];
  maxSizeMb: number;
};

export type PickAudioFileFailureReason =
  | 'cancelled'
  | 'unsupported_format'
  | 'file_too_large'
  | 'copy_failed'
  | 'picker_unavailable'
  | 'stat_failed'
  | 'no_file_picked';

export type PickAudioFileResult =
  | { ok: true; file: SelectedAudioFile }
  | {
      ok: false;
      reason: PickAudioFileFailureReason;
      detail?: string;
    };

const LOG_SCOPE = 'AudioImport';
const PICKER_PRESENTATION_DELAY_MS = 160;

function waitForPickerPresentationSlot(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, PICKER_PRESENTATION_DELAY_MS);
  });
}

async function importPickedFileToStorage(
  sourceUri: string,
  fileName: string,
): Promise<string> {
  try {
    const destPath = await copyToImportsDir(sourceUri, fileName);
    logger.debug(LOG_SCOPE, 'copied picked file to imports dir', {
      sourceUri,
      destPath,
    });
    return destPath;
  } catch (directCopyError) {
    logger.warn(LOG_SCOPE, 'direct copy failed, trying keepLocalCopy', {
      sourceUri,
      error: directCopyError,
    });
  }

  const [copyResult] = await keepLocalCopy({
    files: [{ uri: sourceUri, fileName }],
    destination: 'documentDirectory',
  });

  logger.debug(LOG_SCOPE, 'keepLocalCopy result', copyResult);

  if (copyResult.status !== 'success') {
    throw new Error(copyResult.copyError);
  }

  const destPath = await copyToImportsDir(copyResult.localUri, fileName);
  logger.debug(LOG_SCOPE, 'copied keepLocalCopy file to imports dir', {
    localUri: copyResult.localUri,
    destPath,
  });
  return destPath;
}

export async function pickAudioFile(
  options: PickAudioFileOptions,
): Promise<PickAudioFileResult> {
  logger.debug(LOG_SCOPE, 'pickAudioFile start', {
    supportedFormats: options.supportedFormats,
    maxSizeMb: options.maxSizeMb,
  });

  try {
    // Android can report a null Activity when native UI is presented while
    // another modal is still settling after a tap/cancel transition.
    await waitForPickerPresentationSlot();

    const pickedFiles = await pick({
      type: [types.audio],
      mode: 'import',
    });

    logger.debug(LOG_SCOPE, 'pick() resolved', {
      count: pickedFiles.length,
      files: pickedFiles.map(file => ({
        name: file.name,
        uri: file.uri,
        size: file.size,
        type: file.type,
      })),
    });

    const picked = pickedFiles[0];
    if (!picked) {
      logger.warn(LOG_SCOPE, 'pick() returned no files');
      return { ok: false, reason: 'no_file_picked' };
    }

    const fileName = picked.name ?? 'audio';
    const extension = getAudioExtension(fileName);

    logger.debug(LOG_SCOPE, 'validating picked file', { fileName, extension });

    if (!isSupportedAudioExtension(extension, options.supportedFormats)) {
      logger.warn(LOG_SCOPE, 'unsupported format', {
        extension,
        supportedFormats: options.supportedFormats,
      });
      return {
        ok: false,
        reason: 'unsupported_format',
        detail: `extension=${extension || '(none)'}`,
      };
    }

    const pickedSize = picked.size ?? 0;
    if (pickedSize > 0 && !isWithinMaxUploadSize(pickedSize, options.maxSizeMb)) {
      logger.warn(LOG_SCOPE, 'file too large (picker metadata)', {
        pickedSize,
        maxSizeMb: options.maxSizeMb,
      });
      return { ok: false, reason: 'file_too_large' };
    }

    let destPath: string;
    try {
      destPath = await importPickedFileToStorage(picked.uri, fileName);
    } catch (error) {
      logger.error(LOG_SCOPE, 'import copy failed', error);
      return {
        ok: false,
        reason: 'copy_failed',
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    const uri = toFileUri(destPath);
    logger.debug(LOG_SCOPE, 'imported file path', { uri, destPath });

    let sizeBytes = pickedSize;
    try {
      const stat = await ReactNativeBlobUtil.fs.stat(destPath);
      sizeBytes = Number(stat.size);
      logger.debug(LOG_SCOPE, 'stat ok', { sizeBytes, stat });
    } catch (error) {
      logger.error(LOG_SCOPE, 'stat failed', { uri, destPath, error });
      return {
        ok: false,
        reason: 'stat_failed',
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    if (!isWithinMaxUploadSize(sizeBytes, options.maxSizeMb)) {
      logger.warn(LOG_SCOPE, 'file too large (after copy)', {
        sizeBytes,
        maxSizeMb: options.maxSizeMb,
      });
      await ReactNativeBlobUtil.fs.unlink(destPath).catch(() => undefined);
      return { ok: false, reason: 'file_too_large' };
    }

    let durationSec: number | null = null;
    try {
      durationSec = await getAudioDurationSec(destPath, extension);
      logger.debug(LOG_SCOPE, 'duration parsed', { durationSec, extension });
    } catch (error) {
      logger.warn(LOG_SCOPE, 'duration metadata read failed (continuing)', {
        destPath,
        extension,
        error,
      });
    }

    const file: SelectedAudioFile = {
      uri,
      name: fileName,
      sizeBytes,
      durationSec,
      extension,
    };

    logger.debug(LOG_SCOPE, 'pickAudioFile success', file);
    return { ok: true, file };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      logger.debug(LOG_SCOPE, 'pick cancelled by user');
      return { ok: false, reason: 'cancelled' };
    }

    logger.error(LOG_SCOPE, 'pickAudioFile failed', error);
    return {
      ok: false,
      reason: 'picker_unavailable',
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export function validatePickedFile(
  file: Pick<SelectedAudioFile, 'name' | 'extension'>,
  supportedFormats: readonly string[],
): boolean {
  const extension = file.extension || getAudioExtension(file.name);
  return isSupportedAudioExtension(extension, supportedFormats);
}
