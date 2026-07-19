import { OfflineAudioContext, type AudioNode, type BiquadFilterNode } from 'react-native-audio-api';
import { createTapeSaturationCurve } from '@/services/audio/basicEffects/shared/tapeSaturation';

export function connectHamsterVoiceChain(offlineCtx: OfflineAudioContext, bassFilter: BiquadFilterNode): AudioNode {
  const chestCut = offlineCtx.createBiquadFilter(); chestCut.type = 'highpass'; chestCut.frequency.value = 520; chestCut.Q.value = 0.9;
  const body = offlineCtx.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 1_480; body.Q.value = 1.8; body.gain.value = 4;
  const squeak = offlineCtx.createBiquadFilter(); squeak.type = 'peaking'; squeak.frequency.value = 2_920; squeak.Q.value = 3.6; squeak.gain.value = 12;
  const laugh = offlineCtx.createBiquadFilter(); laugh.type = 'peaking'; laugh.frequency.value = 4_380; laugh.Q.value = 2.4; laugh.gain.value = 7;
  const brighten = offlineCtx.createBiquadFilter(); brighten.type = 'highshelf'; brighten.frequency.value = 3_200; brighten.gain.value = 5;
  const rollOff = offlineCtx.createBiquadFilter(); rollOff.type = 'lowpass'; rollOff.frequency.value = 5_600; rollOff.Q.value = 0.72;
  const squeakShape = offlineCtx.createWaveShaper(); squeakShape.curve = createTapeSaturationCurve(0.18); squeakShape.oversample = '2x';
  bassFilter.connect(chestCut); chestCut.connect(body); body.connect(squeak); squeak.connect(laugh); laugh.connect(brighten); brighten.connect(rollOff); rollOff.connect(squeakShape);
  return squeakShape;
}
