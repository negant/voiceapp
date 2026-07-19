import type {
  AdvancedEffectId,
  AiEffectId,
  PresetSelection,
  SavedVoicePreset,
  VoicePresetId,
} from '@/types/voiceStudio';

/** True when the current selection runs through the AI (WaveSpeed) pipeline. */
export function selectionUsesAiProcessing(
  selection: PresetSelection,
  customPreset: SavedVoicePreset | null | undefined,
): boolean {
  if (selection.kind === 'ai') {
    return true;
  }

  if (selection.kind !== 'custom' || !customPreset) {
    return false;
  }

  if (customPreset.source?.tier === 'ai') {
    return true;
  }

  return customPreset.effectChain?.some(ref => ref.tier === 'ai') ?? false;
}

export function clearPresetSelectionOnEffectEdit(
  selection: PresetSelection,
): PresetSelection {
  return selection.kind === 'none' ? selection : { kind: 'none' };
}

export function toggleBuiltinPresetSelection(
  selection: PresetSelection,
  presetId: VoicePresetId,
): PresetSelection {
  if (selection.kind === 'builtin' && selection.id === presetId) {
    return { kind: 'none' };
  }

  return { kind: 'builtin', id: presetId };
}

export function toggleAdvancedEffectSelection(
  selection: PresetSelection,
  effectId: AdvancedEffectId,
): PresetSelection {
  if (selection.kind === 'advanced' && selection.id === effectId) {
    return { kind: 'none' };
  }

  return { kind: 'advanced', id: effectId };
}

export function toggleAiEffectSelection(
  selection: PresetSelection,
  effectId: AiEffectId,
): PresetSelection {
  if (selection.kind === 'ai' && selection.id === effectId) {
    return { kind: 'none' };
  }

  return { kind: 'ai', id: effectId };
}

export function toggleCustomPresetSelection(
  selection: PresetSelection,
  presetId: string,
): PresetSelection {
  if (selection.kind === 'custom' && selection.id === presetId) {
    return { kind: 'none' };
  }

  return { kind: 'custom', id: presetId };
}
