import { memo } from 'react';
import { ActivityIndicator, Modal, Text, View } from 'react-native';

import type { SourcePreparationModalProps } from '@/components/molecules/SourcePreparationModal/SourcePreparationModal.types';
import { useTranslation } from '@/hooks/useTranslation';

export const SourcePreparationModal = memo(function SourcePreparationModalView({
  visible,
}: SourcePreparationModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
          <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
            {t('voiceStudio.sourcePreparingTitle')}
          </Text>
          <View className="mt-4 items-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
          <Text className="mt-4 text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
            {t('voiceStudio.sourcePreparingMessage')}
          </Text>
        </View>
      </View>
    </Modal>
  );
});
