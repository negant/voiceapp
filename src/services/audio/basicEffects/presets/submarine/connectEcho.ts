import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

export function connectSubmarineEcho(
  offlineCtx: OfflineAudioContext,
  source: AudioNode,
  destination: AudioNode,
  echoMix: number,
): void {
  const hullDelay = offlineCtx.createDelay(0.55);
  hullDelay.delayTime.value = 0.224;

  const feedback = offlineCtx.createGain();
  feedback.gain.value = 0.4;

  const hullWet = offlineCtx.createGain();
  hullWet.gain.value = Math.min(0.95, echoMix * 1.72);

  source.connect(hullDelay);
  hullDelay.connect(feedback);
  feedback.connect(hullDelay);
  hullDelay.connect(hullWet);
  hullWet.connect(destination);

  const deepSlap = offlineCtx.createDelay(0.62);
  deepSlap.delayTime.value = 0.386;
  const deepWet = offlineCtx.createGain();
  deepWet.gain.value = Math.min(0.72, echoMix * 1.35);
  source.connect(deepSlap);
  deepSlap.connect(deepWet);
  deepWet.connect(destination);

  const bubbleSlap = offlineCtx.createDelay(0.18);
  bubbleSlap.delayTime.value = 0.092;
  const bubbleWet = offlineCtx.createGain();
  bubbleWet.gain.value = Math.min(0.42, echoMix * 0.82);
  source.connect(bubbleSlap);
  bubbleSlap.connect(bubbleWet);
  bubbleWet.connect(destination);
}
