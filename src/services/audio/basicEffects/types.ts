export type ProcessingStage =
  | 'preparing'
  | 'loading_models'
  | 'decoding'
  | 'rendering'
  | 'inference'
  | 'encoding'
  | 'saving';

export type ProcessingProgress = {
  stage: ProcessingStage;
  progress: number;
};

export type ApplyAudioEffectsOptions = {
  onProgress?: (progress: ProcessingProgress) => void;
  signal?: AbortSignal;
  voicePresetId?: import('@/types/voiceStudio').VoicePresetId;
};
