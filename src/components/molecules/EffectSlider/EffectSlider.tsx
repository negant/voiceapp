import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Slider } from '@/components/atoms/Slider';
import type { EffectSliderProps } from '@/components/molecules/EffectSlider/EffectSlider.types';
import { cn } from '@/lib/cn';
import {
  AUDIO_EFFECT_DISPLAY_MAX,
  AUDIO_EFFECT_DISPLAY_MIN,
  displayToStorage,
  parseDisplayInput,
  storageToDisplay,
} from '@/utils/audioEffectScale';

export function EffectSlider({
  label,
  effectKey,
  value,
  disabled = false,
  onValueChange,
}: EffectSliderProps) {
  const displayValue = storageToDisplay(value);
  const [draftValue, setDraftValue] = useState<string | null>(null);

  useEffect(() => {
    setDraftValue(null);
  }, [value]);

  const commitDraft = () => {
    if (draftValue === null) {
      return;
    }

    const parsed = parseDisplayInput(draftValue);
    if (parsed !== null) {
      onValueChange(effectKey, displayToStorage(parsed));
    }

    setDraftValue(null);
  };

  const shownValue =
    draftValue ?? (displayValue > 0 ? `+${displayValue}` : String(displayValue));

  return (
    <View
      className={cn('mb-3', disabled && 'opacity-50')}
      pointerEvents={disabled ? 'none' : 'auto'}>
      <Text className="mb-1 text-sm font-medium text-foreground dark:text-foreground-dark">
        {label}
      </Text>

      <View className="flex-row items-center gap-5">
        <View className="min-w-0 flex-1 gap-1 pr-4">
          <View className="flex-row justify-between px-0.5">
            <Text className="text-xs leading-none text-foreground-muted dark:text-foreground-muted-dark">
              {'-10'}
            </Text>
            <Text className="text-xs leading-none text-foreground-muted dark:text-foreground-muted-dark">
              {'0'}
            </Text>
            <Text className="text-xs leading-none text-foreground-muted dark:text-foreground-muted-dark">
              {'+10'}
            </Text>
          </View>

          <Slider
            trackLayout="start"
            className="w-full"
            value={displayValue}
            minimumValue={AUDIO_EFFECT_DISPLAY_MIN}
            maximumValue={AUDIO_EFFECT_DISPLAY_MAX}
            accessibilityLabel={label}
            onValueChange={next => onValueChange(effectKey, displayToStorage(next))}
          />
        </View>

        <TextInput
          accessibilityLabel={label}
          value={shownValue}
          keyboardType="numbers-and-punctuation"
          maxLength={4}
          onChangeText={setDraftValue}
          onBlur={commitDraft}
          onSubmitEditing={commitDraft}
          className="w-14 rounded-lg border border-border bg-background px-1 py-1.5 text-center text-sm font-semibold text-foreground dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
        />
      </View>
    </View>
  );
}
