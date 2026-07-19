import { Check, ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { SettingsRowProps } from '@/components/molecules/SettingsRow/SettingsRow.types';
import { cn } from '@/lib/cn';

export function SettingsRow({
  title,
  subtitle,
  selected = false,
  showChevron = false,
  onPress,
  className,
}: SettingsRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-between border-b border-border px-4 py-4 dark:border-border-dark',
        className,
      )}>
      <View className="mr-3 flex-1">
        <Text className="text-base font-medium text-foreground dark:text-foreground-dark">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-sm text-foreground-muted dark:text-foreground-muted-dark">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <Check size={20} color="#4F46E5" />
      ) : showChevron ? (
        <ChevronRight size={20} color="#6B7280" />
      ) : null}
    </Pressable>
  );
}
