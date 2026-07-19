import { OfflineAudioContext } from 'react-native-audio-api';

import type { RenderableAudioBuffer } from '@/services/audio/audioDecode';

const MONO_CHANNELS = 1;

export function copyMonoToContext(
  offlineCtx: OfflineAudioContext,
  monoSamples: Float32Array,
  sampleRate: number,
): RenderableAudioBuffer {
  const copied = offlineCtx.createBuffer(
    MONO_CHANNELS,
    monoSamples.length,
    sampleRate,
  ) as RenderableAudioBuffer;

  copied.copyToChannel(monoSamples, 0);
  return copied;
}
