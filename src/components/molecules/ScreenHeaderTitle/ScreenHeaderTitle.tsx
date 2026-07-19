import { Text } from 'react-native';

import type { ScreenHeaderTitleProps } from '@/components/molecules/ScreenHeaderTitle/ScreenHeaderTitle.types';
import { cn } from '@/lib/cn';

export function ScreenHeaderTitle({ title, className }: ScreenHeaderTitleProps) {
  return (
    <Text
      numberOfLines={2}
      className={cn(
        'text-lg font-semibold leading-6 text-foreground dark:text-foreground-dark',
        className,
      )}>
      {title}
    </Text>
  );
}
