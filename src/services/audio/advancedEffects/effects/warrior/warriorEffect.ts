import type { AdvancedEffectDefinition } from '@/services/audio/advancedEffects/types';

/**
 * Warrior timbre — game-style Kratos growl: deeper pitch, slower delivery,
 * heavy chest EQ, gritty waveshaper and hoarse resonant echo (shared JS chain).
 */
export const WARRIOR_EFFECT: AdvancedEffectDefinition = {
  id: 'warrior',
  ffmpegReference:
    'highpass=f=95,afftdn=0.52,asetrate=sr*0.76,atempo=0.82,lowshelf=f=170:g=3.5,volume=0.74,lowpass=f=3200',
  filters: [
    { type: 'highpass', frequencyHz: 95 },
    { type: 'noise_reduce', strength: 0.52 },
    { type: 'pitch_shift', factor: 0.76 },
    { type: 'tempo_shift', factor: 0.82 },
    { type: 'lowshelf', frequencyHz: 170, gainDb: 3.5 },
    { type: 'equalizer', frequencyHz: 88, gainDb: 3, q: 0.8 },
    { type: 'equalizer', frequencyHz: 240, gainDb: 5, q: 2.4 },
    { type: 'equalizer', frequencyHz: 410, gainDb: -2.5, q: 1.3 },
    { type: 'equalizer', frequencyHz: 720, gainDb: 6, q: 3.4 },
    { type: 'equalizer', frequencyHz: 1_380, gainDb: 4.5, q: 2.5 },
    { type: 'equalizer', frequencyHz: 2_240, gainDb: 3, q: 1.9 },
    { type: 'waveshaper', amount: 0.38, inputGain: 1.18 },
    { type: 'resonant_echo', mix: 0.36, grit: 0.32 },
    { type: 'equalizer', frequencyHz: 720, gainDb: 3, q: 2.5 },
    { type: 'lowpass', frequencyHz: 3_200 },
    { type: 'soft_clip', amount: 0.16 },
    { type: 'gain', linear: 0.74 },
  ],
};
