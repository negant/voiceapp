import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/molecules/HeaderBackButton';
import { ScreenHeaderTitle } from '@/components/molecules/ScreenHeaderTitle';
import type { SubScreenHeaderProps } from '@/components/molecules/SubScreenHeader/SubScreenHeader.types';
import { cn } from '@/lib/cn';

/**
 * Full JS header for stack sub-screens.
 * Avoids iOS 26 Liquid Glass UIBarButtonItem quirks (non-functional "…" instead of back).
 */
export function SubScreenHeader({ title, className }: SubScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn(
        'border-b border-border bg-surface dark:border-border-dark dark:bg-surface-dark',
        className,
      )}
      style={{ paddingTop: insets.top }}>
      <View className="h-11 flex-row items-center px-1">
        <HeaderBackButton />
        <View className="min-w-0 flex-1 justify-center pr-3">
          <ScreenHeaderTitle title={title} />
        </View>
      </View>
    </View>
  );
}
