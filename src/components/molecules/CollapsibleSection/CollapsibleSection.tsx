import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { CollapsibleSectionProps } from '@/components/molecules/CollapsibleSection/CollapsibleSection.types';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

export function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
  className,
}: CollapsibleSectionProps) {
  const { isDark } = useTheme();
  const iconColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark',
        className,
      )}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        className="flex-row items-center justify-between px-4 py-4 active:opacity-80">
        <Text className="text-base font-semibold text-foreground dark:text-foreground-dark">
          {title}
        </Text>
        {expanded ? (
          <ChevronDown size={20} color={iconColor} />
        ) : (
          <ChevronRight size={20} color={iconColor} />
        )}
      </Pressable>
      {expanded ? <View className="px-4 pb-4">{children}</View> : null}
    </View>
  );
}
