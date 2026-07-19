import type { ImageSourcePropType } from 'react-native';

export type EffectAvatarSize = 'lg' | 'md' | 'sm';

export type EffectAvatarProps = {
  image?: ImageSourcePropType;
  accentColor: string;
  initial?: string;
  size?: EffectAvatarSize;
  className?: string;
};
