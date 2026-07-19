import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

export function connectAlienEcho(
  offlineCtx: OfflineAudioContext,
  source: AudioNode,
  destination: AudioNode,
  echoMix: number,
): void {
  const flangerA = offlineCtx.createDelay(0.04);
  flangerA.delayTime.value = 0.011;
  const flangerAWet = offlineCtx.createGain();
  flangerAWet.gain.value = Math.min(0.52, echoMix * 0.95);
  source.connect(flangerA);
  flangerA.connect(flangerAWet);
  flangerAWet.connect(destination);

  const flangerB = offlineCtx.createDelay(0.05);
  flangerB.delayTime.value = 0.017;
  const flangerBWet = offlineCtx.createGain();
  flangerBWet.gain.value = Math.min(0.48, echoMix * 0.88);
  source.connect(flangerB);
  flangerB.connect(flangerBWet);
  flangerBWet.connect(destination);

  const shimmerDelay = offlineCtx.createDelay(0.42);
  shimmerDelay.delayTime.value = 0.156;
  const shimmerWet = offlineCtx.createGain();
  shimmerWet.gain.value = Math.min(0.82, echoMix * 1.48);
  source.connect(shimmerDelay);
  shimmerDelay.connect(shimmerWet);
  shimmerWet.connect(destination);

  const voidDelay = offlineCtx.createDelay(0.62);
  voidDelay.delayTime.value = 0.284;
  const voidWet = offlineCtx.createGain();
  voidWet.gain.value = Math.min(0.68, echoMix * 1.22);
  source.connect(voidDelay);
  voidDelay.connect(voidWet);
  voidWet.connect(destination);
}
