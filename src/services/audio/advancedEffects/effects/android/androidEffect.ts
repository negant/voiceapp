import type { AdvancedEffectDefinition } from '@/services/audio/advancedEffects/types';

/**
 * Ultra-short micro-comb taps — metallic TTS ring, not audible slap/echo.
 * Kept separate from Robot/Commander comb delays (28–124 ms).
 */
export const ANDROID_MICRO_TAPS = [
  { delaySec: 0.011, gain: 0.07 },
  { delaySec: 0.019, gain: 0.05 },
] as const;

/**
 * Android assistant timbre — dry synthetic TTS:
 * lifted formants, narrow metallic peaks, digital grit and micro-comb only.
 */
export const ANDROID_EFFECT: AdvancedEffectDefinition = {
  id: 'android',
  ffmpegReference:
    'highpass=f=680,afftdn=0.55,asetrate=sr*0.96,formant=1.1,atempo=0.94,lowshelf=f=320:g=-6,equalizer=f=1200:g=6,equalizer=f=2450:g=9,equalizer=f=3800:g=6,waveshaper=0.42,aecho=0.011:0.07|0.019:0.05,lowpass=f=6200',
  filters: [
    { type: 'highpass', frequencyHz: 680 },
    { type: 'noise_reduce', strength: 0.55 },
    { type: 'pitch_shift', factor: 0.96 },
    { type: 'formant_shift', factor: 1.1 },
    { type: 'tempo_shift', factor: 0.94 },
    { type: 'lowshelf', frequencyHz: 320, gainDb: -6 },
    { type: 'equalizer', frequencyHz: 380, gainDb: -4, q: 2 },
    { type: 'equalizer', frequencyHz: 1_200, gainDb: 6, q: 3.5 },
    { type: 'equalizer', frequencyHz: 2_450, gainDb: 9, q: 3.8 },
    { type: 'equalizer', frequencyHz: 3_800, gainDb: 6, q: 2.8 },
    { type: 'waveshaper', amount: 0.42, inputGain: 1.22 },
    {
      type: 'resonant_echo',
      mix: 0.1,
      grit: 0.28,
      taps: [...ANDROID_MICRO_TAPS],
    },
    { type: 'equalizer', frequencyHz: 2_450, gainDb: 3, q: 2.5 },
    { type: 'lowpass', frequencyHz: 6_200 },
    { type: 'soft_clip', amount: 0.14 },
    { type: 'gain', linear: 0.78 },
  ],
};
