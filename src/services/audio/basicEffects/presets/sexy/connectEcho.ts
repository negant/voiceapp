import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

export function connectSexyVoiceEcho(
  offlineCtx: OfflineAudioContext,
  source: AudioNode,
  destination: AudioNode,
  echoMix: number,
): void {
  const hauntedDelay = offlineCtx.createDelay(0.35);
  hauntedDelay.delayTime.value = 0.078;

  const feedback = offlineCtx.createGain();
  feedback.gain.value = 0.52;

  const hauntedWet = offlineCtx.createGain();
  hauntedWet.gain.value = Math.min(1.05, echoMix * 2.1);

  source.connect(hauntedDelay);
  hauntedDelay.connect(feedback);
  feedback.connect(hauntedDelay);
  hauntedDelay.connect(hauntedWet);
  hauntedWet.connect(destination);

  const shriekSlap = offlineCtx.createDelay(0.28);
  shriekSlap.delayTime.value = 0.142;
  const shriekWet = offlineCtx.createGain();
  shriekWet.gain.value = Math.min(0.88, echoMix * 1.65);
  source.connect(shriekSlap);
  shriekSlap.connect(shriekWet);
  shriekWet.connect(destination);

  const flutterDelay = offlineCtx.createDelay(0.14);
  flutterDelay.delayTime.value = 0.036;
  const flutterWet = offlineCtx.createGain();
  flutterWet.gain.value = Math.min(0.55, echoMix * 1.1);
  source.connect(flutterDelay);
  flutterDelay.connect(flutterWet);
  flutterWet.connect(destination);
}
