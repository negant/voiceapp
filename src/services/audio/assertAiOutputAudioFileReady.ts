import ReactNativeBlobUtil from 'react-native-blob-util';

import { normalizePathForBlobUtil } from '@/services/audio/audioStorage';

/** Minimum bytes for a non-empty WaveSpeed STS MP3 (header + tiny payload). */
export const MIN_AI_OUTPUT_AUDIO_BYTES = 256;

/**
 * Verify a downloaded AI output file exists and is large enough to be usable.
 * WaveSpeed marks tasks `completed` with `outputs[]` — we still check the local file
 * after download/move (see https://wavespeed.ai/docs/get-result).
 */
export async function assertAiOutputAudioFileReady(
  pathOrUri: string,
  minBytes: number = MIN_AI_OUTPUT_AUDIO_BYTES,
): Promise<void> {
  const path = normalizePathForBlobUtil(pathOrUri);
  const exists = await ReactNativeBlobUtil.fs.exists(path);
  if (!exists) {
    throw new Error(`AI output file missing: ${path}`);
  }

  const stat = await ReactNativeBlobUtil.fs.stat(path);
  const size = Number(stat.size);
  if (!Number.isFinite(size) || size < minBytes) {
    throw new Error(
      `AI output file too small (${Number.isFinite(size) ? size : 0} bytes)`,
    );
  }
}
