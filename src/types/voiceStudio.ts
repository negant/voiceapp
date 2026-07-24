export type AudioEffectKey =
  | 'pitch'
  | 'tempo'
  | 'echo'
  | 'reverb'
  | 'bass';

export type AudioEffects = Record<AudioEffectKey, number>;

export type VoicePresetId =
  | 'female'
  | 'helium'
  | 'male'
  | 'robot'
  | 'oldRadio'
  | 'demon'
  | 'telephone'
  | 'leader'
  | 'alien'
  | 'turtle'
  | 'cheetah';

/** Advanced tier effects — FFmpeg-style filter chains (separate from basic DSP). */
export type AdvancedEffectId =
  | 'commander'
  | 'hall'
  | 'warrior'
  | 'femaleVoice'
  | 'maleVoice'
  | 'android'
  | 'chipmunk';

/** AI tier effects — WaveSpeed Chatterbox Speech-to-Speech (cloud). */
export type AiEffectId =
  | 'narrator'
  | 'narratorka'
  | 'legionista'
  | 'demonMale'
  | 'frenchFemale'
  | 'matureMale'
  | 'femaleSensual';

export type AdvancedEffect = {
  id: AdvancedEffectId;
  labelKey: `voiceStudio.advancedEffectItems.${AdvancedEffectId}`;
  descriptionKey: `voiceStudio.advancedEffectItems.${AdvancedEffectId}Description`;
  accentColor: string;
  iconKey: AdvancedEffectId;
  avatarImageKey: AdvancedEffectId;
};

export type EffectTier = 'basic' | 'advanced' | 'ai';

export type AiEffect = {
  id: AiEffectId;
  labelKey: `voiceStudio.aiEffectItems.${AiEffectId}`;
  descriptionKey: `voiceStudio.aiEffectItems.${AiEffectId}Description`;
  accentColor: string;
  iconKey: AiEffectId;
  avatarImageKey: AiEffectId;
};

export type VoicePreset = {
  id: VoicePresetId;
  labelKey: `voiceStudio.presets.${VoicePresetId}`;
  descriptionKey: `voiceStudio.presets.${VoicePresetId}Description`;
  accentColor: string;
  avatarInitial: string;
  avatarImageKey: VoicePresetId;
};

export type SavedVoicePresetSource =
  | { tier: 'basic'; presetId: VoicePresetId }
  | { tier: 'advanced'; effectId: AdvancedEffectId }
  | { tier: 'ai'; effectId: AiEffectId };

export type SavedVoicePreset = {
  id: string;
  name: string;
  effects: AudioEffects;
  accentColor: string;
  createdAt: number;
  updatedAt: number;
  /** When set, preset is a pitch tweak of a built-in basic/advanced effect. */
  source?: SavedVoicePresetSource;
  /** When set, preset chains two built-in effects applied in array order. */
  effectChain?: [SavedVoicePresetSource, SavedVoicePresetSource];
  avatarImageKey?: string;
};

export type PresetSelection =
  | { kind: 'none' }
  | { kind: 'builtin'; id: VoicePresetId }
  | { kind: 'advanced'; id: AdvancedEffectId }
  | { kind: 'ai'; id: AiEffectId }
  | { kind: 'custom'; id: string };

export type SelectedAudioFile = {
  uri: string;
  name: string;
  sizeBytes: number;
  /** Unknown until native metadata is wired in. */
  durationSec: number | null;
  extension: string;
};

export type AudioProcessingResult = {
  outputUri: string;
  fileName: string;
};

export type ProcessedHistoryEntry = {
  id: string;
  fileName: string;
  outputUri: string;
  sourceFileName: string;
  presetLabel: string;
  createdAt: number;
};
