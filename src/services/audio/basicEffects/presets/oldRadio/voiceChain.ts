import { OfflineAudioContext, type AudioNode, type BiquadFilterNode } from 'react-native-audio-api';
import { createTapeSaturationCurve } from '@/services/audio/basicEffects/shared/tapeSaturation';

export function connectOldRadioVoiceChain(offlineCtx: OfflineAudioContext, bassFilter: BiquadFilterNode): AudioNode {
  const rumbleCut = offlineCtx.createBiquadFilter(); rumbleCut.type = 'highpass'; rumbleCut.frequency.value = 320; rumbleCut.Q.value = 0.7;
  const speakerPeak = offlineCtx.createBiquadFilter(); speakerPeak.type = 'peaking'; speakerPeak.frequency.value = 1_200; speakerPeak.Q.value = 1.4; speakerPeak.gain.value = 4.5;
  const tin = offlineCtx.createBiquadFilter(); tin.type = 'peaking'; tin.frequency.value = 2_200; tin.Q.value = 1.2; tin.gain.value = 2.5;
  const bandwidth = offlineCtx.createBiquadFilter(); bandwidth.type = 'lowpass'; bandwidth.frequency.value = 2_800; bandwidth.Q.value = 0.65;
  const saturator = offlineCtx.createWaveShaper(); saturator.curve = createTapeSaturationCurve(0.3); saturator.oversample = '2x';
  bassFilter.connect(rumbleCut); rumbleCut.connect(speakerPeak); speakerPeak.connect(tin); tin.connect(bandwidth); bandwidth.connect(saturator);
  return saturator;
}
