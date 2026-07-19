import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

export function connectRobotEcho(
  offlineCtx: OfflineAudioContext,
  source: AudioNode,
  destination: AudioNode,
  echoMix: number,
): void {
  const primaryDelay = offlineCtx.createDelay(0.4);
  primaryDelay.delayTime.value = 0.056;

  const feedback = offlineCtx.createGain();
  feedback.gain.value = 0.68;

  const primaryWet = offlineCtx.createGain();
  primaryWet.gain.value = Math.min(1.1, echoMix * 2.2);

  source.connect(primaryDelay);
  primaryDelay.connect(feedback);
  feedback.connect(primaryDelay);
  primaryDelay.connect(primaryWet);
  primaryWet.connect(destination);

  const slapDelay = offlineCtx.createDelay(0.3);
  slapDelay.delayTime.value = 0.124;
  const slapWet = offlineCtx.createGain();
  slapWet.gain.value = Math.min(0.92, echoMix * 1.75);
  source.connect(slapDelay);
  slapDelay.connect(slapWet);
  slapWet.connect(destination);

  const combDelay = offlineCtx.createDelay(0.12);
  combDelay.delayTime.value = 0.028;
  const combWet = offlineCtx.createGain();
  combWet.gain.value = Math.min(0.65, echoMix * 1.2);
  source.connect(combDelay);
  combDelay.connect(combWet);
  combWet.connect(destination);
}
