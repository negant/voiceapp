import { Text, View } from 'react-native';

import { ProcessedHistoryItem } from '@/components/molecules/ProcessedHistoryItem';
import type { ProcessedHistoryListProps } from '@/components/molecules/ProcessedHistoryList/ProcessedHistoryList.types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export function ProcessedHistoryList({
  entries,
  exportingId,
  sharingId,
  onPlay,
  onExport,
  onShare,
  onDelete,
  className,
}: ProcessedHistoryListProps) {
  const { t } = useTranslation();

  if (!entries.length) {
    return (
      <Text className="text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
        {t('voiceStudio.recentProcessedEmpty')}
      </Text>
    );
  }

  return (
    <View className={cn(className)}>
      {entries.map(entry => (
        <ProcessedHistoryItem
          key={entry.id}
          entry={entry}
          exporting={exportingId === entry.id}
          sharing={sharingId === entry.id}
          onPlay={onPlay}
          onExport={onExport}
          onShare={onShare}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
}
