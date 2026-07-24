import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/molecules/HeaderBackButton';
import { ScreenHeaderTitle } from '@/components/molecules/ScreenHeaderTitle';
import type { SubScreenHeaderProps } from '@/components/molecules/SubScreenHeader/SubScreenHeader.types';
import { cn } from '@/lib/cn';

/**
 * Full JS header for stack sub-screens.
 * Avoids iOS 26 Liquid Glass UIBarButtonItem quirks (non-functional "…" instead of back).
 * Android: taller bar + back on the trailing edge for easier reach.
 */
export function SubScreenHeader({ title, className }: SubScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';

  const titleBlock = (
    <View
      className={cn(
        'min-w-0 flex-1 justify-center',
        isAndroid ? 'pl-3' : 'pr-3',
      )}>
      <ScreenHeaderTitle title={title} />
    </View>
  );

  return (
    <View
      className={cn(
        'border-b border-border bg-surface dark:border-border-dark dark:bg-surface-dark',
        className,
      )}
      style={{ paddingTop: insets.top }}>
      <View
        className={cn(
          'flex-row items-center px-1',
          // Material toolbar is 56dp; iOS keeps compact 44pt content row.
          isAndroid ? 'h-14' : 'h-11',
        )}>
        {isAndroid ? (
          <>
            {titleBlock}
            <HeaderBackButton side="right" />
          </>
        ) : (
          <>
            <HeaderBackButton side="left" />
            {titleBlock}
          </>
        )}
      </View>
    </View>
  );
}
