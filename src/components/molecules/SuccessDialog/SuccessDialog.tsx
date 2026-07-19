import { CircleCheck } from 'lucide-react-native';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import type { SuccessDialogProps } from '@/components/molecules/SuccessDialog/SuccessDialog.types';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';
import { colors } from '@/theme/colors';

export function SuccessDialog({
  visible,
  title,
  message,
  confirmLabel,
  onClose,
}: SuccessDialogProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const palette = isDark ? colors.dark : colors.light;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 px-6"
        onPress={onClose}>
        <Pressable
          className={cn(
            'w-full max-w-md items-center rounded-2xl border p-6',
            isDark ? 'border-border-dark' : 'border-border',
          )}
          style={{ backgroundColor: palette.surface }}
          onPress={event => event.stopPropagation()}>
          <View
            className={cn(
              'mb-4 h-14 w-14 items-center justify-center rounded-full',
              isDark ? 'bg-brand-dark/20' : 'bg-brand/15',
            )}>
            <CircleCheck
              size={32}
              color={isDark ? '#818CF8' : '#4F46E5'}
            />
          </View>
          <Text
            className="text-center text-lg font-semibold"
            style={{ color: palette.text }}>
            {title}
          </Text>
          <Text
            className="mt-2 text-center text-sm leading-6"
            style={{ color: palette.textSecondary }}>
            {message}
          </Text>
          <Button
            title={confirmLabel ?? t('common.ok')}
            onPress={onClose}
            className="mt-6 min-h-12 w-full"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
