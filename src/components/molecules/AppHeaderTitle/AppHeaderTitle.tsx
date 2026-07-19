import { View } from 'react-native';

import { Logo } from '@/components/atoms/Logo';
import { CreditsHeaderBadge } from '@/components/molecules/CreditsHeaderBadge';
import type { AppHeaderTitleProps } from '@/components/molecules/AppHeaderTitle/AppHeaderTitle.types';
import { cn } from '@/lib/cn';

export function AppHeaderTitle({ className }: AppHeaderTitleProps) {
  return (
    <View className={cn('h-11 flex-row items-center gap-2', className)}>
      <Logo size={32} variant="mark" />
      <CreditsHeaderBadge />
    </View>
  );
}
