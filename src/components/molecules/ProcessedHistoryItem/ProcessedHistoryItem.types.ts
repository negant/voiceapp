import type { ProcessedHistoryEntry } from '@/types/voiceStudio';

export type ProcessedHistoryItemProps = {
  entry: ProcessedHistoryEntry;
  exporting?: boolean;
  sharing?: boolean;
  onPlay: (entry: ProcessedHistoryEntry) => void;
  onExport: (entry: ProcessedHistoryEntry) => void;
  onShare: (entry: ProcessedHistoryEntry) => void;
  onDelete: (entry: ProcessedHistoryEntry) => void;
  className?: string;
};
