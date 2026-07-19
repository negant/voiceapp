import { Text, View } from 'react-native';

import { EffectAvatar } from '@/components/atoms/EffectAvatar';
import type { CombinedEffectAvatarsProps } from '@/components/molecules/CombinedEffectAvatars/CombinedEffectAvatars.types';
import { cn } from '@/lib/cn';

export function CombinedEffectAvatars({
  avatars,
  accentColors,
  size = 'md',
  className,
}: CombinedEffectAvatarsProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-center gap-1.5',
        className,
      )}>
      <EffectAvatar image={avatars[0]} accentColor={accentColors[0]} size={size} />
      <Text className="text-sm font-semibold text-foreground-muted dark:text-foreground-muted-dark">
        →
      </Text>
      <EffectAvatar image={avatars[1]} accentColor={accentColors[1]} size={size} />
    </View>
  );
}
