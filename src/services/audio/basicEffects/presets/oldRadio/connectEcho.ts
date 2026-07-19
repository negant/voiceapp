import { OfflineAudioContext, type AudioNode } from 'react-native-audio-api';

export function connectOldRadioEcho(
  offlineCtx: OfflineAudioContext,
  source: AudioNode,
  destination: AudioNode,
  echoMix: number,
): void {
  const cabinetDelay = offlineCtx.createDelay(0.28);
  cabinetDelay.delayTime.value = 0.042;

  const feedback = offlineCtx.createGain();
  feedback.gain.value = 0.48;

  const cabinetWet = offlineCtx.createGain();
  cabinetWet.gain.value = Math.min(0.9, echoMix * 1.7);

  source.connect(cabinetDelay);
  cabinetDelay.connect(feedback);
  feedback.connect(cabinetDelay);
  cabinetDelay.connect(cabinetWet);
  cabinetWet.connect(destination);

  const slapDelay = offlineCtx.createDelay(0.22);
  slapDelay.delayTime.value = 0.118;
  const slapWet = offlineCtx.createGain();
  slapWet.gain.value = Math.min(0.68, echoMix * 1.28);
  source.connect(slapDelay);
  slapDelay.connect(slapWet);
  slapWet.connect(destination);

  const roomSlap = offlineCtx.createDelay(0.2);
  roomSlap.delayTime.value = 0.086;
  const roomWet = offlineCtx.createGain();
  roomWet.gain.value = Math.min(0.58, echoMix * 1.08);
  source.connect(roomSlap);
  roomSlap.connect(roomWet);
  roomWet.connect(destination);

  const flutterDelay = offlineCtx.createDelay(0.08);
  flutterDelay.delayTime.value = 0.019;
  const flutterWet = offlineCtx.createGain();
  flutterWet.gain.value = Math.min(0.38, echoMix * 0.75);
  source.connect(flutterDelay);
  flutterDelay.connect(flutterWet);
  flutterWet.connect(destination);
}
