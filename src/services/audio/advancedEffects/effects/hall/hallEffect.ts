import type { AdvancedEffectDefinition } from '@/services/audio/advancedEffects/types';
import { HALL_RESONANT_TAPS } from '@/services/audio/advancedEffects/shared/resonantEcho';

/**
 * Hall timbre — commander-style chest voice with a much longer, wetter multi-tap echo
 * that mimics a large reverberant space without clipping phone recordings.
 */
export const HALL_EFFECT: AdvancedEffectDefinition = {
  id: 'hall',
  ffmpegReference:
    'highpass=f=110,afftdn=0.55,asetrate=sr*0.8,atempo=0.85,aecho=0.35:0.42:0.72:0.55:1.1:0.38,lowshelf=f=180:g=2,volume=0.68,lowpass=f=3400',
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
    { type: 'waveshaper', amount: 0.24, inputGain: 1.05 },
    {
      type: 'resonant_echo',
      mix: 0.72,
      grit: 0.14,
      taps: HALL_RESONANT_TAPS,
    },
    { type: 'equalizer', frequencyHz: 680, gainDb: 2, q: 2.4 },
    { type: 'equalizer', frequencyHz: 1_050, gainDb: 1.5, q: 1.1 },
    { type: 'lowpass', frequencyHz: 3_400 },
    { type: 'soft_clip', amount: 0.1 },
    { type: 'gain', linear: 0.68 },
  ],
};
