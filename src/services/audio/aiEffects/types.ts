import type { AiEffectId } from '@/types/voiceStudio';
import type { ProcessingProgress } from '@/services/audio/basicEffects/types';

export type ApplyAiEffectOptions = {
  onProgress?: (progress: ProcessingProgress) => void;
  signal?: AbortSignal;
  /** Pre-encoded audio for STS — skips reading sourceUri from disk. */
  audioBase64?: string;
  sourceExtension?: string;
  sourceMime?: string;
};

export type AiProcessingProgress = ProcessingProgress;

export type AiEffectDefinition = {
  id: AiEffectId;
  engine: 'wavespeed';
  /** Hosted URL when available. */
  referenceAudioUrl?: string;
  /** Bundled MP3 require() — uploaded when URL is missing. */
  referenceAudioAsset?: number;
};
