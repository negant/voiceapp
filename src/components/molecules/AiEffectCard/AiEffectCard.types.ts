import type { AiEffectId } from '@/types/voiceStudio';
import type { EffectAccessTier } from '@/types/effectAccess';
import type { ImageSourcePropType } from 'react-native';

export type AiEffectCardProps = {
  label: string;
  description?: string;
  accessTier?: EffectAccessTier;
  accentColor: string;
  iconKey: AiEffectId;
  avatarImage?: ImageSourcePropType;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  variant?: 'default' | 'compact';
  className?: string;
};
