export type AudioPlaybackModalProps = {
  visible: boolean;
  title: string;
  fileName: string;
  progressSec: number;
  durationSec: number | null;
  isPlaying: boolean;
  waveformBars: number[] | null;
  isWaveformLoading: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onClose: () => void;
};
