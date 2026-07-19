import { memo } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

import { ProcessingElapsedTimer } from '@/components/molecules/ProcessingModal/ProcessingElapsedTimer';
import type { ProcessingModalProps } from '@/components/molecules/ProcessingModal/ProcessingModal.types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

function stageLabelKey(stage: ProcessingModalProps['stage']): string {
  switch (stage) {
    case 'preparing':
      return 'voiceStudio.processingStagePreparing';
    case 'decoding':
      return 'voiceStudio.processingStageDecoding';
    case 'loading_models':
      return 'voiceStudio.processingStageLoadingModels';
    case 'rendering':
      return 'voiceStudio.processingStageRendering';
    case 'inference':
      return 'voiceStudio.processingStageInference';
    case 'encoding':
      return 'voiceStudio.processingStageEncoding';
    case 'saving':
      return 'voiceStudio.processingStageSaving';
    default:
      return 'voiceStudio.processingStageRendering';
  }
}

export const ProcessingModal = memo(function ProcessingModalView({
  visible,
  stage,
  progress,
  isCancelling,
  onCancel,
}: ProcessingModalProps) {
  const { t } = useTranslation();
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
              {t('voiceStudio.processingTitle')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isCancelling
                  ? t('voiceStudio.processingCancelling')
                  : t('voiceStudio.processingCancel')
              }
              disabled={isCancelling}
              hitSlop={12}
              onPress={onCancel}
              className={cn(
                'rounded-lg border border-border px-3 py-1.5 dark:border-border-dark',
                isCancelling && 'opacity-60',
              )}>
              <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">
                {isCancelling
                  ? t('voiceStudio.processingCancelling')
                  : t('voiceStudio.processingCancel')}
              </Text>
            </Pressable>
          </View>

          <View className="mt-4 items-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
          <Text className="mt-4 text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
            {t('voiceStudio.processingMessage')}
          </Text>
          <Text className="mt-4 text-sm font-medium text-foreground dark:text-foreground-dark">
            {t(stageLabelKey(stage))}
          </Text>
          <View className="mt-3 h-2 overflow-hidden rounded-full bg-border dark:bg-border-dark">
            <View
              className="h-full rounded-full bg-brand dark:bg-brand-dark"
              style={{ width: `${clampedProgress * 100}%` }}
            />
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark">
              {`${Math.round(clampedProgress * 100)}%`}
            </Text>
            <ProcessingElapsedTimer visible={visible} />
          </View>
        </View>
      </View>
    </Modal>
  );
});
