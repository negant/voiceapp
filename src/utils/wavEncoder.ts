import { CooperativeYield } from '@/utils/asyncYield';

type EncodableAudioBuffer = {
  numberOfChannels: number;
  length: number;
  sampleRate: number;
  getChannelData: (channel: number) => Float32Array;
};

export type EncodeWavOptions = {
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
};

const FRAME_BATCH_SIZE = 32_768;

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
}

function floatSampleToInt16(sample: number): number {
  const clamped = Math.max(-1, Math.min(1, sample));
  return clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
}

export function encodeAudioBufferToWavBytes(
  buffer: EncodableAudioBuffer,
): Uint8Array {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bitsPerSample = 16;
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  writePcmFrames(view, buffer, 44);
  return new Uint8Array(wavBuffer);
}

/** @deprecated Prefer encodeAudioBufferToWavBytes — base64 adds avoidable CPU cost on device. */
export function encodeAudioBufferToWavBase64(
  buffer: EncodableAudioBuffer,
): string {
  return bytesToBase64(encodeAudioBufferToWavBytes(buffer));
}

export async function encodeAudioBufferToWavBytesAsync(
  buffer: EncodableAudioBuffer,
  options?: EncodeWavOptions,
): Promise<Uint8Array> {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bitsPerSample = 16;
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const cooperativeYield = new CooperativeYield();
  let offset = 44;

  for (let frame = 0; frame < length; frame += FRAME_BATCH_SIZE) {
    throwIfAborted(options?.signal);
    const frameEnd = Math.min(length, frame + FRAME_BATCH_SIZE);

    for (let currentFrame = frame; currentFrame < frameEnd; currentFrame += 1) {
      for (let channel = 0; channel < numChannels; channel += 1) {
        const sample = buffer.getChannelData(channel)[currentFrame];
        view.setInt16(offset, floatSampleToInt16(sample), true);
        offset += 2;
      }
    }

    options?.onProgress?.(frameEnd / length);
    await cooperativeYield.maybeYield();
  }

  return new Uint8Array(wavBuffer);
}

function writePcmFrames(
  view: DataView,
  buffer: EncodableAudioBuffer,
  startOffset: number,
): void {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;
  let offset = startOffset;

  for (let frame = 0; frame < length; frame += 1) {
    for (let channel = 0; channel < numChannels; channel += 1) {
      const sample = buffer.getChannelData(channel)[frame];
      view.setInt16(offset, floatSampleToInt16(sample), true);
      offset += 2;
    }
  }
}

export function wavBytesToBase64(bytes: Uint8Array): string {
  return bytesToBase64(bytes);
}

function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = '';
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, Math.min(index + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return globalThis.btoa(binary);
}
