import { View } from 'react-native';

import type { DotBadgeProps } from '@/components/atoms/DotBadge/DotBadge.types';
import { cn } from '@/lib/cn';

/** Small presence dot (no number) shown in a corner of its parent. */
export function DotBadge({ visible, className }: DotBadgeProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      className={cn(
        'absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border border-background bg-brand dark:border-background-dark dark:bg-brand-dark',
        className,
      )}
    />
  );
}
