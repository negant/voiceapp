import type {
  AudioEffects,
  PresetSelection,
  SavedVoicePreset,
} from '@/types/voiceStudio';
import { NEUTRAL_AUDIO_EFFECTS } from '@/constants/voiceStudio';
import { getPresetEffects } from '@/utils/voiceStudioEffects';

/** Merges live pitch tweak into the effect mix sent to the DSP pipeline. */
export function resolveProcessingEffects(
  selection: PresetSelection,
  effects: AudioEffects,
  customPreset: SavedVoicePreset | null | undefined,
): AudioEffects {
  if (selection.kind === 'builtin') {
    return {
      ...getPresetEffects(selection.id),
      pitch: effects.pitch,
    };
  }

  if (selection.kind === 'custom' && customPreset) {
    if (customPreset.effectChain) {
      return { ...NEUTRAL_AUDIO_EFFECTS };
    }

    if (customPreset.source?.tier === 'basic') {
      return {
        ...getPresetEffects(customPreset.source.presetId),
        pitch: effects.pitch,
      };
    }

    if (customPreset.source?.tier === 'advanced') {
      return {
        ...NEUTRAL_AUDIO_EFFECTS,
        pitch: effects.pitch,
      };
    }

    return { ...customPreset.effects };
  }

  return { ...effects };
}

export function getBuiltinBaseline(presetId: Parameters<typeof getPresetEffects>[0]) {
  return getPresetEffects(presetId);
}
