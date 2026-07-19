import { ANDROID_EFFECT } from '@/services/audio/advancedEffects/effects/android/androidEffect';
import { CHIPMUNK_EFFECT } from '@/services/audio/advancedEffects/effects/chipmunk/chipmunkEffect';
import { COMMANDER_EFFECT } from '@/services/audio/advancedEffects/effects/commander/commanderEffect';
import { FEMALE_VOICE_EFFECT } from '@/services/audio/advancedEffects/effects/femaleVoice/femaleVoiceEffect';
import { HALL_EFFECT } from '@/services/audio/advancedEffects/effects/hall/hallEffect';
import { MALE_VOICE_EFFECT } from '@/services/audio/advancedEffects/effects/maleVoice/maleVoiceEffect';
import { WARRIOR_EFFECT } from '@/services/audio/advancedEffects/effects/warrior/warriorEffect';
import type { AdvancedEffectId } from '@/types/voiceStudio';

import type { AdvancedEffectDefinition } from './types';

export const ADVANCED_EFFECT_DEFINITIONS: Record<
  AdvancedEffectId,
  AdvancedEffectDefinition
> = {
  commander: COMMANDER_EFFECT,
  hall: HALL_EFFECT,
  warrior: WARRIOR_EFFECT,
  femaleVoice: FEMALE_VOICE_EFFECT,
  maleVoice: MALE_VOICE_EFFECT,
  android: ANDROID_EFFECT,
  chipmunk: CHIPMUNK_EFFECT,
};
