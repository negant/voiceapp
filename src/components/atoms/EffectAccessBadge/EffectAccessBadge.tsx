import { BadgeCheck, Crown } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { EffectAccessBadgeProps } from '@/components/atoms/EffectAccessBadge/EffectAccessBadge.types';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { EffectAccessTier } from '@/types/effectAccess';

function BadgeIcon({ accessTier }: { accessTier: EffectAccessTier }) {
  const { isDark } = useTheme();

  if (accessTier === 'premium') {
    return <Crown size={10} color={isDark ? '#A5B4FC' : '#4F46E5'} />;
  }

  return <BadgeCheck size={10} color={isDark ? '#86EFAC' : '#16A34A'} />;
}

export function EffectAccessBadge({
  accessTier,
  className,
}: EffectAccessBadgeProps) {
  const { t } = useTranslation();
  const label =
    accessTier === 'premium'
      ? t('voiceStudio.tierBadgePremium')
      : t('voiceStudio.tierBadgeFree');

  return (
    <View
      className={cn(
        'flex-row items-center gap-0.5 rounded-full border px-1.5 py-0.5 shadow-sm',
        accessTier === 'premium'
          ? 'border-brand/40 bg-surface dark:border-brand-dark/50 dark:bg-surface-dark'
          : 'border-green-600/35 bg-surface dark:border-green-400/40 dark:bg-surface-dark',
        className,
      )}>
      <BadgeIcon accessTier={accessTier} />
      <Text
        className={cn(
          'text-[9px] font-semibold uppercase tracking-wide',
          accessTier === 'premium'
            ? 'text-brand dark:text-brand-dark'
            : 'text-green-700 dark:text-green-300',
        )}>
        {label}
      </Text>
    </View>
  );
}
