import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { ButtonProps } from '@/components/atoms/Button/Button.types';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';
import { colors } from '@/theme/colors';

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  trailing,
  className,
  ...props
}: ButtonProps) {
  const { isDark } = useTheme();
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn(
        'min-h-12 items-center justify-center rounded-xl border px-6 py-2 active:opacity-85',
        isPrimary
          ? isDark
            ? 'border-brand-dark bg-brand-dark'
            : 'border-brand bg-brand'
          : isDark
            ? 'border-border-dark bg-surface-dark'
            : 'border-border bg-surface',
        isDisabled && 'opacity-50',
        className,
      )}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? '#FFFFFF' : isDark ? '#818CF8' : '#4F46E5'}
        />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          {title ? (
            <Text
              className="text-base font-semibold"
              style={{
                color: isPrimary
                  ? colors.light.primaryText
                  : isDark
                    ? colors.dark.text
                    : colors.light.text,
              }}>
              {title}
            </Text>
          ) : null}
          {trailing}
        </View>
      )}
    </Pressable>
  );
}
