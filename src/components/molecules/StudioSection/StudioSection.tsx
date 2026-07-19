import { Text, View } from 'react-native';

import type { StudioSectionProps } from '@/components/molecules/StudioSection/StudioSection.types';
import { cn } from '@/lib/cn';

export function StudioSection({ title, children, className }: StudioSectionProps) {
  return (
    <View
      className={cn(
        'mb-4 rounded-xl border border-border bg-background p-4 dark:border-border-dark dark:bg-background-dark',
        className,
      )}>
      <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
        {title}
      </Text>
      {children}
    </View>
  );
}
