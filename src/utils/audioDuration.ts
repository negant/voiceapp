import { LOCAL_MAX_AUDIO_DURATION_SEC } from '@/constants/audioLimits';

export function formatAudioDuration(durationSec: number): string {
  const safeDuration = Math.max(0, Math.floor(durationSec));
  const minutes = Math.floor(safeDuration / 60);
  const seconds = safeDuration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function isWithinDemoDuration(
  durationSec: number | null | undefined,
  maxSec: number = LOCAL_MAX_AUDIO_DURATION_SEC,
): boolean {
  if (durationSec === null || durationSec === undefined) {
    // Duration is validated once native metadata is available.
    return true;
  }

  return durationSec > 0 && durationSec <= maxSec;
}

export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
