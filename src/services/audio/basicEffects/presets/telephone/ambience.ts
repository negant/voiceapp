import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

import type { RenderableAudioBuffer } from '@/services/audio/audioDecode';

const MONO_CHANNELS = 1;

function createPhoneLineNoiseBuffer(
  offlineCtx: OfflineAudioContext,
  sampleRate: number,
  durationSec: number,
): RenderableAudioBuffer {
  const length = Math.ceil(sampleRate * durationSec);
  const noiseBuffer = offlineCtx.createBuffer(
    MONO_CHANNELS,
    length,
    sampleRate,
  ) as RenderableAudioBuffer;
  const channel = noiseBuffer.getChannelData(0);

  let smoothed = 0;
  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    smoothed = smoothed * 0.992 + white * 0.008;
    channel[index] = smoothed * 0.18 + white * 0.04;
  }

  return noiseBuffer;
}

export function connectTelephoneLineNoise(
  offlineCtx: OfflineAudioContext,
  destination: AudioNode,
  sampleRate: number,
  renderDurationSec: number,
): void {
  const patternSec = Math.min(renderDurationSec, 30);
  const noiseBuffer = createPhoneLineNoiseBuffer(
    offlineCtx,
    sampleRate,
    patternSec,
  );
  const noiseSource = offlineCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer as never;
  noiseSource.loop = renderDurationSec > patternSec;

  const bandpass = offlineCtx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 1_850;
  bandpass.Q.value = 0.55;

  const noiseGain = offlineCtx.createGain();
  noiseGain.gain.value = 0.028;

  noiseSource.connect(bandpass);
  bandpass.connect(noiseGain);
  noiseGain.connect(destination);

  noiseSource.start(0);
  noiseSource.stop(renderDurationSec);
}
