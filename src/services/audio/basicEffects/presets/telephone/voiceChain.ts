import { OfflineAudioContext, type AudioNode, type BiquadFilterNode } from 'react-native-audio-api';
import { createTapeSaturationCurve } from '@/services/audio/basicEffects/shared/tapeSaturation';

/** Narrow-band carbon-mic telephone timbre — tighter than Old Radio AM broadcast. */
export function connectTelephoneVoiceChain(
  offlineCtx: OfflineAudioContext,
  bassFilter: BiquadFilterNode,
): AudioNode {
  const rumbleCut = offlineCtx.createBiquadFilter();
  rumbleCut.type = 'highpass';
  rumbleCut.frequency.value = 380;
  rumbleCut.Q.value = 0.85;

  const midPeak = offlineCtx.createBiquadFilter();
  midPeak.type = 'peaking';
  midPeak.frequency.value = 1_050;
  midPeak.Q.value = 1.6;
  midPeak.gain.value = 5.5;

  const tin = offlineCtx.createBiquadFilter();
  tin.type = 'peaking';
  tin.frequency.value = 1_950;
  tin.Q.value = 1.1;
  tin.gain.value = 3;

  const bandwidth = offlineCtx.createBiquadFilter();
  bandwidth.type = 'lowpass';
  bandwidth.frequency.value = 2_350;
  bandwidth.Q.value = 0.7;

  const carbonMic = offlineCtx.createWaveShaper();
  carbonMic.curve = createTapeSaturationCurve(0.22);
  carbonMic.oversample = '2x';

  bassFilter.connect(rumbleCut);
  rumbleCut.connect(midPeak);
  midPeak.connect(tin);
  tin.connect(bandwidth);
  bandwidth.connect(carbonMic);

  return carbonMic;
}
