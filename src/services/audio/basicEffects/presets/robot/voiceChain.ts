import {
  OfflineAudioContext,
  type AudioNode,
  type BiquadFilterNode,
} from 'react-native-audio-api';

export function connectRobotVoiceChain(
  offlineCtx: OfflineAudioContext,
  bassFilter: BiquadFilterNode,
): AudioNode {
  const highPass = offlineCtx.createBiquadFilter();
  highPass.type = 'highpass';
  highPass.frequency.value = 520;
  highPass.Q.value = 1.1;

  const resonance = offlineCtx.createBiquadFilter();
  resonance.type = 'peaking';
  resonance.frequency.value = 2_800;
  resonance.Q.value = 3.2;
  resonance.gain.value = 13;

  const metallic = offlineCtx.createBiquadFilter();
  metallic.type = 'peaking';
  metallic.frequency.value = 4_600;
  metallic.Q.value = 2.2;
  metallic.gain.value = 7;

  bassFilter.connect(highPass);
  highPass.connect(resonance);
  resonance.connect(metallic);

  return metallic;
}
