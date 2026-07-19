import type { AudioEffectDspParams } from '@/utils/audioEffectParams';

export type WetMixGains = {
  bassGainDb: number;
  masterGain: number;
  wetSend: number;
  dryGain: number;
  reverbDelay1Sec: number;
  reverbDelay2Sec: number;
  reverbWetGain: number;
};

export type BasicWetPresetModule = {
  id: string;
  calculateTailSec: (
    params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>,
  ) => number;
  resolveMixGains: (params: AudioEffectDspParams) => WetMixGains;
  connectVoiceChain: (
    offlineCtx: import('react-native-audio-api').OfflineAudioContext,
    bassFilter: import('react-native-audio-api').BiquadFilterNode,
  ) => import('react-native-audio-api').AudioNode;
  connectEcho: (
    offlineCtx: import('react-native-audio-api').OfflineAudioContext,
    source: import('react-native-audio-api').AudioNode,
    destination: import('react-native-audio-api').AudioNode,
    echoMix: number,
  ) => void;
  connectAmbience?: (
    offlineCtx: import('react-native-audio-api').OfflineAudioContext,
    destination: import('react-native-audio-api').AudioNode,
    sampleRate: number,
    renderDurationSec: number,
  ) => void;
  preProcessSamples?: (samples: Float32Array) => Float32Array;
};
