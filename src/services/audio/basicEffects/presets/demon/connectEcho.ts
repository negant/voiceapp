import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

export function connectDemonEcho(
  offlineCtx: OfflineAudioContext,
  source: AudioNode,
  destination: AudioNode,
  echoMix: number,
): void {
  const abyssDelay = offlineCtx.createDelay(0.82);
  abyssDelay.delayTime.value = 0.248;

  const feedback = offlineCtx.createGain();
  feedback.gain.value = 0.62;

  const abyssWet = offlineCtx.createGain();
  abyssWet.gain.value = Math.min(1.12, echoMix * 2.45);

  source.connect(abyssDelay);
  abyssDelay.connect(feedback);
  feedback.connect(abyssDelay);
  abyssDelay.connect(abyssWet);
  abyssWet.connect(destination);

  const deepSlap = offlineCtx.createDelay(0.58);
  deepSlap.delayTime.value = 0.372;
  const deepWet = offlineCtx.createGain();
  deepWet.gain.value = Math.min(0.96, echoMix * 1.78);
  source.connect(deepSlap);
  deepSlap.connect(deepWet);
  deepWet.connect(destination);
}
