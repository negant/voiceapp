import { ADVANCED_EFFECTS } from '@/constants/advancedEffects';
import { AI_EFFECTS, findAiEffect } from '@/constants/aiEffects';
import { VOICE_PRESETS } from '@/constants/voiceStudio';
import type { SavedVoicePreset, SavedVoicePresetSource } from '@/types/voiceStudio';

export type EffectRefLabelResolver = (ref: SavedVoicePresetSource) => string;

export function getEffectRefKey(ref: SavedVoicePresetSource): string {
  if (ref.tier === 'basic') {
    return `basic:${ref.presetId}`;
  }

  return `${ref.tier}:${ref.effectId}`;
}

export function areEffectRefsEqual(
  left: SavedVoicePresetSource,
  right: SavedVoicePresetSource,
): boolean {
  return getEffectRefKey(left) === getEffectRefKey(right);
}

export function hasMultipleAiInChain(
  chain: readonly SavedVoicePresetSource[],
): boolean {
  return chain.filter(ref => ref.tier === 'ai').length > 1;
}

export function chainIncludesAi(
  chain: readonly SavedVoicePresetSource[],
): boolean {
  return chain.some(ref => ref.tier === 'ai');
}

export function isCombinedPreset(
  preset: Pick<SavedVoicePreset, 'effectChain'>,
): boolean {
  return preset.effectChain !== undefined && preset.effectChain.length === 2;
}

export function buildCombinedEffectDefaultName(
  firstLabel: string,
  secondLabel: string,
  separator: string,
): string {
  return `${firstLabel}${separator}${secondLabel}`;
}

export function formatCombinedEffectDescription(
  chain: [SavedVoicePresetSource, SavedVoicePresetSource],
  resolveLabel: EffectRefLabelResolver,
): string {
  return `${resolveLabel(chain[0])} → ${resolveLabel(chain[1])}`;
}

export function listSelectableEffectRefs(): SavedVoicePresetSource[] {
  const basic: SavedVoicePresetSource[] = VOICE_PRESETS.map(preset => ({
    tier: 'basic',
    presetId: preset.id,
  }));
  const advanced: SavedVoicePresetSource[] = ADVANCED_EFFECTS.map(effect => ({
    tier: 'advanced',
    effectId: effect.id,
  }));
  const ai: SavedVoicePresetSource[] = AI_EFFECTS.map(effect => ({
    tier: 'ai',
    effectId: effect.id,
  }));

  return [...basic, ...advanced, ...ai];
}

export function getEffectRefAccentColor(ref: SavedVoicePresetSource): string {
  if (ref.tier === 'basic') {
    return (
      VOICE_PRESETS.find(preset => preset.id === ref.presetId)?.accentColor ??
      '#6366F1'
    );
  }

  if (ref.tier === 'advanced') {
    return (
      ADVANCED_EFFECTS.find(effect => effect.id === ref.effectId)?.accentColor ??
      '#6366F1'
    );
  }

  return findAiEffect(ref.effectId)?.accentColor ?? '#6366F1';
}
