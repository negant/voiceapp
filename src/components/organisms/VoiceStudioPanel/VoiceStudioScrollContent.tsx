import { Crown, Play, Trash2 } from 'lucide-react-native';
import { memo, useCallback, useMemo } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { EffectAccessBadge } from '@/components/atoms/EffectAccessBadge';
import { AdvancedEffectCard } from '@/components/molecules/AdvancedEffectCard';
import { AiEffectCard } from '@/components/molecules/AiEffectCard';
import { AppIntroFooter } from '@/components/molecules/AppIntroSection/AppIntroFooter';
import { AppIntroSection } from '@/components/molecules/AppIntroSection';
import { ProcessedHistoryList } from '@/components/molecules/ProcessedHistoryList';
import { SourceAudioActions } from '@/components/molecules/SourceAudioActions';
import { StudioSection } from '@/components/molecules/StudioSection';
import { VoiceEffectGrid } from '@/components/molecules/VoiceEffectGrid';
import { VoicePresetCard } from '@/components/molecules/VoicePresetCard';
import type { VoiceStudioScrollContentProps } from '@/components/organisms/VoiceStudioPanel/VoiceStudioScrollContent.types';
import { ADVANCED_EFFECT_AVATAR_IMAGES } from '@/constants/advancedEffectAvatars';
import { ADVANCED_EFFECTS } from '@/constants/advancedEffects';
import { AI_EFFECT_AVATAR_IMAGES } from '@/constants/aiEffectAvatars';
import { AI_EFFECTS } from '@/constants/aiEffects';
import { PRESET_AVATAR_IMAGES } from '@/constants/presetAvatars';
import {
  getAdvancedEffectAccess,
  getAiEffectAccess,
  getBasicEffectAccess,
} from '@/constants/effectAccessTiers';
import { VOICE_PRESETS } from '@/constants/voiceStudio';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import { formatDurationLimitLabel } from '@/utils/formatDurationLimit';
import { formatAiDurationSeconds } from '@/utils/creditsEconomy';
import type {
  AdvancedEffectId,
  AiEffectId,
  SavedVoicePreset,
  VoicePresetId,
} from '@/types/voiceStudio';
import {
  getCombinedPresetAccentColors,
  getCombinedPresetAvatarImages,
  getSavedPresetAccentColor,
  getSavedPresetAvatarImage,
  isCombinedPreset,
} from '@/utils/derivedVoicePreset';

type BuiltinPresetCardProps = {
  presetId: VoicePresetId;
  label: string;
  description: string;
  selected: boolean;
  onSelectPreset: (presetId: VoicePresetId) => void;
};

const BuiltinPresetCard = memo(function BuiltinPresetCardView({
  presetId,
  label,
  description,
  selected,
  onSelectPreset,
}: BuiltinPresetCardProps) {
  const preset = VOICE_PRESETS.find(item => item.id === presetId);
  const handleSelect = useCallback(
    () => onSelectPreset(presetId),
    [onSelectPreset, presetId],
  );

  if (!preset) {
    return null;
  }

  return (
    <VoicePresetCard
      label={label}
      description={description}
      accessTier={getBasicEffectAccess(presetId)}
      accentColor={preset.accentColor}
      avatarInitial={preset.avatarInitial}
      avatarImage={PRESET_AVATAR_IMAGES[preset.avatarImageKey]}
      selected={selected}
      onSelect={handleSelect}
    />
  );
});

type AdvancedEffectGridCardProps = {
  effectId: AdvancedEffectId;
  label: string;
  description: string;
  selected: boolean;
  onSelectEffect: (effectId: AdvancedEffectId) => void;
};

const AdvancedEffectGridCard = memo(function AdvancedEffectGridCardView({
  effectId,
  label,
  description,
  selected,
  onSelectEffect,
}: AdvancedEffectGridCardProps) {
  const effect = ADVANCED_EFFECTS.find(item => item.id === effectId);
  const handleSelect = useCallback(
    () => onSelectEffect(effectId),
    [onSelectEffect, effectId],
  );

  if (!effect) {
    return null;
  }

  return (
    <AdvancedEffectCard
      label={label}
      description={description}
      accessTier={getAdvancedEffectAccess(effectId)}
      accentColor={effect.accentColor}
      iconKey={effect.iconKey}
      avatarImage={ADVANCED_EFFECT_AVATAR_IMAGES[effect.avatarImageKey]}
      selected={selected}
      onSelect={handleSelect}
    />
  );
});

type AiEffectGridCardProps = {
  effectId: AiEffectId;
  label: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onSelectEffect: (effectId: AiEffectId) => void;
};

