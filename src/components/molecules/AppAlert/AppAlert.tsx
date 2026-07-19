import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  Wifi,
  WifiOff,
} from 'lucide-react-native';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import type {
  AppAlertIconHint,
  AppAlertProps,
  AppAlertVariant,
} from '@/components/molecules/AppAlert/AppAlert.types';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import { colors } from '@/theme/colors';

const VARIANT_ICON = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
} as const;

function resolveIcon(
  variant: AppAlertVariant,
  iconHint: AppAlertIconHint,
): typeof Info {
  if (iconHint === 'offline') {
    return WifiOff;
  }
  if (iconHint === 'online') {
    return Wifi;
  }
  return VARIANT_ICON[variant];
}

function variantColors(
  variant: AppAlertVariant,
  isDark: boolean,
): { icon: string; ring: string } {
  switch (variant) {
    case 'success':
      return {
        icon: isDark ? '#34D399' : '#059669',
        ring: isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/15',
      };
    case 'warning':
      return {
        icon: isDark ? '#FBBF24' : '#D97706',
        ring: isDark ? 'bg-amber-500/20' : 'bg-amber-500/15',
      };
    case 'error':
      return {
        icon: isDark ? '#F87171' : '#DC2626',
        ring: isDark ? 'bg-red-500/20' : 'bg-red-500/15',
      };
    case 'info':
    default:
      return {
        icon: isDark ? '#818CF8' : '#4F46E5',
        ring: isDark ? 'bg-brand-dark/20' : 'bg-brand/15',
      };
  }
}

export function AppAlert({
  visible,
  title,
  message = '',
  variant = 'info',
  iconHint = 'default',
  confirmLabel,
  onClose,
}: AppAlertProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const palette = isDark ? colors.dark : colors.light;
  const accent = variantColors(variant, isDark);
  const Icon = resolveIcon(variant, iconHint);
  const hasMessage = message.trim().length > 0;

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
          accessibilityRole="summary"
          className={cn(
            'w-full max-w-md items-center rounded-2xl border p-6',
            isDark ? 'border-border-dark' : 'border-border',
          )}
          style={{ backgroundColor: palette.surface }}
          onPress={event => event.stopPropagation()}>
          <View
            className={cn(
              'mb-4 h-14 w-14 items-center justify-center rounded-full',
              accent.ring,
            )}>
            <Icon size={32} color={accent.icon} />
          </View>
          {/* Inline colors: NativeWind text classes are unreliable inside Modal. */}
          <Text
            className="text-center text-lg font-semibold"
            style={{ color: palette.text }}>
            {title}
          </Text>
          {hasMessage ? (
            <Text
              className="mt-2 text-center text-sm leading-6"
              style={{ color: palette.textSecondary }}>
              {message}
            </Text>
          ) : null}
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
