import { View, type ViewProps } from 'react-native';

import { EffectAccessBadge } from '@/components/atoms/EffectAccessBadge/EffectAccessBadge';
import type { EffectAccessTier } from '@/types/effectAccess';

type EffectAccessBadgeOverlayProps = {
  accessTier: EffectAccessTier;
  className?: string;
  style?: ViewProps['style'];
};

/** Card overlay — render as last sibling so it stacks above avatar images on Android. */
export function EffectAccessBadgeOverlay({
  accessTier,
  className,
  style,
}: EffectAccessBadgeOverlayProps) {
  return (
    <View
      pointerEvents="none"
      className={className}
      style={[{ zIndex: 30, elevation: 30 }, style]}>
      <EffectAccessBadge accessTier={accessTier} />
    </View>
  );
}
