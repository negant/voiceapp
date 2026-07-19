import { ADVANCED_EFFECT_AVATAR_IMAGES } from '@/constants/advancedEffectAvatars';
import { ADVANCED_EFFECTS } from '@/constants/advancedEffects';
import { AI_EFFECT_AVATAR_IMAGES } from '@/constants/aiEffectAvatars';
import { findAiEffect } from '@/constants/aiEffects';
import { NEUTRAL_AUDIO_EFFECTS, VOICE_PRESETS } from '@/constants/voiceStudio';
import { PRESET_AVATAR_IMAGES } from '@/constants/presetAvatars';
import { hasDuplicatePresetName } from '@/services/database/voicePresetRepository';
import type {
  AdvancedEffectId,
  AiEffectId,
  AudioEffects,
  SavedVoicePreset,
  SavedVoicePresetSource,
  VoicePresetId,
} from '@/types/voiceStudio';
import type { ImageSourcePropType } from 'react-native';
import { storageToDisplay } from '@/utils/audioEffectScale';
import { getBuiltinBaseline } from '@/utils/resolveProcessingEffects';

export function isPitchOnlyPreset(
  preset: Pick<SavedVoicePreset, 'source' | 'effectChain'>,
): boolean {
  return preset.source !== undefined && preset.effectChain === undefined;
}

export { isCombinedPreset } from '@/utils/effectChain';

export function buildDerivedPresetName(
  baseLabel: string,
  pitchStorage: number,
): string {
  const display = storageToDisplay(pitchStorage);
  if (display === 0) {
    return baseLabel;
  }

  const pitchSuffix = display > 0 ? ` +${display}` : ` ${display}`;
  return `${baseLabel}${pitchSuffix}`;
}

export function resolveUniquePresetName(
  presets: SavedVoicePreset[],
  baseName: string,
  excludeId?: string,
): string {
  if (!hasDuplicatePresetName(presets, baseName, excludeId)) {
    return baseName;
  }

  for (let index = 2; index < 100; index += 1) {
    const candidate = `${baseName} (${index})`;
    if (!hasDuplicatePresetName(presets, candidate, excludeId)) {
      return candidate;
    }
  }

  return `${baseName} ${Date.now()}`;
}

export function getSavedPresetAvatarImage(
  preset: SavedVoicePreset,
): (typeof PRESET_AVATAR_IMAGES)[VoicePresetId] | undefined {
  if (preset.effectChain?.[0]) {
    return getSavedPresetAvatarImageForSource(preset.effectChain[0]);
  }

  if (preset.avatarImageKey) {
    if (preset.source?.tier === 'advanced') {
      return ADVANCED_EFFECT_AVATAR_IMAGES[
        preset.avatarImageKey as AdvancedEffectId
      ];
    }

    if (preset.source?.tier === 'ai') {
      return AI_EFFECT_AVATAR_IMAGES[preset.avatarImageKey as AiEffectId];
    }

    return PRESET_AVATAR_IMAGES[preset.avatarImageKey as VoicePresetId];
  }

  if (preset.source?.tier === 'basic') {
    return PRESET_AVATAR_IMAGES[preset.source.presetId];
  }

  if (preset.source?.tier === 'advanced') {
    return ADVANCED_EFFECT_AVATAR_IMAGES[preset.source.effectId];
  }

  if (preset.source?.tier === 'ai') {
    return AI_EFFECT_AVATAR_IMAGES[preset.source.effectId];
  }

  return undefined;
}

function getSavedPresetAvatarImageForSource(
  source: SavedVoicePresetSource,
): (typeof PRESET_AVATAR_IMAGES)[VoicePresetId] | undefined {
  return getEffectRefAvatarImage(source);
}

/** Resolves bundled avatar artwork for any built-in effect reference. */
export function getEffectRefAvatarImage(
  source: SavedVoicePresetSource,
): ImageSourcePropType | undefined {
  if (source.tier === 'basic') {
    return PRESET_AVATAR_IMAGES[source.presetId];
  }

  if (source.tier === 'advanced') {
    return ADVANCED_EFFECT_AVATAR_IMAGES[source.effectId];
  }

  return AI_EFFECT_AVATAR_IMAGES[source.effectId];
}

export function getCombinedPresetAvatarImages(
  preset: SavedVoicePreset,
): [ImageSourcePropType, ImageSourcePropType] | undefined {
  if (!preset.effectChain) {
    return undefined;
  }

  const first = getEffectRefAvatarImage(preset.effectChain[0]);
  const second = getEffectRefAvatarImage(preset.effectChain[1]);

  if (!first || !second) {
    return undefined;
  }

  return [first, second];
}

export function getCombinedPresetAccentColors(
  preset: SavedVoicePreset,
): [string, string] | undefined {
  if (!preset.effectChain) {
    return undefined;
  }

  return [
    getDerivedPresetAccentColor(preset.effectChain[0]),
    getDerivedPresetAccentColor(preset.effectChain[1]),
  ];
}

export function getSavedPresetAccentColor(preset: SavedVoicePreset): string {
  if (preset.effectChain?.[0]) {
    return getDerivedPresetAccentColor(preset.effectChain[0]);
  }

  if (preset.source?.tier === 'basic') {
    const builtin = VOICE_PRESETS.find(item => item.id === preset.source?.presetId);
    return builtin?.accentColor ?? preset.accentColor;
  }

  if (preset.source?.tier === 'advanced') {
    const advanced = ADVANCED_EFFECTS.find(
      item => item.id === preset.source?.effectId,
    );
    return advanced?.accentColor ?? preset.accentColor;
  }

  if (preset.source?.tier === 'ai') {
    const aiEffect = findAiEffect(preset.source.effectId);
    return aiEffect?.accentColor ?? preset.accentColor;
  }

  return preset.accentColor;
}

export function buildDerivedPresetEffects(
  source: SavedVoicePresetSource,
  pitchStorage: number,
): AudioEffects {
  if (source.tier === 'basic') {
    return {
      ...getBuiltinBaseline(source.presetId),
      pitch: pitchStorage,
    };
  }

  return {
    ...NEUTRAL_AUDIO_EFFECTS,
    pitch: pitchStorage,
  };
}

export function getDerivedPresetAvatarKey(
  source: SavedVoicePresetSource,
): string {
  return source.tier === 'basic' ? source.presetId : source.effectId;
}

export function getDerivedPresetAccentColor(
  source: SavedVoicePresetSource,
): string {
  if (source.tier === 'basic') {
    return (
      VOICE_PRESETS.find(preset => preset.id === source.presetId)?.accentColor ??
      '#6366F1'
    );
  }

  if (source.tier === 'advanced') {
    return (
      ADVANCED_EFFECTS.find(effect => effect.id === source.effectId)?.accentColor ??
      '#6366F1'
    );
  }

  return findAiEffect(source.effectId)?.accentColor ?? '#6366F1';
}
