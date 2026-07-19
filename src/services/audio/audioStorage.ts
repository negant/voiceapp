import ReactNativeBlobUtil from 'react-native-blob-util';

export const AUDIO_IMPORTS_DIR = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/audio/imports`;
export const AUDIO_OUTPUT_DIR = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/audio/processed`;

/**
 * Converts a file URI to an absolute filesystem path for react-native-blob-util.
 * Android file URIs may use `file://data/...` (no third slash) — we restore the leading `/`.
 */
export function normalizePathForBlobUtil(uriOrPath: string): string {
  let value = uriOrPath.trim();

  if (value.startsWith('content://') || value.startsWith('assets://')) {
    return value;
  }

  if (value.includes('%')) {
    try {
      value = decodeURIComponent(value);
    } catch {
      // Keep the original string when decoding fails.
    }
  }

  if (value.startsWith('file://')) {
    value = value.replace(/^file:\/\//, '');
    if (value.length > 0 && !value.startsWith('/')) {
      value = `/${value}`;
    }
  }

  return value;
}

export function toFsPath(uri: string): string {
  return normalizePathForBlobUtil(uri);
}

export function toFileUri(path: string): string {
  if (path.startsWith('file://') || path.startsWith('content://')) {
    return path;
  }
  return `file://${path}`;
}

export function sanitizeImportFileName(fileName: string): string {
  const sanitized = fileName
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .trim();
  return sanitized.length > 0 ? sanitized : 'audio.mp3';
}

export function sanitizeExportFileName(fileName: string): string {
  const extensionMatch = fileName.match(/(\.[a-z0-9]+)$/i);
  const extension = extensionMatch?.[1] ?? '.wav';
  const base = fileName.replace(/\.[^.]+$/, '');
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return `${slug || 'audio'}${extension}`;
}

export async function ensureAudioDirs(): Promise<void> {
  for (const dir of [AUDIO_IMPORTS_DIR, AUDIO_OUTPUT_DIR]) {
    const exists = await ReactNativeBlobUtil.fs.exists(dir);
    if (!exists) {
      await ReactNativeBlobUtil.fs.mkdir(dir);
    }
  }
}

export function buildProcessedOutputPath(fileName: string): string {
  return `${AUDIO_OUTPUT_DIR}/${fileName}`;
}

export async function copyToImportsDir(
  sourceUri: string,
  fileName: string,
): Promise<string> {
  await ensureAudioDirs();
  const destPath = `${AUDIO_IMPORTS_DIR}/${Date.now()}-${sanitizeImportFileName(fileName)}`;
  await ReactNativeBlobUtil.fs.cp(sourceUri, destPath);
  return destPath;
}

export async function deleteStoredAudioFile(uri: string): Promise<void> {
  const path = normalizePathForBlobUtil(uri);
  if (path.startsWith('content://')) {
    return;
  }

  const exists = await ReactNativeBlobUtil.fs.exists(path);
  if (exists) {
    await ReactNativeBlobUtil.fs.unlink(path);
  }
}
