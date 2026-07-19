import type { SavedVoicePresetSource } from '@/types/voiceStudio';

export type CombineEffectOption = {
  ref: SavedVoicePresetSource;
  label: string;
};

export type CombineEffectOptionGroup = {
  title: string;
  options: CombineEffectOption[];
};

export type CombineEffectsModalProps = {
  visible: boolean;
  groups: CombineEffectOptionGroup[];
  isSaving?: boolean;
  saveError?: string | null;
  /** When true, AI options look disabled and selecting them triggers onAiOfflineAttempt. */
  aiEffectsOffline?: boolean;
  onAiOfflineAttempt?: () => void;
  onCancel: () => void;
  onClearSaveError: () => void;
  onCreate: (
    name: string,
    chain: [SavedVoicePresetSource, SavedVoicePresetSource],
  ) => void;
};
