import type { AdvancedEffectId } from '@/types/voiceStudio';
import type { EffectAccessTier } from '@/types/effectAccess';
import type { ImageSourcePropType } from 'react-native';

export type AdvancedEffectCardVariant = 'default' | 'compact';

export type AdvancedEffectCardProps = {
  label: string;
  description?: string;
  accessTier?: EffectAccessTier;
  accentColor: string;
  iconKey: AdvancedEffectId;
  avatarImage?: ImageSourcePropType;
  selected: boolean;
  onSelect: () => void;
  variant?: AdvancedEffectCardVariant;
  className?: string;
};
