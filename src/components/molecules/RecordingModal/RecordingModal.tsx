import { memo } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

import { RecordingVisualizer } from '@/components/molecules/RecordingModal/RecordingVisualizer';
import type { RecordingModalProps } from '@/components/molecules/RecordingModal/RecordingModal.types';
import { useTranslation } from '@/hooks/useTranslation';
import { formatAudioDuration } from '@/utils/audioDuration';
import { cn } from '@/lib/cn';

export const RecordingModal = memo(function RecordingModalView({
  visible,
  isRecording,
  isFinalizing,
  isPreparingSource,
  elapsedSec,
  maxDurationSec,
  creditLimitedDuration = false,
  recordingLevel,
  onStart,
  onStop,
  onCancel,
}: RecordingModalProps) {
  const { t } = useTranslation();
  const elapsedLabel = formatAudioDuration(elapsedSec);
  const maxLabel = formatAudioDuration(maxDurationSec);
  const isBusy = isFinalizing || isPreparingSource;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
              {t('voiceStudio.recordingModalTitle')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
              disabled={isBusy}
              hitSlop={12}
              onPress={onCancel}
              className={cn(
                'rounded-lg border border-border px-3 py-1.5 dark:border-border-dark',
                isBusy && 'opacity-60',
              )}>
              <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">
                {t('common.cancel')}
              </Text>
            </Pressable>
          </View>

          <Text className="mt-4 text-center text-3xl font-semibold tabular-nums text-foreground dark:text-foreground-dark">
            {elapsedLabel}
          </Text>
          <Text className="mt-1 text-center text-xs text-foreground-muted dark:text-foreground-muted-dark">
            {creditLimitedDuration
              ? t('voiceStudio.recordingCreditsLimitedHint', { max: maxLabel })
              : t('voiceStudio.recordingMaxDurationHint', { max: maxLabel })}
          </Text>

          <View className="mt-4">
            {isBusy ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-base font-medium text-foreground dark:text-foreground-dark">
                  {t(
                    isPreparingSource
                      ? 'voiceStudio.sourcePreparingTitle'
                      : 'voiceStudio.recordingFinalizingTitle',
                  )}
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
                  {t(
                    isPreparingSource
                      ? 'voiceStudio.sourcePreparingMessage'
                      : 'voiceStudio.recordingFinalizingMessage',
                  )}
                </Text>
              </View>
            ) : (
              <RecordingVisualizer
                isRecording={isRecording}
                recordingLevel={recordingLevel}
                onStart={onStart}
                onStop={onStop}
              />
            )}
          </View>

          <Text className="mt-2 text-center text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
            {isRecording
              ? t('voiceStudio.recordingInProgressHint')
              : t('voiceStudio.recordingReadyHint')}
          </Text>
        </View>
      </View>
    </Modal>
  );
});
