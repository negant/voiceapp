export type SourceAudioActionsProps = {
  onLoadFile: () => void;
  onRecord: () => void;
  loadLoading?: boolean;
  loadDisabled?: boolean;
  recordDisabled?: boolean;
  className?: string;
};
