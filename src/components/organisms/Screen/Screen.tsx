import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ScreenProps } from '@/components/organisms/Screen/Screen.types';
import { cn } from '@/lib/cn';

// Stack screens already render below the native header; top inset would double safe area.
const SCREEN_SAFE_AREA_EDGES = ['left', 'right'] as const;

export function Screen({
  children,
  scrollable = false,
  padded = true,
  className,
}: ScreenProps) {
  const containerClass = cn(
    'flex-1 bg-background dark:bg-background-dark',
    className,
  );
  const contentClass = cn('flex-grow', padded && 'px-6 pb-6');

  if (scrollable) {
    return (
      <SafeAreaView className={containerClass} edges={SCREEN_SAFE_AREA_EDGES}>
        <ScrollView
          className="flex-1"
          contentContainerClassName={contentClass}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={cn(containerClass, contentClass)}
      edges={SCREEN_SAFE_AREA_EDGES}>
      {children}
    </SafeAreaView>
  );
}
