import { Platform, Share } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import {
  normalizePathForBlobUtil,
  sanitizeExportFileName,
  toFileUri,
} from '@/services/audio/audioStorage';
import { logger } from '@/utils/logger';

import type { ExportAudioInput } from './audioProcessing';

const LOG_SCOPE = 'AudioExport';
const EXPORT_FOLDER = 'VoiceApp';

export type ExportAudioResult =
  | { ok: true }
  | { ok: false; reason: 'download_failed' | 'missing_file' };

export type ShareAudioResult =
  | { ok: true }
  | { ok: false; reason: 'share_failed' | 'missing_file' | 'cancelled' };

function resolveMimeType(fileName: string): string {
  return fileName.toLowerCase().endsWith('.wav') ? 'audio/wav' : 'audio/*';
}

async function ensureDirectory(path: string): Promise<void> {
  const exists = await ReactNativeBlobUtil.fs.exists(path);
  if (!exists) {
    await ReactNativeBlobUtil.fs.mkdir(path);
  }
}

async function saveToDownloadsAndroid(
  sourcePath: string,
  fileName: string,
  mimeType: string,
): Promise<void> {
  await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
    {
      name: fileName,
      parentFolder: EXPORT_FOLDER,
      mimeType,
    },
    'Download',
    sourcePath,
  );
}

async function saveToDocumentsIos(
  sourcePath: string,
  fileName: string,
): Promise<string> {
  const exportDir = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${EXPORT_FOLDER}`;
  await ensureDirectory(exportDir);

  const destPath = `${exportDir}/${fileName}`;
  await ReactNativeBlobUtil.fs.cp(sourcePath, destPath);
  return destPath;
}

export async function exportProcessedAudio(
  input: ExportAudioInput,
): Promise<ExportAudioResult> {
  const path = normalizePathForBlobUtil(input.sourceUri);
  const safeFileName = sanitizeExportFileName(input.fileName);
  const mimeType = resolveMimeType(input.fileName);

  if (!path.startsWith('content://')) {
    const exists = await ReactNativeBlobUtil.fs.exists(path);
    if (!exists) {
      logger.error(LOG_SCOPE, 'processed file missing before download', {
        path,
      });
      return { ok: false, reason: 'missing_file' };
    }
  }

  try {
    if (Platform.OS === 'android') {
      await saveToDownloadsAndroid(path, safeFileName, mimeType);
    } else {
      await saveToDocumentsIos(path, safeFileName);
    }

    return { ok: true };
  } catch (error) {
    logger.error(LOG_SCOPE, 'download failed', { error, path, mimeType });
    return { ok: false, reason: 'download_failed' };
  }
}

export async function shareProcessedAudio(
  input: ExportAudioInput,
): Promise<ShareAudioResult> {
  const path = normalizePathForBlobUtil(input.sourceUri);
  const safeFileName = sanitizeExportFileName(input.fileName);

  if (!path.startsWith('content://')) {
    const exists = await ReactNativeBlobUtil.fs.exists(path);
    if (!exists) {
      logger.error(LOG_SCOPE, 'processed file missing before share', { path });
      return { ok: false, reason: 'missing_file' };
    }
  }

  try {
    const shareUrl = toFileUri(path);
    const result = await Share.share(
      Platform.OS === 'ios'
        ? { url: shareUrl, title: safeFileName }
        : { message: safeFileName, url: shareUrl, title: safeFileName },
    );

    if (result.action === Share.dismissedAction) {
      return { ok: false, reason: 'cancelled' };
    }

    return { ok: true };
  } catch (error) {
    logger.error(LOG_SCOPE, 'share failed', { error, path });
    return { ok: false, reason: 'share_failed' };
  }
}
