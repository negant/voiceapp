import type { EffectAccessTier } from '@/types/effectAccess';
import type {
  AdvancedEffectId,
  AiEffectId,
  VoicePresetId,
} from '@/types/voiceStudio';

/**
 * Per-effect access tier for monetization UI.
 * Edit these maps when changing which effects are free vs premium.
 */
export const BASIC_EFFECT_ACCESS: Record<VoicePresetId, EffectAccessTier> = {
  female: 'free',
  male: 'free',
  helium: 'free',
  robot: 'free',
  oldRadio: 'free',
  demon: 'free',
  telephone: 'free',
  leader: 'free',
  alien: 'free',
  turtle: 'free',
  cheetah: 'free',
};

export const ADVANCED_EFFECT_ACCESS: Record<AdvancedEffectId, EffectAccessTier> =
  {
    commander: 'free',
    hall: 'free',
    warrior: 'free',
    femaleVoice: 'free',
    maleVoice: 'free',
    android: 'free',
    chipmunk: 'free',
  };

export const AI_EFFECT_ACCESS: Record<AiEffectId, EffectAccessTier> = {
  narratorka: 'premium',
  narrator: 'premium',
  legionista: 'premium',
};

export function getBasicEffectAccess(
  effectId: VoicePresetId,
): EffectAccessTier {
  return BASIC_EFFECT_ACCESS[effectId] ?? 'free';
}

export function getAdvancedEffectAccess(
  effectId: AdvancedEffectId,
): EffectAccessTier {
  return ADVANCED_EFFECT_ACCESS[effectId] ?? 'free';
}

export function getAiEffectAccess(effectId: AiEffectId): EffectAccessTier {
  return AI_EFFECT_ACCESS[effectId] ?? 'premium';
}
