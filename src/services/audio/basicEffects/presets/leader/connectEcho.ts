import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

export function connectKratosEcho(
  offlineCtx: OfflineAudioContext,
  source: AudioNode,
  destination: AudioNode,
  echoMix: number,
): void {
  const warDelay = offlineCtx.createDelay(0.24);
  warDelay.delayTime.value = 0.048;

  const feedback = offlineCtx.createGain();
  feedback.gain.value = 0.52;

  const warWet = offlineCtx.createGain();
  warWet.gain.value = Math.min(1.02, echoMix * 2.05);

  source.connect(warDelay);
  warDelay.connect(feedback);
  feedback.connect(warDelay);
  warDelay.connect(warWet);
  warWet.connect(destination);

  const hallSlap = offlineCtx.createDelay(0.18);
  hallSlap.delayTime.value = 0.092;
  const hallWet = offlineCtx.createGain();
  hallWet.gain.value = Math.min(0.72, echoMix * 1.35);
  source.connect(hallSlap);
  hallSlap.connect(hallWet);
  hallWet.connect(destination);
}
