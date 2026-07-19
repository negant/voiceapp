import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/types';
import type {
  AdvancedEffectId,
  AiEffectId,
  PresetSelection,
  ProcessedHistoryEntry,
  SavedVoicePreset,
  SelectedAudioFile,
  VoicePresetId,
} from '@/types/voiceStudio';

export type AiUsageEstimate = {
  affordableSeconds: number;
  billableSeconds: number;
  creditCost: number;
  canAfford: boolean;
};

export type VoiceStudioScrollContentProps = {
  scrollBottomPadding: number;
  iconColor: string;
  deleteIconColor: string;
  isEditorLocked: boolean;
  isLoadingFile: boolean;
  isPreparingSource: boolean;
  isDeletingFile: boolean;
  isRecordingModalVisible: boolean;
  audioFile: SelectedAudioFile | null;
  fileSummary: {
    name: string;
    meta: string;
    exceedsAiLimit: boolean;
    exceedsPlanLimit: boolean;
  } | null;
  localMaxDurationSec: number;
  aiMaxDurationSec: number;
  effectiveAiMaxDurationSec: number;
  usesAiProcessing: boolean;
  aiUsageEstimate: AiUsageEstimate | null;
  creditBalance: number;
  isPremium: boolean;
  supportedFormatsLabel: string;
  selection: PresetSelection;
  customPresets: SavedVoicePreset[];
  recentProcessedPreview: ProcessedHistoryEntry[];
  exportingHistoryId: string | null;
  sharingHistoryId: string | null;
  hasMoreProcessedHistory: boolean;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onLoadFile: () => void;
  onOpenRecordingModal: () => void;
  onOpenRawPlayback: () => void;
  onRequestDeleteFile: () => void;
  onSelectBuiltinPreset: (presetId: VoicePresetId) => void;
  onSelectAdvancedEffect: (effectId: AdvancedEffectId) => void;
  onSelectAiEffect: (effectId: AiEffectId) => void;
  aiEffectsOffline?: boolean;
  onSelectCustomPreset: (preset: SavedVoicePreset) => void;
  onRequestDeletePreset: (preset: SavedVoicePreset) => void;
  onOpenCreatePresetEditor: () => void;
  onOpenCombineEffectsModal: () => void;
  onPlayProcessedHistory: (entry: ProcessedHistoryEntry) => void;
  onExportProcessedHistory: (entry: ProcessedHistoryEntry) => void;
  onShareProcessedHistory: (entry: ProcessedHistoryEntry) => void;
  onDeleteProcessedHistory: (entry: ProcessedHistoryEntry) => void;
  getPresetAvatarInitial: (name: string) => string;
};
