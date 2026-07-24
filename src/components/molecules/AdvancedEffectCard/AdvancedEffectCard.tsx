import { Image, Pressable, Text, View } from 'react-native';
import { memo } from 'react';

import { AdvancedEffectIcon } from '@/components/atoms/AdvancedEffectIcon';
import { EffectAccessBadgeOverlay } from '@/components/atoms/EffectAccessBadge';
import type { AdvancedEffectCardProps } from '@/components/molecules/AdvancedEffectCard/AdvancedEffectCard.types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export const AdvancedEffectCard = memo(function AdvancedEffectCardView({
  label,
  description,
  accessTier,
  accentColor: _accentColor,
  iconKey,
  avatarImage,
  selected,
  onSelect,
  variant = 'default',
  className,
}: AdvancedEffectCardProps) {
  const { t } = useTranslation();
  const compact = variant === 'compact';
  const accessLabel =
    accessTier === 'premium'
      ? t('voiceStudio.tierBadgePremium')
      : accessTier === 'free'
        ? t('voiceStudio.tierBadgeFree')
        : null;
  const accessibilityLabel = [label, description, accessLabel]
    .filter(Boolean)
    .join('. ');

  const cardClassName = cn(
    'rounded-2xl border bg-surface active:opacity-90 dark:bg-surface-dark',
    selected
      ? 'border-brand dark:border-brand-dark'
      : 'border-border dark:border-border-dark',
    compact ? 'px-1.5 py-2' : 'px-2 py-3',
    className,
  );

  return (
    <View className="relative w-full flex-1">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={accessibilityLabel}
        onPress={onSelect}
        className={cardClassName}>
        <View className="items-center">
          {avatarImage ? (
            <Image
              source={avatarImage}
              className={cn(
                'rounded-full border-2 border-border dark:border-border-dark',
                compact ? 'mb-1.5 h-20 w-20' : 'mb-2 h-24 w-24',
              )}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View
              className={cn(
                'items-center justify-center overflow-hidden rounded-full border-2 border-border dark:border-border-dark',
                compact ? 'mb-1.5 h-20 w-20' : 'mb-2 h-24 w-24',
              )}>
              <AdvancedEffectIcon
                effectId={iconKey}
                size={compact ? 80 : 96}
              />
            </View>
          )}
          <View
            className={cn(
              'w-full justify-center',
              compact ? 'h-7' : 'h-8',
            )}>
            <Text
              className={cn(
                'text-center font-semibold text-foreground dark:text-foreground-dark',
                compact ? 'text-[11px] leading-3' : 'text-xs',
              )}
              numberOfLines={2}>
              {label}
            </Text>
          </View>
        </View>
      </Pressable>
      {accessTier ? (
        <EffectAccessBadgeOverlay
          accessTier={accessTier}
          className="absolute left-1 top-1"
        />
      ) : null}
    </View>
  );
});
