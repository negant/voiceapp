import type { AudioEffectKey, AudioEffects, SavedVoicePreset, VoicePresetId } from '@/types/voiceStudio';

export type PresetEditorMode = 'create' | 'edit';

export type PresetEditorTarget =
  | { kind: 'none' }
  | { kind: 'builtin'; id: VoicePresetId; label: string }
  | { kind: 'custom'; preset: SavedVoicePreset };

export type PresetEditorModalProps = {
  visible: boolean;
  mode: PresetEditorMode;
  target: PresetEditorTarget;
  draftEffects: AudioEffects;
  effectKeys: readonly AudioEffectKey[];
  canUpdateExisting: boolean;
  isSaving?: boolean;
  onCancel: () => void;
  onDraftEffectChange: (key: AudioEffectKey, value: number) => void;
  onCreate: (name: string) => void;
  onRequestUpdate: () => void;
  onSaveAsNew: (name: string) => void;
  saveError?: string | null;
  onClearSaveError?: () => void;
};
