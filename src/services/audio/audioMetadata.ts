/* Binary header parsing requires bitwise operators. */
/* eslint-disable no-bitwise */
const METADATA_READ_BYTES = 256 * 1024;

export function decodeBase64Chunk(base64: string): Uint8Array {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function parseWavDuration(bytes: Uint8Array): number | null {
  if (bytes.length < 44) {
    return null;
  }

  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const wave = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff !== 'RIFF' || wave !== 'WAVE') {
    return null;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const byteRate = view.getUint32(28, true);
  if (byteRate === 0) {
    return null;
  }

  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunkId = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3],
    );
    const chunkSize = view.getUint32(offset + 4, true);
    if (chunkId === 'data') {
      return chunkSize / byteRate;
    }
    offset += 8 + chunkSize;
  }

  return null;
}

export function parseMp3Duration(bytes: Uint8Array): number | null {
  let offset = 0;
  let totalFrames = 0;
  const sampleRates = [44100, 48000, 32000];

  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff || (bytes[offset + 1] & 0xe0) !== 0xe0) {
      offset += 1;
      continue;
    }

    const version = (bytes[offset + 1] & 0x18) >> 3;
    const layer = (bytes[offset + 1] & 0x06) >> 1;
    const bitrateIndex = (bytes[offset + 2] & 0xf0) >> 4;
    const sampleRateIndex = (bytes[offset + 2] & 0x0c) >> 2;

    if (layer === 0 || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) {
      offset += 1;
      continue;
    }

    const bitrates = [
      [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
      [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
      [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    ];
    const bitrateKbps = bitrates[Math.max(0, layer - 1)][bitrateIndex];
    const sampleRate = sampleRates[sampleRateIndex] ?? 44100;
    const padding = (bytes[offset + 2] & 0x02) >> 1;
    const frameLength =
      version === 3
        ? Math.floor((144000 * bitrateKbps) / sampleRate) + padding
        : Math.floor((72000 * bitrateKbps) / sampleRate) + padding;

    if (frameLength <= 0) {
      offset += 1;
      continue;
    }

    totalFrames += 1;
    offset += frameLength;
  }

  if (totalFrames === 0) {
    return null;
  }

  // MPEG1 Layer III frames are 1152 samples; good enough for demo duration checks.
  return (totalFrames * 1152) / 44100;
}

export function parseMp4Duration(bytes: Uint8Array): number | null {
  let offset = 0;
  while (offset + 8 <= bytes.length) {
    const size = readUint32(bytes, offset);
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    );

    if (size < 8) {
      break;
    }

    if (type === 'mvhd' && offset + 28 < bytes.length) {
      const version = bytes[offset + 8];
      if (version === 0) {
        const timeScale = readUint32(bytes, offset + 20);
        const duration = readUint32(bytes, offset + 24);
        return timeScale > 0 ? duration / timeScale : null;
      }
      if (version === 1 && offset + 36 < bytes.length) {
        const timeScale = readUint32(bytes, offset + 28);
        const durationHigh = readUint32(bytes, offset + 32);
        const durationLow = readUint32(bytes, offset + 36);
        const duration = durationHigh * 2 ** 32 + durationLow;
        return timeScale > 0 ? duration / timeScale : null;
      }
    }

    offset += size;
  }

  return null;
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

export function parseAudioDurationFromHeader(
  bytes: Uint8Array,
  extension: string,
): number | null {
  const normalized = extension.toLowerCase();
  if (normalized === 'wav') {
    return parseWavDuration(bytes);
  }
  if (normalized === 'mp3') {
    return parseMp3Duration(bytes);
  }
  if (normalized === 'm4a' || normalized === 'aac') {
    return parseMp4Duration(bytes);
  }
  return null;
}

export { METADATA_READ_BYTES };
