import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

import type { RenderableAudioBuffer } from '@/services/audio/audioDecode';
import { radioBurstEnvelope } from '@/services/audio/basicEffects/shared/radioBurstEnvelope';

const MONO_CHANNELS = 1;

function createRadioNoiseBuffer(
  offlineCtx: OfflineAudioContext,
  sampleRate: number,
  durationSec: number,
): RenderableAudioBuffer {
  const between = (min: number, max: number) => min + Math.random() * (max - min);
  const length = Math.ceil(sampleRate * durationSec);
  const noiseBuffer = offlineCtx.createBuffer(
    MONO_CHANNELS,
    length,
    sampleRate,
  ) as RenderableAudioBuffer;
  const channel = noiseBuffer.getChannelData(0);

  let cursor = Math.floor(sampleRate * between(0.02, 0.12));
  let smoothed = 0;

  while (cursor < length) {
    const segmentDurationSec = between(0.4, 1.25);
    const segmentSamples = Math.min(
      Math.floor(sampleRate * segmentDurationSec),
      length - cursor,
    );
    const attackSamples = Math.max(
      10,
      Math.floor(sampleRate * between(0.008, 0.022)),
    );
    const releaseSamples = Math.max(
      14,
      Math.floor(sampleRate * between(0.03, 0.07)),
    );

    for (let index = 0; index < segmentSamples; index += 1) {
      const envelope = radioBurstEnvelope(
        index,
        segmentSamples,
        attackSamples,
        releaseSamples,
      );
      const white = Math.random() * 2 - 1;
      smoothed = smoothed * 0.988 + white * 0.012;
      const hiss = smoothed * 0.26 + white * 0.07;
      channel[cursor + index] = hiss * envelope;
    }

    cursor += segmentSamples;
    if (cursor >= length) {
      break;
    }

    const gapSamples = Math.min(
      Math.floor(sampleRate * between(0.035, 0.1)),
      length - cursor,
    );
    cursor += gapSamples;
  }

  return noiseBuffer;
}

export function connectOldRadioNoise(
  offlineCtx: OfflineAudioContext,
  destination: AudioNode,
  sampleRate: number,
  renderDurationSec: number,
): void {
  const patternSec = Math.min(renderDurationSec, 30);
  const noiseBuffer = createRadioNoiseBuffer(
    offlineCtx,
    sampleRate,
    patternSec,
  );
  const noiseSource = offlineCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer as never;
  noiseSource.loop = renderDurationSec > patternSec;

  const hissFilter = offlineCtx.createBiquadFilter();
  hissFilter.type = 'bandpass';
  hissFilter.frequency.value = 2_350;
  hissFilter.Q.value = 0.62;

  const crackleFilter = offlineCtx.createBiquadFilter();
  crackleFilter.type = 'highpass';
  crackleFilter.frequency.value = 880;
  crackleFilter.Q.value = 0.55;

  const noiseGain = offlineCtx.createGain();
  noiseGain.gain.value = 0.052;

  noiseSource.connect(hissFilter);
  hissFilter.connect(crackleFilter);
  crackleFilter.connect(noiseGain);
  noiseGain.connect(destination);

  noiseSource.start(0);
  noiseSource.stop(renderDurationSec);
}
