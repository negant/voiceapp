import { OfflineAudioContext, type AudioNode, type BiquadFilterNode } from 'react-native-audio-api';

export function connectSubmarineVoiceChain(offlineCtx: OfflineAudioContext, bassFilter: BiquadFilterNode): AudioNode {
  const rumbleCut = offlineCtx.createBiquadFilter(); rumbleCut.type = 'highpass'; rumbleCut.frequency.value = 120; rumbleCut.Q.value = 0.65;
  const hull = offlineCtx.createBiquadFilter(); hull.type = 'peaking'; hull.frequency.value = 380; hull.Q.value = 0.9; hull.gain.value = 3.5;
  const muffled = offlineCtx.createBiquadFilter(); muffled.type = 'peaking'; muffled.frequency.value = 920; muffled.Q.value = 1.1; muffled.gain.value = 2;
  const metalHull = offlineCtx.createBiquadFilter(); metalHull.type = 'peaking'; metalHull.frequency.value = 1_680; metalHull.Q.value = 2.3; metalHull.gain.value = 5;
  const underwater = offlineCtx.createBiquadFilter(); underwater.type = 'lowpass'; underwater.frequency.value = 2_300; underwater.Q.value = 0.75;
  bassFilter.connect(rumbleCut); rumbleCut.connect(hull); hull.connect(muffled); muffled.connect(metalHull); metalHull.connect(underwater);
  return underwater;
}
