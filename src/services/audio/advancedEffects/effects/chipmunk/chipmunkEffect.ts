import type { AdvancedEffectDefinition } from '@/services/audio/advancedEffects/types';

/** Strong pitch-up preset for audible A/B testing of advanced tier. */
export const CHIPMUNK_EFFECT: AdvancedEffectDefinition = {
  id: 'chipmunk',
  ffmpegReference: 'asetrate=sr*1.55,atempo=1/1.55',
  filters: [{ type: 'pitch_shift', factor: 1.55 }],
};
