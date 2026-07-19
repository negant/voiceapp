import type { AiEffectId } from '@/types/voiceStudio';

/**
 * Active AI effect avatars (PNG under assets/presets/).
 * Unused AI art kept on disk for later: romantyczna, pirat, ogr, narratorMaleDeep, etc.
 */
export const AI_EFFECT_AVATAR_IMAGES: Record<AiEffectId, number> = {
  narratorka: require('../../assets/presets/narratorFemale.png'),
  narrator: require('../../assets/presets/narratorMale.png'),
  legionista: require('../../assets/presets/godOfWar.png'),
};
