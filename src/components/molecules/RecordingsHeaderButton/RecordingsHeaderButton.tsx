import { FolderOpen } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { DotBadge } from '@/components/atoms/DotBadge';
import type { RecordingsHeaderButtonProps } from '@/components/molecules/RecordingsHeaderButton/RecordingsHeaderButton.types';
import { cn } from '@/lib/cn';

const ICON_SIZE = 22;

export function RecordingsHeaderButton({
  count,
  label,
  iconColor,
  onPress,
  className,
}: RecordingsHeaderButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        'relative mr-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70',
        className,
      )}>
      <FolderOpen size={ICON_SIZE} color={iconColor} />
      <DotBadge visible={count > 0} />
    </Pressable>
  );
}
