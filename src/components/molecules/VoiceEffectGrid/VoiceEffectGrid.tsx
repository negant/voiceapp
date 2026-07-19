import { Children, isValidElement, type ReactElement } from 'react';
import { View } from 'react-native';

import type { VoiceEffectGridProps } from '@/components/molecules/VoiceEffectGrid/VoiceEffectGrid.types';
import { cn } from '@/lib/cn';

export function VoiceEffectGrid({ children, className }: VoiceEffectGridProps) {
  return (
    <View
      className={cn(
        'flex-row flex-wrap items-stretch justify-between gap-y-3',
        className,
      )}>
      {Children.map(children, child => {
        if (!isValidElement(child)) {
          return null;
        }

        const element = child as ReactElement<{ key?: string | number }>;

        return (
          <View key={element.key} className="w-[48%] self-stretch">
            {child}
          </View>
        );
      })}
    </View>
  );
}
