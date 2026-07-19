import {
  OfflineAudioContext,
  type AudioNode,
  type BiquadFilterNode,
} from 'react-native-audio-api';
import { createTapeSaturationCurve } from '@/services/audio/basicEffects/shared/tapeSaturation';

export function connectAlienVoiceChain(
  offlineCtx: OfflineAudioContext,
  bassFilter: BiquadFilterNode,
): AudioNode {
  const thin = offlineCtx.createBiquadFilter();
  thin.type = 'highpass';
  thin.frequency.value = 420;
  thin.Q.value = 0.95;

  const otherworld = offlineCtx.createBiquadFilter();
  otherworld.type = 'peaking';
  otherworld.frequency.value = 920;
  otherworld.Q.value = 2.6;
  otherworld.gain.value = 7.5;

  const shimmer = offlineCtx.createBiquadFilter();
  shimmer.type = 'peaking';
  shimmer.frequency.value = 2_420;
  shimmer.Q.value = 3.1;
  shimmer.gain.value = 10.5;

  const cosmic = offlineCtx.createBiquadFilter();
  cosmic.type = 'peaking';
  cosmic.frequency.value = 4_200;
  cosmic.Q.value = 2.2;
  cosmic.gain.value = 6;

  const veil = offlineCtx.createBiquadFilter();
  veil.type = 'lowpass';
  veil.frequency.value = 7_200;
  veil.Q.value = 0.6;

  const warp = offlineCtx.createWaveShaper();
  warp.curve = createTapeSaturationCurve(0.18);
  warp.oversample = '2x';

  bassFilter.connect(thin);
  thin.connect(otherworld);
  otherworld.connect(shimmer);
  shimmer.connect(cosmic);
  cosmic.connect(veil);
  veil.connect(warp);

  return warp;
}
