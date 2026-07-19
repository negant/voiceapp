import type { ImageSourcePropType } from 'react-native';

import type { EffectAccessTier } from '@/types/effectAccess';

export type VoicePresetCardProps = {
  label: string;
  description?: string;
  accessTier?: EffectAccessTier;
  accentColor: string;
  avatarInitial: string;
  avatarImage?: ImageSourcePropType;
  /** Two smaller avatars for saved combined-effect presets. */
  avatarImages?: readonly [ImageSourcePropType, ImageSourcePropType];
  avatarAccentColors?: readonly [string, string];
  selected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  deleteAccessibilityLabel?: string;
  className?: string;
};
