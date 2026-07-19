import { OfflineAudioContext, type AudioNode, type BiquadFilterNode } from 'react-native-audio-api';

export function connectSexyVoiceChain(offlineCtx: OfflineAudioContext, bassFilter: BiquadFilterNode): AudioNode {
  const thin = offlineCtx.createBiquadFilter();
  thin.type = 'highpass'; thin.frequency.value = 280; thin.Q.value = 0.8;
  const brighten = offlineCtx.createBiquadFilter();
  brighten.type = 'highshelf'; brighten.frequency.value = 2_800; brighten.gain.value = 4;
  const shrill = offlineCtx.createBiquadFilter();
  shrill.type = 'peaking'; shrill.frequency.value = 3_400; shrill.Q.value = 2.8; shrill.gain.value = 9;
  const hiss = offlineCtx.createBiquadFilter();
  hiss.type = 'peaking'; hiss.frequency.value = 5_200; hiss.Q.value = 2; hiss.gain.value = 6;
  bassFilter.connect(thin); thin.connect(brighten); brighten.connect(shrill); shrill.connect(hiss);
  return hiss;
}
