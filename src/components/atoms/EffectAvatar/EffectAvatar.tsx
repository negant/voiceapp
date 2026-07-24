import { Image, Text, View } from 'react-native';

import type { EffectAvatarProps } from '@/components/atoms/EffectAvatar/EffectAvatar.types';
import { cn } from '@/lib/cn';

const SIZE_CLASSES: Record<
  NonNullable<EffectAvatarProps['size']>,
  { container: string; initial: string }
> = {
  lg: { container: 'h-24 w-24', initial: 'text-2xl' },
  md: { container: 'h-16 w-16', initial: 'text-lg' },
  sm: { container: 'h-12 w-12', initial: 'text-base' },
};

export function EffectAvatar({
  image,
  accentColor,
  initial = '?',
  size = 'lg',
  className,
}: EffectAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (image) {
    return (
      <Image
        source={image}
        className={cn(
          'rounded-full border-2 border-border dark:border-border-dark',
          sizeClass.container,
          className,
        )}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      className={cn(
        'items-center justify-center rounded-full border-2 border-border dark:border-border-dark',
        sizeClass.container,
        className,
      )}
      style={{ backgroundColor: accentColor }}>
      <Text className={cn('font-bold text-white', sizeClass.initial)}>
        {initial.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}
