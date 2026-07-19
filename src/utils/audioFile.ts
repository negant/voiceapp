export function getAudioExtension(fileName: string): string {
  const match = fileName.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

export function isSupportedAudioExtension(
  extension: string,
  supportedFormats: readonly string[],
): boolean {
  return supportedFormats.includes(extension.toLowerCase());
}

/** Human-readable list for UI hints, e.g. "MP3, WAV, M4A, AAC". */
export function formatSupportedFormatsList(
  supportedFormats: readonly string[],
): string {
  return supportedFormats.map(format => format.toUpperCase()).join(', ');
}

export function isWithinMaxUploadSize(sizeBytes: number, maxMb: number): boolean {
  if (sizeBytes < 0 || maxMb <= 0) {
    return false;
  }
  return sizeBytes <= maxMb * 1024 * 1024;
}
