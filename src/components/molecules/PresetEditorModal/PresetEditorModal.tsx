import { useEffect, useState } from 'react';
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
import { EffectSlider } from '@/components/molecules/EffectSlider';
import type { PresetEditorModalProps } from '@/components/molecules/PresetEditorModal/PresetEditorModal.types';
import { useTranslation } from '@/hooks/useTranslation';
import { isValidPresetName, normalizePresetName } from '@/utils/presetAppearance';

export function PresetEditorModal({
  visible,
  mode,
  target,
  draftEffects,
  effectKeys,
  canUpdateExisting,
  isSaving = false,
  saveError = null,
  onCancel,
  onDraftEffectChange,
  onCreate,
  onRequestUpdate,
  onSaveAsNew,
  onClearSaveError,
}: PresetEditorModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === 'edit';
  const defaultName =
    target.kind === 'custom' ? `${target.preset.name} copy` : '';

  useEffect(() => {
    if (visible) {
      setName(mode === 'create' ? '' : defaultName);
      setError(null);
    }
  }, [defaultName, mode, visible]);

  const validateName = (): string | null => {
    const normalized = normalizePresetName(name);
    if (!isValidPresetName(normalized)) {
      setError(t('voiceStudio.savePresetNameInvalid'));
      return null;
    }

    setError(null);
    return normalized;
  };

  const title = isEdit
    ? t('voiceStudio.editPresetTitle')
    : t('voiceStudio.addPresetTitle');

  const subtitle = (() => {
    if (!isEdit) {
      return t('voiceStudio.addPresetSubtitle');
    }
    if (target.kind === 'builtin') {
      return t('voiceStudio.editBuiltinPresetSubtitle', { name: target.label });
    }
    if (target.kind === 'custom') {
      if (target.preset.source) {
        return t('voiceStudio.editDerivedPresetSubtitle', {
          name: target.preset.name,
        });
      }

      return t('voiceStudio.editCustomPresetSubtitle', {
        name: target.preset.name,
      });
    }
    return t('voiceStudio.addPresetSubtitle');
  })();

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
          <View className="px-5 pt-5">
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-border dark:bg-border-dark" />
            <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
              {title}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
              {subtitle}
            </Text>
          </View>

          <ScrollView
            className="px-5"
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled>
            {effectKeys.map(effectKey => (
              <EffectSlider
                key={effectKey}
                effectKey={effectKey}
                label={t(`voiceStudio.effectsList.${effectKey}`)}
                value={draftEffects[effectKey]}
                onValueChange={onDraftEffectChange}
              />
            ))}

            <Text className="mb-2 mt-2 text-sm font-medium text-foreground dark:text-foreground-dark">
              {t('voiceStudio.presetNameLabel')}
            </Text>
            <TextInput
              value={name}
              onChangeText={value => {
                setName(value);
                if (error) {
                  setError(null);
                }
                onClearSaveError?.();
              }}
              placeholder={t('voiceStudio.savePresetPlaceholder')}
              placeholderTextColor="#9CA3AF"
              maxLength={40}
              className="rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
            />

            {error ? (
              <Text className="mt-2 text-sm text-red-500">{error}</Text>
            ) : null}

            {saveError ? (
              <Text className="mt-2 text-sm text-red-500">{saveError}</Text>
            ) : null}

            {canUpdateExisting ? (
              <Button
                title={t('voiceStudio.updatePreset')}
                onPress={onRequestUpdate}
                disabled={isSaving}
                className="mt-4 min-h-12"
              />
            ) : null}

            <View className="mt-4 flex-row gap-3 pb-2">
              <Button
                title={t('common.cancel')}
                variant="secondary"
                onPress={onCancel}
                disabled={isSaving}
                className="min-h-12 flex-1"
              />
              <Button
                title={
                  isEdit
                    ? t('voiceStudio.saveAsNewPresetConfirm')
                    : t('voiceStudio.addCustomPresetConfirm')
                }
                onPress={() => {
                  const normalized = validateName();
                  if (!normalized) {
                    return;
                  }
                  if (isEdit) {
                    onSaveAsNew(normalized);
                  } else {
                    onCreate(normalized);
                  }
                }}
                loading={isSaving}
                className="min-h-12 flex-1"
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
