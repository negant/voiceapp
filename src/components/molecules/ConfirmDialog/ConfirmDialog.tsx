import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import type { ConfirmDialogProps } from '@/components/molecules/ConfirmDialog/ConfirmDialog.types';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import { colors } from '@/theme/colors';

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const palette = isDark ? colors.dark : colors.light;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 px-6"
        onPress={onCancel}>
        <Pressable
          className={cn(
            'w-full max-w-md rounded-2xl border p-5',
            isDark ? 'border-border-dark' : 'border-border',
          )}
          style={{ backgroundColor: palette.surface }}
          onPress={event => event.stopPropagation()}>
          <Text
            className="text-lg font-semibold"
            style={{ color: palette.text }}>
            {title}
          </Text>
          <Text
            className="mt-2 text-sm leading-5"
            style={{ color: palette.textSecondary }}>
            {message}
          </Text>

          <View className="mt-5 flex-row gap-3">
            <Button
              title={cancelLabel ?? t('common.cancel')}
              variant="secondary"
              onPress={onCancel}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              title={confirmLabel}
              onPress={onConfirm}
              loading={isLoading}
              className="flex-1"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
