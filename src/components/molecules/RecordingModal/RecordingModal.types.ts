export type RecordingModalProps = {
  visible: boolean;
  isRecording: boolean;
  isFinalizing: boolean;
  isPreparingSource: boolean;
  elapsedSec: number;
  maxDurationSec: number;
  /** When true, max duration is capped by AI credit balance (not the default 10 min). */
  creditLimitedDuration?: boolean;
  recordingLevel: number;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
};
