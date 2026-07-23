import { View } from 'react-native';

import type {
  DotBadgeProps,
  DotBadgeTone,
} from '@/components/atoms/DotBadge/DotBadge.types';
import { cn } from '@/lib/cn';

const TONE_CLASS: Record<DotBadgeTone, string> = {
  brand: 'bg-brand dark:bg-brand-dark',
  green: 'bg-green-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
  gray: 'bg-zinc-400',
};

/** Small presence dot (no number) — header corner or inline status. */
export function DotBadge({
  visible,
  tone = 'brand',
  placement = 'corner',
  className,
}: DotBadgeProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      className={cn(
        'h-2.5 w-2.5 rounded-full border border-background dark:border-background-dark',
        TONE_CLASS[tone],
        placement === 'corner' ? 'absolute right-0.5 top-0.5' : null,
        className,
      )}
    />
  );
}
