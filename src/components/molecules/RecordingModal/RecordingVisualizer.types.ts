export type RecordingVisualizerProps = {
  isRecording: boolean;
  recordingLevel: number;
  onStart: () => void;
  onStop: () => void;
};
