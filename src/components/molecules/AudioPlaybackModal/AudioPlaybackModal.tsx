import { Pause, Play, Square, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

import type { AudioPlaybackModalProps } from '@/components/molecules/AudioPlaybackModal/AudioPlaybackModal.types';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import {
  DEFAULT_WAVEFORM_BAR_COUNT,
  MAX_WAVEFORM_BAR_HEIGHT,
  MIN_WAVEFORM_BAR_HEIGHT,
} from '@/utils/waveformPreview';

const FALLBACK_WAVEFORM_BARS = Array.from(
  { length: DEFAULT_WAVEFORM_BAR_COUNT },
  (_, index) =>
    MIN_WAVEFORM_BAR_HEIGHT +
    ((index % 5) + 1) * ((MAX_WAVEFORM_BAR_HEIGHT - MIN_WAVEFORM_BAR_HEIGHT) / 6),
);

function formatPlaybackTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

type IconButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: ReactNode;
};

function IconButton({
  label,
  active = false,
  disabled = false,
  onPress,
  children,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'h-12 w-12 items-center justify-center rounded-full border',
        active
          ? 'border-brand bg-brand dark:border-brand-dark dark:bg-brand-dark'
          : 'border-border bg-surface dark:border-border-dark dark:bg-surface-dark',
        disabled && 'opacity-50',
      )}>
      {children}
    </Pressable>
  );
}

export function AudioPlaybackModal({
  visible,
  title,
  fileName,
  progressSec,
  durationSec,
  isPlaying,
  waveformBars,
  isWaveformLoading,
  onPlay,
  onPause,
  onStop,
  onClose,
}: AudioPlaybackModalProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const duration = durationSec && durationSec > 0 ? durationSec : null;
  const progressRatio = duration
    ? Math.min(1, Math.max(0, progressSec / duration))
    : 0;
  const primaryIconColor = '#FFFFFF';
  const secondaryIconColor = isDark ? '#F9FAFB' : '#111827';
  const bars = waveformBars?.length ? waveformBars : FALLBACK_WAVEFORM_BARS;
  const playedBarCount = Math.floor(progressRatio * bars.length);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end bg-black/50"
        onPress={onClose}>
        <Pressable
          className="rounded-t-3xl border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark"
          onPress={event => event.stopPropagation()}>
          <View className="mb-4 flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
                {title}
              </Text>
              <Text
                numberOfLines={1}
                className="mt-1 text-sm text-foreground-muted dark:text-foreground-muted-dark">
                {fileName}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={t('voiceStudio.playbackClose')}
              accessibilityRole="button"
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-background dark:bg-background-dark">
              <X size={20} color={secondaryIconColor} />
            </Pressable>
          </View>

          <View className="mb-4 rounded-2xl bg-background p-4 dark:bg-background-dark">
            <View className="mb-3 flex-row items-center justify-between gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
                {t('voiceStudio.waveformPreview')}
              </Text>
              {isWaveformLoading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color={secondaryIconColor} />
                  <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark">
                    {t('voiceStudio.waveformLoading')}
                  </Text>
                </View>
              ) : null}
            </View>
            <View className="h-20 flex-row items-center justify-between overflow-hidden rounded-xl">
              {bars.map((height, index) => {
                const isPlayed = index < playedBarCount;
                const isCurrent =
                  index === playedBarCount && progressRatio > 0 && isPlaying;

                return (
                  <View
                    key={`waveform-bar-${index}`}
                    className="flex-1 items-center justify-center px-px">
                    <View
                      className={cn(
                        'w-full max-w-[4px] rounded-full bg-brand/25 dark:bg-brand-dark/25',
                        isWaveformLoading && 'opacity-40',
                      )}
                      style={{ height }}>
                      <View
                        className={cn(
                          'w-full rounded-full bg-brand dark:bg-brand-dark',
                          isPlayed || isCurrent ? 'h-full' : 'h-0',
                          isCurrent && 'opacity-80',
                        )}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <View className="mt-4 h-2 overflow-hidden rounded-full bg-border dark:bg-border-dark">
              <View
                className="h-full rounded-full bg-brand dark:bg-brand-dark"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </View>

            <View className="mt-2 flex-row justify-between">
              <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark">
                {formatPlaybackTime(progressSec)}
              </Text>
              <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark">
                {duration
                  ? formatPlaybackTime(duration)
                  : t('voiceStudio.durationUnknown')}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center gap-4">
            <IconButton
              label={t('voiceStudio.playbackPlay')}
              active={isPlaying}
              onPress={onPlay}>
              <Play
                size={22}
                color={isPlaying ? primaryIconColor : secondaryIconColor}
                fill={isPlaying ? primaryIconColor : 'transparent'}
              />
            </IconButton>
            <IconButton
              label={t('voiceStudio.playbackPause')}
              disabled={!isPlaying}
              onPress={onPause}>
              <Pause size={22} color={secondaryIconColor} />
            </IconButton>
            <IconButton
              label={t('voiceStudio.playbackStop')}
              onPress={onStop}>
              <Square
                size={20}
                color={secondaryIconColor}
                fill={secondaryIconColor}
              />
            </IconButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