const AiEffectGridCard = memo(function AiEffectGridCardView({
  effectId,
  label,
  description,
  selected,
  disabled = false,
  onSelectEffect,
}: AiEffectGridCardProps) {
  const effect = AI_EFFECTS.find(item => item.id === effectId);
  const handleSelect = useCallback(
    () => onSelectEffect(effectId),
    [onSelectEffect, effectId],
  );

  if (!effect) {
    return null;
  }

  return (
    <AiEffectCard
      label={label}
      description={description}
      accessTier={getAiEffectAccess(effectId)}
      accentColor={effect.accentColor}
      iconKey={effect.iconKey}
      avatarImage={AI_EFFECT_AVATAR_IMAGES[effect.avatarImageKey]}
      selected={selected}
      disabled={disabled}
      onSelect={handleSelect}
    />
  );
});

type CustomPresetCardProps = {
  preset: SavedVoicePreset;
  selected: boolean;
  avatarInitial: string;
  onSelectPreset: (preset: SavedVoicePreset) => void;
  onDeletePreset?: (preset: SavedVoicePreset) => void;
  deleteAccessibilityLabel?: string;
};

const CustomPresetCard = memo(function CustomPresetCardView({
  preset,
  selected,
  avatarInitial,
  onSelectPreset,
  onDeletePreset,
  deleteAccessibilityLabel,
}: CustomPresetCardProps) {
  const combinedAvatars = isCombinedPreset(preset)
    ? getCombinedPresetAvatarImages(preset)
    : undefined;
  const combinedAccentColors = isCombinedPreset(preset)
    ? getCombinedPresetAccentColors(preset)
    : undefined;

  const handleSelect = useCallback(
    () => onSelectPreset(preset),
    [onSelectPreset, preset],
  );
  const handleDelete = useCallback(() => {
    onDeletePreset?.(preset);
  }, [onDeletePreset, preset]);

  return (
    <VoicePresetCard
      label={preset.name}
      accentColor={getSavedPresetAccentColor(preset)}
      avatarInitial={avatarInitial}
      avatarImage={combinedAvatars ? undefined : getSavedPresetAvatarImage(preset)}
      avatarImages={combinedAvatars}
      avatarAccentColors={combinedAccentColors}
      selected={selected}
      onSelect={handleSelect}
      onDelete={onDeletePreset ? handleDelete : undefined}
      deleteAccessibilityLabel={deleteAccessibilityLabel}
    />
  );
});

