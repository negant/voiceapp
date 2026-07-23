import { Text, View } from 'react-native';

import { DotBadge } from '@/components/atoms/DotBadge';
import type { DotBadgeTone } from '@/components/atoms/DotBadge/DotBadge.types';
import type { AiServiceStatusBadgeProps } from '@/components/atoms/AiServiceStatusBadge/AiServiceStatusBadge.types';
import { cn } from '@/lib/cn';
import type { AiServiceStatusColor } from '@/services/aiServiceStatus';

const TEXT_CLASS: Record<AiServiceStatusColor, string> = {
  green: 'text-green-700 dark:text-green-300',
  yellow: 'text-amber-800 dark:text-amber-300',
  red: 'text-red-700 dark:text-red-300',
  gray: 'text-zinc-600 dark:text-zinc-300',
};

const BORDER_CLASS: Record<AiServiceStatusColor, string> = {
  green: 'border-green-600/35 dark:border-green-400/40',
  yellow: 'border-amber-500/40 dark:border-amber-400/40',
  red: 'border-red-500/40 dark:border-red-400/40',
  gray: 'border-zinc-400/40 dark:border-zinc-500/40',
};

function colorToDotTone(color: AiServiceStatusColor): DotBadgeTone {
  switch (color) {
    case 'green':
      return 'green';
    case 'yellow':
      return 'yellow';
    case 'red':
      return 'red';
    case 'gray':
    default:
      return 'gray';
  }
}

export function AiServiceStatusBadge({
  color,
  label,
  className,
}: AiServiceStatusBadgeProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      className={cn(
        'flex-row items-center gap-1.5 rounded-full border bg-surface px-1.5 py-0.5 dark:bg-surface-dark',
        BORDER_CLASS[color],
        className,
      )}>
      <DotBadge visible placement="inline" tone={colorToDotTone(color)} />
      <Text
        className={cn(
          'text-[9px] font-semibold uppercase tracking-wide',
          TEXT_CLASS[color],
        )}>
        {label}
      </Text>
    </View>
  );
}
