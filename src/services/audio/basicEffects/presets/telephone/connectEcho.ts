import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

export function connectTelephoneEcho(
  offlineCtx: OfflineAudioContext,
  source: AudioNode,
  destination: AudioNode,
  echoMix: number,
): void {
  const lineDelay = offlineCtx.createDelay(0.18);
  lineDelay.delayTime.value = 0.028;

  const feedback = offlineCtx.createGain();
  feedback.gain.value = 0.36;

  const lineWet = offlineCtx.createGain();
  lineWet.gain.value = Math.min(0.72, echoMix * 1.35);

  source.connect(lineDelay);
  lineDelay.connect(feedback);
  feedback.connect(lineDelay);
  lineDelay.connect(lineWet);
  lineWet.connect(destination);

  const handsetSlap = offlineCtx.createDelay(0.14);
  handsetSlap.delayTime.value = 0.064;
  const slapWet = offlineCtx.createGain();
  slapWet.gain.value = Math.min(0.48, echoMix * 0.95);
  source.connect(handsetSlap);
  handsetSlap.connect(slapWet);
  slapWet.connect(destination);
}