export const VoiceStudioScrollContent = memo(function VoiceStudioScrollContentView({
  scrollBottomPadding,
  iconColor,
  deleteIconColor,
  isEditorLocked,
  isLoadingFile,
  isPreparingSource,
  isDeletingFile,
  isRecordingModalVisible,
  audioFile,
  fileSummary,
  localMaxDurationSec,
  aiMaxDurationSec: _aiMaxDurationSec,
  effectiveAiMaxDurationSec,
  usesAiProcessing,
  aiUsageEstimate,
  creditBalance,
  isPremium,
  supportedFormatsLabel,
  selection,
  customPresets,
  recentProcessedPreview,
  exportingHistoryId,
  sharingHistoryId,
  hasMoreProcessedHistory,
  navigation,
  onLoadFile,
  onOpenRecordingModal,
  onOpenRawPlayback,
  onRequestDeleteFile,
  onSelectBuiltinPreset,
  onSelectAdvancedEffect,
  onSelectAiEffect,
  aiEffectsOffline = false,
  onSelectCustomPreset,
  onRequestDeletePreset,
  onOpenCreatePresetEditor,
  onOpenCombineEffectsModal,
  onPlayProcessedHistory,
  onExportProcessedHistory,
  onShareProcessedHistory,
  onDeleteProcessedHistory,
  getPresetAvatarInitial,
}: VoiceStudioScrollContentProps) {
  const { t, locale } = useTranslation();
  const usesAiSelection = usesAiProcessing;
  const freeMaxDurationLabel = t('common.durationLimitSeconds', {
    count: formatAiDurationSeconds(localMaxDurationSec, locale),
  });
  const planMaxDurationLabel = isPremium
    ? formatDurationLimitLabel(localMaxDurationSec, locale, t)
    : freeMaxDurationLabel;
  const premiumAccent = '#D97706';

  const handleOpenPremium = useCallback(() => {
    navigation.navigate('CreditsInfo');
  }, [navigation]);

  const handleSelectBuiltinPreset = useCallback(
    (presetId: VoicePresetId) => {
      onSelectBuiltinPreset(presetId);
    },
    [onSelectBuiltinPreset],
  );

  const handleSelectAdvancedEffect = useCallback(
    (effectId: AdvancedEffectId) => {
      onSelectAdvancedEffect(effectId);
    },
    [onSelectAdvancedEffect],
  );

  const handleSelectAiEffect = useCallback(
    (effectId: AiEffectId) => {
      onSelectAiEffect(effectId);
    },
    [onSelectAiEffect],
  );

  const customPresetCards = useMemo(
    () =>
      customPresets.map(preset => ({
        preset,
        selected: selection.kind === 'custom' && selection.id === preset.id,
        avatarInitial: getPresetAvatarInitial(preset.name),
        deleteAccessibilityLabel: t('accessibility.deletePreset', {
          name: preset.name,
        }),
      })),
    [customPresets, getPresetAvatarInitial, selection, t],
  );

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-6 pt-2"
      contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={Platform.OS === 'android'}
      keyboardShouldPersistTaps="handled">
      <AppIntroSection />

      <StudioSection title={t('voiceStudio.sourceAudio')}>
        <Text className="mb-3 text-sm font-medium leading-5 text-foreground dark:text-foreground-dark">
          {t('voiceStudio.sourceSectionHint')}
        </Text>
        <SourceAudioActions
          onLoadFile={onLoadFile}
          onRecord={onOpenRecordingModal}
          loadLoading={isLoadingFile || isPreparingSource}
          loadDisabled={isEditorLocked}
          recordDisabled={isEditorLocked || isRecordingModalVisible}
        />

        {audioFile ? (
          <View className="mt-3 flex-row gap-3">
            <Button
              variant="secondary"
              icon={<Play size={22} color={iconColor} />}
              accessibilityLabel={t('voiceStudio.playRaw')}
              onPress={onOpenRawPlayback}
              className="min-h-12 min-w-12 flex-1"
            />
            <Button
              variant="secondary"
              icon={<Trash2 size={22} color={deleteIconColor} />}
              accessibilityLabel={t('accessibility.deleteAudioFile')}
              disabled={isDeletingFile}
              onPress={onRequestDeleteFile}
              className="min-h-12 min-w-12 flex-1"
            />
          </View>
        ) : null}

        <Text className="mt-3 text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
          {isPreparingSource
            ? t('voiceStudio.sourcePreparingInline')
            : fileSummary
              ? `${fileSummary.name} · ${fileSummary.meta}${
                  fileSummary.exceedsAiLimit && usesAiSelection && aiUsageEstimate
                    ? ` · ${t('voiceStudio.aiTrimInline', {
                        seconds: effectiveAiMaxDurationSec,
                        cost: aiUsageEstimate.creditCost,
                      })}`
                    : fileSummary.exceedsPlanLimit
                      ? ` · ${t('voiceStudio.durationExceededInline', {
                          maxDuration: planMaxDurationLabel,
                        })}`
                      : ''
                }`
              : t('voiceStudio.noFileHint')}
        </Text>
        {usesAiSelection && aiUsageEstimate ? (
          <Text
            className={cn(
              'mt-2 text-xs leading-5',
              aiUsageEstimate.canAfford
                ? 'text-foreground-muted dark:text-foreground-muted-dark'
                : 'text-amber-600 dark:text-amber-400',
            )}>
            {t('voiceStudio.aiCreditsUsageHint', {
              balance: creditBalance,
              minutes: Math.floor(effectiveAiMaxDurationSec / 60),
              cost: aiUsageEstimate.creditCost,
              billableMinutes:
                aiUsageEstimate.billableSeconds > 0
                  ? Math.ceil(aiUsageEstimate.billableSeconds / 60)
                  : 0,
            })}
          </Text>
        ) : null}
        <Text className="mt-2 text-xs leading-5 text-foreground-muted dark:text-foreground-muted-dark">
          {t('voiceStudio.supportedFormatsHint', {
            formats: supportedFormatsLabel,
          })}
        </Text>
        <Text className="mt-3 text-xs font-semibold leading-5 text-foreground dark:text-foreground-dark">
          {isPremium
            ? t('voiceStudio.premiumPlanRecordingLimitLabel', {
                maxDuration: planMaxDurationLabel,
              })
            : t('voiceStudio.freePlanRecordingLimitLabel', {
                maxDuration: freeMaxDurationLabel,
              })}
        </Text>
        {!isPremium ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('voiceStudio.extendRecordingLimitCta')}
            onPress={handleOpenPremium}
            className="mt-2 w-full flex-row items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 active:opacity-80 dark:border-amber-400/40 dark:bg-amber-400/10">
            <Crown size={14} color={premiumAccent} />
            <Text className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              {t('voiceStudio.extendRecordingLimitCta')}
            </Text>
          </Pressable>
        ) : null}
      </StudioSection>

      <View
        className={cn(isEditorLocked && 'opacity-60')}
        pointerEvents={isEditorLocked ? 'none' : 'auto'}>
        <StudioSection title={t('voiceStudio.basicEffects')}>
          <Text className="mb-3 text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
            {t('voiceStudio.basicEffectsSectionHint')}
          </Text>
          <VoiceEffectGrid>
            {VOICE_PRESETS.map(preset => (
              <BuiltinPresetCard
                key={preset.id}
                presetId={preset.id}
                label={t(preset.labelKey)}
                description={t(preset.descriptionKey)}
                selected={selection.kind === 'builtin' && selection.id === preset.id}
                onSelectPreset={handleSelectBuiltinPreset}
              />
            ))}
          </VoiceEffectGrid>
        </StudioSection>

        <StudioSection title={t('voiceStudio.advancedEffects')}>
          <Text className="mb-3 text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
            {t('voiceStudio.advancedEffectsSectionHint')}
          </Text>
          <VoiceEffectGrid>
            {ADVANCED_EFFECTS.map(effect => (
              <AdvancedEffectGridCard
                key={effect.id}
                effectId={effect.id}
                label={t(effect.labelKey)}
                description={t(effect.descriptionKey)}
                selected={
                  selection.kind === 'advanced' && selection.id === effect.id
                }
                onSelectEffect={handleSelectAdvancedEffect}
              />
            ))}
          </VoiceEffectGrid>
        </StudioSection>

        <StudioSection title={t('voiceStudio.aiEffects')}>
          <Text className="mb-3 text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
            {isPremium
              ? t('voiceStudio.aiEffectsSectionHintPremium', {
                  seconds: effectiveAiMaxDurationSec,
                })
              : t('voiceStudio.aiEffectsSectionHint')}
          </Text>
          {usesAiSelection && effectiveAiMaxDurationSec <= 0 ? (
            <Text className="mb-3 text-xs leading-5 text-amber-600 dark:text-amber-400">
              {t('voiceStudio.aiCreditsBlockedMessage')}
            </Text>
          ) : null}
          <VoiceEffectGrid>
            {AI_EFFECTS.map(effect => (
              <AiEffectGridCard
                key={effect.id}
                effectId={effect.id}
                label={t(effect.labelKey)}
                description={t(effect.descriptionKey)}
                selected={selection.kind === 'ai' && selection.id === effect.id}
                disabled={aiEffectsOffline}
                onSelectEffect={handleSelectAiEffect}
              />
            ))}
          </VoiceEffectGrid>
        </StudioSection>

        <StudioSection title={t('voiceStudio.yourEffects')}>
          {customPresetCards.length > 0 ? (
            <VoiceEffectGrid className="mb-3">
              {customPresetCards.map(item => (
                <CustomPresetCard
                  key={item.preset.id}
                  preset={item.preset}
                  selected={item.selected}
                  avatarInitial={item.avatarInitial}
                  onSelectPreset={onSelectCustomPreset}
                  onDeletePreset={
                    item.selected ? onRequestDeletePreset : undefined
                  }
                  deleteAccessibilityLabel={item.deleteAccessibilityLabel}
                />
              ))}
            </VoiceEffectGrid>
          ) : null}

          <Button
            title={t('voiceStudio.addCustomEffect')}
            variant="secondary"
            disabled={isEditorLocked}
            onPress={onOpenCreatePresetEditor}
            className="min-h-14"
          />

          <Button
            title={t('voiceStudio.combineEffects')}
            variant="secondary"
            disabled={isEditorLocked}
            onPress={onOpenCombineEffectsModal}
            trailing={<EffectAccessBadge accessTier="premium" />}
            className="mt-3 min-h-14"
          />

          {!customPresetCards.length ? (
            <Text className="mt-3 text-sm text-foreground-muted dark:text-foreground-muted-dark">
              {t('voiceStudio.noCustomPresetsHint')}
            </Text>
          ) : null}
        </StudioSection>
      </View>

      <StudioSection title={t('voiceStudio.recentProcessedTitle')}>
        <ProcessedHistoryList
          entries={recentProcessedPreview}
          exportingId={exportingHistoryId}
          sharingId={sharingHistoryId}
          onPlay={onPlayProcessedHistory}
          onExport={onExportProcessedHistory}
          onShare={onShareProcessedHistory}
          onDelete={onDeleteProcessedHistory}
        />
        {hasMoreProcessedHistory ? (
          <Button
            title={t('voiceStudio.showMoreRecordings')}
            variant="secondary"
            onPress={() => navigation.navigate('YourRecordings')}
            className="mt-1 min-h-12"
          />
        ) : null}
      </StudioSection>

      <AppIntroFooter />
    </ScrollView>
  );
});
