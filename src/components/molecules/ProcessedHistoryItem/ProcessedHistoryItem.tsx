import { Download, Play, Share2, Trash2 } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import type { ProcessedHistoryItemProps } from '@/components/molecules/ProcessedHistoryItem/ProcessedHistoryItem.types';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export function ProcessedHistoryItem({
  entry,
  exporting = false,
  sharing = false,
  onPlay,
  onExport,
  onShare,
  onDelete,
  className,
}: ProcessedHistoryItemProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const iconColor = isDark ? '#818CF8' : '#4F46E5';
  const deleteIconColor = '#EF4444';

  return (
    <View
      className={cn(
        'mb-3 rounded-xl border border-border bg-background px-3 py-3 dark:border-border-dark dark:bg-background-dark',
        className,
      )}>
      <Text
        numberOfLines={2}
        className="text-sm font-medium text-foreground dark:text-foreground-dark">
        {entry.fileName}
      </Text>
      <Text
        numberOfLines={2}
        className="mt-1 text-xs text-foreground-muted dark:text-foreground-muted-dark">
        {t('voiceStudio.recentProcessedPreset', {
          preset: entry.presetLabel,
        })}
      </Text>

      <View className="mt-3 flex-row gap-2">
        <Button
          variant="secondary"
          icon={<Play size={20} color={iconColor} />}
          accessibilityLabel={t('voiceStudio.playbackPlay')}
          onPress={() => onPlay(entry)}
          className="min-h-11 min-w-11 flex-1"
        />
        <Button
          variant="secondary"
          loading={exporting}
          icon={<Download size={20} color={iconColor} />}
          accessibilityLabel={t('voiceStudio.export')}
          onPress={() => onExport(entry)}
          className="min-h-11 min-w-11 flex-1"
        />
        <Button
          variant="secondary"
          loading={sharing}
          icon={<Share2 size={20} color={iconColor} />}
          accessibilityLabel={t('voiceStudio.share')}
          onPress={() => onShare(entry)}
          className="min-h-11 min-w-11 flex-1"
        />
        <Button
          variant="secondary"
          icon={<Trash2 size={20} color={deleteIconColor} />}
          accessibilityLabel={t('accessibility.deleteProcessedFile')}
          onPress={() => onDelete(entry)}
          className="min-h-11 min-w-11 flex-1"
        />
      </View>
    </View>
  );
}
