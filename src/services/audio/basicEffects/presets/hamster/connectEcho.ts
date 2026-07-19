import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

export function connectHamsterEcho(
  offlineCtx: OfflineAudioContext,
  source: AudioNode,
  destination: AudioNode,
  echoMix: number,
): void {
  const bounceDelay = offlineCtx.createDelay(0.22);
  bounceDelay.delayTime.value = 0.062;

  const feedback = offlineCtx.createGain();
  feedback.gain.value = 0.34;

  const bounceWet = offlineCtx.createGain();
  bounceWet.gain.value = Math.min(0.62, echoMix * 1.48);

  source.connect(bounceDelay);
  bounceDelay.connect(feedback);
  feedback.connect(bounceDelay);
  bounceDelay.connect(bounceWet);
  bounceWet.connect(destination);

  const chirpSlap = offlineCtx.createDelay(0.14);
  chirpSlap.delayTime.value = 0.034;
  const chirpWet = offlineCtx.createGain();
  chirpWet.gain.value = Math.min(0.45, echoMix * 1.05);
  source.connect(chirpSlap);
  chirpSlap.connect(chirpWet);
  chirpWet.connect(destination);
}
