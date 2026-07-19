import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

import type { RenderableAudioBuffer } from '@/services/audio/audioDecode';
import { radioBurstEnvelope } from '@/services/audio/basicEffects/shared/radioBurstEnvelope';

const MONO_CHANNELS = 1;

function createSubmarineAmbienceBuffer(
  offlineCtx: OfflineAudioContext,
  sampleRate: number,
  durationSec: number,
): RenderableAudioBuffer {
  const between = (min: number, max: number) => min + Math.random() * (max - min);
  const length = Math.ceil(sampleRate * durationSec);
  const ambienceBuffer = offlineCtx.createBuffer(
    MONO_CHANNELS,
    length,
    sampleRate,
  ) as RenderableAudioBuffer;
  const channel = ambienceBuffer.getChannelData(0);

  let cursor = Math.floor(sampleRate * between(0.02, 0.12));
  let smoothed = 0;
  let hullPhase = 0;

  while (cursor < length) {
    const segmentDurationSec = between(0.45, 1.35);
    const segmentSamples = Math.min(
      Math.floor(sampleRate * segmentDurationSec),
      length - cursor,
    );
    const attackSamples = Math.max(
      10,
      Math.floor(sampleRate * between(0.008, 0.024)),
    );
    const releaseSamples = Math.max(
      14,
      Math.floor(sampleRate * between(0.03, 0.08)),
    );
    const flutterRate = between(11, 24);

    for (let index = 0; index < segmentSamples; index += 1) {
      const envelope = radioBurstEnvelope(
        index,
        segmentSamples,
        attackSamples,
        releaseSamples,
      );
      const time = index / sampleRate;
      const white = Math.random() * 2 - 1;
      smoothed = smoothed * 0.986 + white * 0.014;
      hullPhase += (Math.PI * 2 * 68) / sampleRate;
      const metallic = Math.random() < 0.24 ? Math.sign(white) : white * 0.55;
      const ring = Math.sin(time * Math.PI * 2 * flutterRate) * 0.11;
      const hullHum = Math.sin(hullPhase) * 0.05;
      const hiss = smoothed * 0.3 + white * 0.09 + metallic * 0.16 + ring + hullHum;
      channel[cursor + index] = hiss * envelope;
    }

    cursor += segmentSamples;
    if (cursor >= length) {
      break;
    }

    const gapSamples = Math.min(
      Math.floor(sampleRate * between(0.03, 0.09)),
      length - cursor,
    );
    cursor += gapSamples;
  }

  return ambienceBuffer;
}

export function connectSubmarineAmbience(
  offlineCtx: OfflineAudioContext,
  destination: AudioNode,
  sampleRate: number,
  renderDurationSec: number,
): void {
  const patternSec = Math.min(renderDurationSec, 30);
  const ambienceBuffer = createSubmarineAmbienceBuffer(
    offlineCtx,
    sampleRate,
    patternSec,
  );
  const ambienceSource = offlineCtx.createBufferSource();
  ambienceSource.buffer = ambienceBuffer as never;
  ambienceSource.loop = renderDurationSec > patternSec;

  const pressureBand = offlineCtx.createBiquadFilter();
  pressureBand.type = 'bandpass';
  pressureBand.frequency.value = 880;
  pressureBand.Q.value = 0.68;

  const metalRing = offlineCtx.createBiquadFilter();
  metalRing.type = 'peaking';
  metalRing.frequency.value = 1_620;
  metalRing.Q.value = 2.1;
  metalRing.gain.value = 5.5;

  const depthCut = offlineCtx.createBiquadFilter();
  depthCut.type = 'lowpass';
  depthCut.frequency.value = 2_100;
  depthCut.Q.value = 0.62;

  const ambienceGain = offlineCtx.createGain();
  ambienceGain.gain.value = 0.056;

  ambienceSource.connect(pressureBand);
  pressureBand.connect(metalRing);
  metalRing.connect(depthCut);
  depthCut.connect(ambienceGain);
  ambienceGain.connect(destination);

  ambienceSource.start(0);
  ambienceSource.stop(renderDurationSec);
}
