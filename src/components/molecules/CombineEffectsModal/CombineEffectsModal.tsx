import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import type {
  CombineEffectOption,
  CombineEffectsModalProps,
} from '@/components/molecules/CombineEffectsModal/CombineEffectsModal.types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { SavedVoicePresetSource } from '@/types/voiceStudio';
import {
  areEffectRefsEqual,
  buildCombinedEffectDefaultName,
  hasMultipleAiInChain,
} from '@/utils/effectChain';
import { isValidPresetName, normalizePresetName } from '@/utils/presetAppearance';

type ActiveStep = 1 | 2;

function findOption(
  groups: CombineEffectsModalProps['groups'],
  ref: SavedVoicePresetSource | null,
): CombineEffectOption | null {
  if (!ref) {
    return null;
  }

  for (const group of groups) {
    const match = group.options.find(option => areEffectRefsEqual(option.ref, ref));
    if (match) {
      return match;
    }
  }

  return null;
}

export function CombineEffectsModal({
  visible,
  groups,
  isSaving = false,
  saveError = null,
  aiEffectsOffline = false,
  onAiOfflineAttempt,
  onCancel,
  onClearSaveError,
  onCreate,
}: CombineEffectsModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [activeStep, setActiveStep] = useState<ActiveStep>(1);
  const [step1, setStep1] = useState<SavedVoicePresetSource | null>(null);
  const [step2, setStep2] = useState<SavedVoicePresetSource | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const defaultName = useMemo(() => {
    if (!step1 || !step2) {
      return '';
    }

    return buildCombinedEffectDefaultName(
      findOption(groups, step1)?.label ?? '',
      findOption(groups, step2)?.label ?? '',
      t('voiceStudio.combineEffectsDefaultNameSeparator'),
    );
  }, [groups, step1, step2, t]);

  useEffect(() => {
    if (visible) {
      setActiveStep(1);
      setStep1(null);
      setStep2(null);
      setName('');
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && step1 && step2 && !name.trim()) {
      setName(defaultName);
    }
  }, [defaultName, name, step1, step2, visible]);

  const handleSelectEffect = (ref: SavedVoicePresetSource) => {
    onClearSaveError();
    setError(null);

    if (ref.tier === 'ai' && aiEffectsOffline) {
      onAiOfflineAttempt?.();
      return;
    }

    if (activeStep === 1) {
      if (step2 && areEffectRefsEqual(ref, step2)) {
        setError(t('voiceStudio.combineEffectsSameEffectError'));
        return;
      }

      setStep1(ref);
      setActiveStep(2);
      return;
    }

    if (step1?.tier === 'ai' && ref.tier === 'ai') {
      setError(t('voiceStudio.combineEffectsDoubleAiError'));
      return;
    }

    if (step1 && areEffectRefsEqual(ref, step1)) {
      setError(t('voiceStudio.combineEffectsSameEffectError'));
      return;
    }

    setStep2(ref);
  };

  const handleSave = () => {
    if (!step1 || !step2) {
      setError(t('voiceStudio.combineEffectsSelectBothError'));
      return;
    }

    if (hasMultipleAiInChain([step1, step2])) {
      setError(t('voiceStudio.combineEffectsDoubleAiError'));
      return;
    }

    const normalized = normalizePresetName(name);
    if (!isValidPresetName(normalized)) {
      setError(t('voiceStudio.savePresetNameInvalid'));
      return;
    }

    setError(null);
    onCreate(normalized, [step1, step2]);
  };

  const renderSelectedSlot = (
    step: ActiveStep,
    selected: SavedVoicePresetSource | null,
  ) => {
    const option = findOption(groups, selected);
    const isActive = activeStep === step;

    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => setActiveStep(step)}
        className={cn(
          'rounded-2xl border px-3 py-3',
          isActive
            ? 'border-brand bg-brand/10 dark:border-brand-dark dark:bg-brand-dark/10'
            : 'border-border bg-surface dark:border-border-dark dark:bg-surface-dark',
        )}>
        <Text className="text-xs font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
          {step === 1
            ? t('voiceStudio.combineEffectsStep1Label')
            : t('voiceStudio.combineEffectsStep2Label')}
        </Text>
        <Text className="mt-1 text-sm font-medium text-foreground dark:text-foreground-dark">
          {option?.label ?? (step === 1
            ? t('voiceStudio.combineEffectsStep1Hint')
            : t('voiceStudio.combineEffectsStep2Hint'))}
        </Text>
      </Pressable>
    );
  };

  const isSelected = (ref: SavedVoicePresetSource) =>
    (step1 !== null && areEffectRefsEqual(ref, step1)) ||
    (step2 !== null && areEffectRefsEqual(ref, step2));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}>
      <KeyboardAvoidingView
        className="flex-1 justify-end bg-black/50"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable className="flex-1" onPress={onCancel} />
        <View
          className="max-h-[92%] rounded-t-3xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark"
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
          }}>
          <View className="border-b border-border px-5 py-4 dark:border-border-dark">
            <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
              {t('voiceStudio.combineEffectsTitle')}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
              {t('voiceStudio.combineEffectsIntro')}
            </Text>
          </View>

          <ScrollView
            className="px-5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="gap-3 py-4">
              {renderSelectedSlot(1, step1)}
              {renderSelectedSlot(2, step2)}
            </View>

            {groups.map(group => (
              <View key={group.title} className="mb-4">
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
                  {group.title}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {group.options.map(option => {
                    const selected = isSelected(option.ref);
                    const optionKey =
                      option.ref.tier === 'basic'
                        ? option.ref.presetId
                        : option.ref.effectId;
                    const offlineAi =
                      option.ref.tier === 'ai' && aiEffectsOffline;
                    const doubleAiBlocked =
                      activeStep === 2 &&
                      step1?.tier === 'ai' &&
                      option.ref.tier === 'ai';
                    const disabled = offlineAi || doubleAiBlocked;

                    return (
                      <Pressable
                        key={`${option.ref.tier}-${optionKey}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected, disabled }}
                        onPress={() => {
                          if (doubleAiBlocked) {
                            setError(t('voiceStudio.combineEffectsDoubleAiError'));
                            return;
                          }
                          handleSelectEffect(option.ref);
                        }}
                        className={cn(
                          'rounded-full border px-3 py-2 active:opacity-80',
                          selected
                            ? 'border-brand bg-brand/15 dark:border-brand-dark dark:bg-brand-dark/15'
                            : 'border-border bg-background dark:border-border-dark dark:bg-background-dark',
                          disabled && 'opacity-45',
                        )}>
                        <Text className="text-sm font-medium text-foreground dark:text-foreground-dark">
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            <Text className="mb-2 text-sm font-medium text-foreground dark:text-foreground-dark">
              {t('voiceStudio.presetNameLabel')}
            </Text>
            <TextInput
              value={name}
              onChangeText={value => {
                onClearSaveError();
                setError(null);
                setName(value);
              }}
              placeholder={defaultName || t('voiceStudio.savePresetPlaceholder')}
              placeholderTextColor="#9CA3AF"
              className="mb-2 rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              editable={!isSaving}
            />

            {error ? (
              <Text className="mb-2 text-sm text-red-500">{error}</Text>
            ) : null}
            {saveError ? (
              <Text className="mb-2 text-sm text-red-500">{saveError}</Text>
            ) : null}

            <View className="mt-2 flex-row gap-3 pb-2">
              <Button
                title={t('common.cancel')}
                variant="secondary"
                onPress={onCancel}
                disabled={isSaving}
                className="flex-1 min-h-12"
              />
              <Button
                title={t('voiceStudio.combineEffectsSaveConfirm')}
                onPress={handleSave}
                loading={isSaving}
                disabled={isSaving}
                className="flex-1 min-h-12"
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
