import type { ProcessingStage } from '@/services/audio/audioDsp';

export type ProcessingModalProps = {
  visible: boolean;
  stage: ProcessingStage;
  progress: number;
  isCancelling: boolean;
  onCancel: () => void;
};
