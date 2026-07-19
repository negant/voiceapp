import { Trash2 } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { memo } from 'react';

import { EffectAccessBadgeOverlay } from '@/components/atoms/EffectAccessBadge';
import type { VoicePresetCardProps } from '@/components/molecules/VoicePresetCard/VoicePresetCard.types';
import { CombinedEffectAvatars } from '@/components/molecules/CombinedEffectAvatars';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

const DELETE_ICON_COLOR = '#EF4444';

export const VoicePresetCard = memo(function VoicePresetCardView({
  label,
  description,
  accessTier,
  accentColor,
  avatarInitial,
  avatarImage,
  avatarImages,
  avatarAccentColors,
  selected,
  onSelect,
  onDelete,
  deleteAccessibilityLabel,
  className,
}: VoicePresetCardProps) {
  const { t } = useTranslation();
  const showLabel = label.trim().length > 0;
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
    <View className={cn('relative w-full flex-1', className)}>
      {onDelete ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={deleteAccessibilityLabel ?? label}
          hitSlop={8}
          onPress={onDelete}
          className="absolute right-1 top-1 z-10 rounded-full border border-border bg-surface p-1.5 active:opacity-80 dark:border-border-dark dark:bg-surface-dark">
          <Trash2 size={14} color={DELETE_ICON_COLOR} />
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={accessibilityLabel}
        onPress={onSelect}
        className={cn(
          'min-h-[124px] flex-1 rounded-2xl border bg-surface px-2 py-3 active:opacity-90 dark:bg-surface-dark',
          selected
            ? 'border-brand dark:border-brand-dark'
            : 'border-border dark:border-border-dark',
        )}>
        <View className="flex-1 items-center">
          <View className="mb-2 h-20 w-full items-center justify-center">
            {avatarImages ? (
              <CombinedEffectAvatars
                avatars={avatarImages}
                accentColors={
                  avatarAccentColors ?? [accentColor, accentColor]
                }
                size="md"
              />
            ) : avatarImage ? (
              <Image
                source={avatarImage}
                className="h-20 w-20 rounded-full border-2 border-border dark:border-border-dark"
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View
                className="h-20 w-20 items-center justify-center rounded-full border-2 border-border dark:border-border-dark"
                style={{ backgroundColor: accentColor }}>
                <Text className="text-2xl font-bold text-white">{avatarInitial}</Text>
              </View>
            )}
          </View>
          <View className="h-8 w-full justify-center">
            {showLabel ? (
              <Text
                className="text-center text-xs font-semibold text-foreground dark:text-foreground-dark"
                numberOfLines={2}>
                {label}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
      {accessTier ? (
        <EffectAccessBadgeOverlay
          accessTier={accessTier}
          className="absolute left-1.5 top-1.5"
        />
      ) : null}
    </View>
  );
});
