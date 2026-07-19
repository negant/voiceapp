import {
  OfflineAudioContext,
  type AudioNode,
  type BiquadFilterNode,
} from 'react-native-audio-api';
import { createTapeSaturationCurve } from '@/services/audio/basicEffects/shared/tapeSaturation';

export function connectKratosVoiceChain(
  offlineCtx: OfflineAudioContext,
  bassFilter: BiquadFilterNode,
): AudioNode {
  const chestCut = offlineCtx.createBiquadFilter();
  chestCut.type = 'highpass';
  chestCut.frequency.value = 260;
  chestCut.Q.value = 0.9;

  const warShout = offlineCtx.createBiquadFilter();
  warShout.type = 'peaking';
  warShout.frequency.value = 1_480;
  warShout.Q.value = 1.8;
  warShout.gain.value = 9.5;

  const gravel = offlineCtx.createBiquadFilter();
  gravel.type = 'peaking';
  gravel.frequency.value = 2_650;
  gravel.Q.value = 2.4;
  gravel.gain.value = 6.5;

  const darken = offlineCtx.createBiquadFilter();
  darken.type = 'lowpass';
  darken.frequency.value = 4_800;
  darken.Q.value = 0.65;

  const rage = offlineCtx.createWaveShaper();
  rage.curve = createTapeSaturationCurve(0.36);
  rage.oversample = '2x';

  bassFilter.connect(chestCut);
  chestCut.connect(warShout);
  warShout.connect(gravel);
  gravel.connect(darken);
  darken.connect(rage);

  return rage;
}
