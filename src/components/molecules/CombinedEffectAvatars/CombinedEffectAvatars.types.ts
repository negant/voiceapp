import type { ImageSourcePropType } from 'react-native';

import type { EffectAvatarSize } from '@/components/atoms/EffectAvatar';

export type CombinedEffectAvatarsProps = {
  avatars: readonly [ImageSourcePropType, ImageSourcePropType];
  accentColors: readonly [string, string];
  size?: EffectAvatarSize;
  className?: string;
};
