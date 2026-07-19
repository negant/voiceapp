import type { ProcessedHistoryEntry } from '@/types/voiceStudio';

export type ProcessedHistoryListProps = {
  entries: ProcessedHistoryEntry[];
  exportingId: string | null;
  sharingId?: string | null;
  onPlay: (entry: ProcessedHistoryEntry) => void;
  onExport: (entry: ProcessedHistoryEntry) => void;
  onShare: (entry: ProcessedHistoryEntry) => void;
  onDelete: (entry: ProcessedHistoryEntry) => void;
  className?: string;
};
