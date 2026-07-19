import { OfflineAudioContext, type AudioNode, type BiquadFilterNode } from 'react-native-audio-api';
import { createTapeSaturationCurve } from '@/services/audio/basicEffects/shared/tapeSaturation';

export function connectDemonVoiceChain(
  offlineCtx: OfflineAudioContext,
  bassFilter: BiquadFilterNode,
): AudioNode {
  const chest = offlineCtx.createBiquadFilter();
  chest.type = 'peaking';
  chest.frequency.value = 88;
  chest.Q.value = 0.85;
  chest.gain.value = 7.5;

  const growl = offlineCtx.createBiquadFilter();
  growl.type = 'peaking';
  growl.frequency.value = 220;
  growl.Q.value = 2.6;
  growl.gain.value = 12;

  const rasp = offlineCtx.createBiquadFilter();
  rasp.type = 'peaking';
  rasp.frequency.value = 640;
  rasp.Q.value = 3.2;
  rasp.gain.value = 9.5;

  const snarl = offlineCtx.createBiquadFilter();
  snarl.type = 'peaking';
  snarl.frequency.value = 1_280;
  snarl.Q.value = 2.2;
  snarl.gain.value = 6.5;

  const abyss = offlineCtx.createBiquadFilter();
  abyss.type = 'lowpass';
  abyss.frequency.value = 3_200;
  abyss.Q.value = 0.7;

  const inferno = offlineCtx.createWaveShaper();
  inferno.curve = createTapeSaturationCurve(0.42);
  inferno.oversample = '2x';

  bassFilter.connect(chest);
  chest.connect(growl);
  growl.connect(rasp);
  rasp.connect(snarl);
  snarl.connect(abyss);
  abyss.connect(inferno);

  return inferno;
}
