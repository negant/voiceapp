import type { AdvancedEffectDefinition } from '@/services/audio/advancedEffects/types';

/**
 * Advanced female voice — SoundTouch pitch-up, STFT formant lift, bright EQ.
 * More polished than Basic Light; runs entirely in the shared JS advanced pipeline.
 */
export const FEMALE_VOICE_EFFECT: AdvancedEffectDefinition = {
  id: 'femaleVoice',
  ffmpegReference:
    'highpass=f=300,afftdn=0.42,asetrate=sr*1.14,formant=1.12,atempo=1.03,lowshelf=f=200:g=-2.5,volume=0.92,lowpass=f=7800',
  filters: [
    { type: 'highpass', frequencyHz: 300 },
    { type: 'noise_reduce', strength: 0.42 },
    { type: 'pitch_shift', factor: 1.14 },
    { type: 'formant_shift', factor: 1.12 },
    { type: 'tempo_shift', factor: 1.03 },
    { type: 'lowshelf', frequencyHz: 200, gainDb: -2.5 },
    { type: 'equalizer', frequencyHz: 550, gainDb: -3, q: 1.2 },
    { type: 'equalizer', frequencyHz: 1_150, gainDb: 4, q: 2.2 },
    { type: 'equalizer', frequencyHz: 2_350, gainDb: 6.5, q: 3 },
    { type: 'equalizer', frequencyHz: 3_450, gainDb: 4.5, q: 2.1 },
    { type: 'waveshaper', amount: 0.08, inputGain: 1 },
    { type: 'resonant_echo', mix: 0.14, grit: 0.05 },
    { type: 'lowpass', frequencyHz: 7_800 },
    { type: 'gain', linear: 0.92 },
  ],
};
