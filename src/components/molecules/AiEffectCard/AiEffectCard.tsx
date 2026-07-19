import { Image, Pressable, Text, View } from 'react-native';
import { memo } from 'react';

import { AiEffectIcon } from '@/components/atoms/AiEffectIcon';
import { EffectAccessBadgeOverlay } from '@/components/atoms/EffectAccessBadge';
import type { AiEffectCardProps } from '@/components/molecules/AiEffectCard/AiEffectCard.types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export const AiEffectCard = memo(function AiEffectCardView({
  label,
  description,
  accessTier,
  accentColor: _accentColor,
  iconKey,
  avatarImage,
  selected,
  disabled = false,
  onSelect,
  variant = 'default',
  className,
}: AiEffectCardProps) {
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

  return (
    <View className="relative w-full flex-1">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={accessibilityLabel}
        onPress={onSelect}
        className={cn(
          'rounded-2xl border bg-surface active:opacity-90 dark:bg-surface-dark',
          selected
            ? 'border-brand dark:border-brand-dark'
            : 'border-border dark:border-border-dark',
          compact ? 'px-1.5 py-2' : 'px-2 py-3',
          disabled && 'opacity-45',
          className,
        )}>
        <View className="items-center">
          {avatarImage ? (
            <Image
              source={avatarImage}
              className={cn(
                'rounded-full border-2 border-border dark:border-border-dark',
                compact ? 'mb-1.5 h-16 w-16' : 'mb-2 h-20 w-20',
              )}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View
              className={cn(
                'items-center justify-center overflow-hidden rounded-full border-2 border-border dark:border-border-dark',
                compact ? 'mb-1.5 h-16 w-16' : 'mb-2 h-20 w-20',
              )}>
              <AiEffectIcon effectId={iconKey} size={compact ? 64 : 80} />
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
