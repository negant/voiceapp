import ReactNativeBlobUtil from 'react-native-blob-util';
import { AudioContext } from 'react-native-audio-api';

import { decodeBase64Chunk } from '@/services/audio/audioMetadata';
import { normalizePathForBlobUtil } from '@/services/audio/audioStorage';

export type RenderableAudioBuffer = {
  numberOfChannels: number;
  length: number;
  sampleRate: number;
  duration: number;
  getChannelData: (channel: number) => Float32Array;
  copyToChannel: (
    source: Float32Array,
    channelNumber: number,
    startInChannel?: number,
  ) => void;
};

export async function readAudioFileArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const path = normalizePathForBlobUtil(uri);
  const base64 = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
  const bytes = decodeBase64Chunk(base64);
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

export async function decodeAudioFile(uri: string): Promise<RenderableAudioBuffer> {
  const decodeContext = new AudioContext();
  const arrayBuffer = await readAudioFileArrayBuffer(uri);
  return (await decodeContext.decodeAudioData(
    arrayBuffer,
  )) as RenderableAudioBuffer;
}
