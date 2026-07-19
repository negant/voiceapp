import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

export function connectHeliumEcho(
  offlineCtx: OfflineAudioContext,
  source: AudioNode,
  destination: AudioNode,
  echoMix: number,
): void {
  const nasalSlap = offlineCtx.createDelay(0.16);
  nasalSlap.delayTime.value = 0.048;

  const nasalWet = offlineCtx.createGain();
  nasalWet.gain.value = Math.min(0.55, echoMix * 1.35);

  source.connect(nasalSlap);
  nasalSlap.connect(nasalWet);
  nasalWet.connect(destination);

  const flutterSlap = offlineCtx.createDelay(0.12);
  flutterSlap.delayTime.value = 0.028;
  const flutterWet = offlineCtx.createGain();
  flutterWet.gain.value = Math.min(0.38, echoMix * 0.95);
  source.connect(flutterSlap);
  flutterSlap.connect(flutterWet);
  flutterWet.connect(destination);
}
