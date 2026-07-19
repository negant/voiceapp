import type {
  PresetSelection,
  SavedVoicePreset,
} from '@/types/voiceStudio';

export type ConversionProcessingMode = 'local' | 'cloud' | 'mixed';

export type ConversionSummary = {
  effectName: string;
  mode: ConversionProcessingMode;
};

/** Where audio is processed for the current Voice Studio selection. */
export function resolveConversionProcessingMode(
  selection: PresetSelection,
  customPreset: SavedVoicePreset | null | undefined,
): ConversionProcessingMode | null {
  if (selection.kind === 'none') {
    return null;
  }

  if (selection.kind === 'ai') {
    return 'cloud';
  }

  if (selection.kind === 'builtin' || selection.kind === 'advanced') {
    return 'local';
  }

  if (selection.kind !== 'custom' || !customPreset) {
    return null;
  }

  if (customPreset.effectChain) {
    const hasAi = customPreset.effectChain.some(ref => ref.tier === 'ai');
    const hasLocal = customPreset.effectChain.some(ref => ref.tier !== 'ai');

    if (hasAi && hasLocal) {
      return 'mixed';
    }

    return hasAi ? 'cloud' : 'local';
  }

  if (customPreset.source?.tier === 'ai') {
    return 'cloud';
  }

  return 'local';
}

export function resolveConversionSummary(params: {
  selection: PresetSelection;
  customPreset?: SavedVoicePreset | null;
  builtinLabel?: string;
  advancedLabel?: string;
  aiLabel?: string;
  customMixLabel: string;
}): ConversionSummary | null {
  const {
    selection,
    customPreset,
    builtinLabel,
    advancedLabel,
    aiLabel,
    customMixLabel,
  } = params;

  const mode = resolveConversionProcessingMode(selection, customPreset);
  if (!mode) {
    return null;
  }

  let effectName = customMixLabel;

  if (selection.kind === 'builtin' && builtinLabel) {
    effectName = builtinLabel;
  } else if (selection.kind === 'advanced' && advancedLabel) {
    effectName = advancedLabel;
  } else if (selection.kind === 'ai' && aiLabel) {
    effectName = aiLabel;
  } else if (selection.kind === 'custom' && customPreset) {
    effectName = customPreset.name;
  }

  return { effectName, mode };
}
