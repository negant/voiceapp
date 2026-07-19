import type { AdvancedEffectDefinition } from '@/services/audio/advancedEffects/types';

/**
 * Commander timbre — noise cleanup, slightly slower delivery, gritty echo tail
 * and light chest resonance without clipping phone recordings.
 */
export const COMMANDER_EFFECT: AdvancedEffectDefinition = {
  id: 'commander',
  ffmpegReference:
    'highpass=f=110,afftdn=0.55,asetrate=sr*0.8,atempo=0.85,aecho=0.228:0.35,lowshelf=f=180:g=2,volume=0.76,lowpass=f=3400',
  filters: [
    { type: 'highpass', frequencyHz: 110 },
    { type: 'noise_reduce', strength: 0.55 },
    { type: 'pitch_shift', factor: 0.8 },
    { type: 'tempo_shift', factor: 0.85 },
    { type: 'lowshelf', frequencyHz: 180, gainDb: 2 },
    { type: 'equalizer', frequencyHz: 95, gainDb: 2.5, q: 0.75 },
    { type: 'equalizer', frequencyHz: 250, gainDb: 4, q: 2.2 },
    { type: 'equalizer', frequencyHz: 420, gainDb: -3, q: 1.2 },
    { type: 'equalizer', frequencyHz: 680, gainDb: 5, q: 3.2 },
    { type: 'equalizer', frequencyHz: 1_320, gainDb: 4, q: 2.3 },
    { type: 'equalizer', frequencyHz: 2_120, gainDb: 2.5, q: 1.8 },
    { type: 'waveshaper', amount: 0.3, inputGain: 1.1 },
    { type: 'resonant_echo', mix: 0.34, grit: 0.22 },
    { type: 'equalizer', frequencyHz: 680, gainDb: 2.5, q: 2.4 },
    { type: 'equalizer', frequencyHz: 1_050, gainDb: 1.8, q: 1.1 },
    { type: 'lowpass', frequencyHz: 3_400 },
    { type: 'soft_clip', amount: 0.12 },
    { type: 'gain', linear: 0.76 },
  ],
};
