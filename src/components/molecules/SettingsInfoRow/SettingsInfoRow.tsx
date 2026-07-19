import { Text, View } from 'react-native';

import type { SettingsInfoRowProps } from '@/components/molecules/SettingsInfoRow/SettingsInfoRow.types';
import { cn } from '@/lib/cn';

export function SettingsInfoRow({
  label,
  value,
  className,
  selectable = false,
  compactValue = false,
}: SettingsInfoRowProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between border-b border-border px-4 py-4 dark:border-border-dark',
        className,
      )}>
      <Text className="mr-3 shrink-0 text-base text-foreground-muted dark:text-foreground-muted-dark">
        {label}
      </Text>
      <Text
        selectable={selectable}
        className={cn(
          'flex-1 text-right font-medium text-foreground dark:text-foreground-dark',
          compactValue ? 'text-xs leading-4' : 'text-base',
        )}>
        {value}
      </Text>
    </View>
  );
}
