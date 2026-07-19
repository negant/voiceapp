import { OfflineAudioContext, type AudioNode, type BiquadFilterNode } from 'react-native-audio-api';
import { createTapeSaturationCurve } from '@/services/audio/basicEffects/shared/tapeSaturation';

export function connectHeliumVoiceChain(offlineCtx: OfflineAudioContext, bassFilter: BiquadFilterNode): AudioNode {
  const chestCut = offlineCtx.createBiquadFilter(); chestCut.type = 'highpass'; chestCut.frequency.value = 460; chestCut.Q.value = 0.85;
  const throat = offlineCtx.createBiquadFilter(); throat.type = 'peaking'; throat.frequency.value = 1_160; throat.Q.value = 2.4; throat.gain.value = 7.5;
  const nasal = offlineCtx.createBiquadFilter(); nasal.type = 'peaking'; nasal.frequency.value = 2_360; nasal.Q.value = 3.4; nasal.gain.value = 11;
  const bill = offlineCtx.createBiquadFilter(); bill.type = 'peaking'; bill.frequency.value = 3_520; bill.Q.value = 2.2; bill.gain.value = 5.5;
  const rollOff = offlineCtx.createBiquadFilter(); rollOff.type = 'lowpass'; rollOff.frequency.value = 5_200; rollOff.Q.value = 0.7;
  const buzz = offlineCtx.createWaveShaper(); buzz.curve = createTapeSaturationCurve(0.14); buzz.oversample = '2x';
  bassFilter.connect(chestCut); chestCut.connect(throat); throat.connect(nasal); nasal.connect(bill); bill.connect(rollOff); rollOff.connect(buzz);
  return buzz;
}
