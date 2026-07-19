import type { AdvancedEffectDefinition } from '@/services/audio/advancedEffects/types';

/**
 * Advanced male voice — SoundTouch pitch-down, STFT formant deepening, chest EQ.
 * Richer than Basic Deep (slider-only); no native OfflineAudioContext wet chain.
 */
export const MALE_VOICE_EFFECT: AdvancedEffectDefinition = {
  id: 'maleVoice',
  ffmpegReference:
    'highpass=f=75,afftdn=0.38,asetrate=sr*0.86,formant=0.87,atempo=0.97,lowshelf=f=190:g=4.5,volume=0.9,lowpass=f=4600',
  filters: [
    { type: 'highpass', frequencyHz: 75 },
    { type: 'noise_reduce', strength: 0.38 },
    { type: 'pitch_shift', factor: 0.86 },
    { type: 'formant_shift', factor: 0.87 },
    { type: 'tempo_shift', factor: 0.97 },
    { type: 'lowshelf', frequencyHz: 190, gainDb: 4.5 },
    { type: 'equalizer', frequencyHz: 110, gainDb: 3, q: 0.9 },
    { type: 'equalizer', frequencyHz: 280, gainDb: 3.5, q: 2 },
    { type: 'equalizer', frequencyHz: 450, gainDb: -2, q: 1.1 },
    { type: 'equalizer', frequencyHz: 900, gainDb: 2, q: 1.4 },
    { type: 'waveshaper', amount: 0.14, inputGain: 1.02 },
    { type: 'resonant_echo', mix: 0.1, grit: 0.06 },
    { type: 'lowpass', frequencyHz: 4_600 },
    { type: 'gain', linear: 0.9 },
  ],
};
