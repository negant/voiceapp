import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { AudioPlaybackModal } from '@/components/molecules/AudioPlaybackModal';
import { ConversionSummary } from '@/components/molecules/ConversionSummary';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { CombineEffectsModal } from '@/components/molecules/CombineEffectsModal';
import { EffectSlider } from '@/components/molecules/EffectSlider';
import { PresetEditorModal } from '@/components/molecules/PresetEditorModal';
import { ProcessingModal } from '@/components/molecules/ProcessingModal';
import { RecordingModal } from '@/components/molecules/RecordingModal';
import { SourcePreparationModal } from '@/components/molecules/SourcePreparationModal';
import { SuccessDialog } from '@/components/molecules/SuccessDialog';
import type { VoiceStudioPanelProps } from '@/components/organisms/VoiceStudioPanel/VoiceStudioPanel.types';
import { VoiceStudioScrollContent } from '@/components/organisms/VoiceStudioPanel/VoiceStudioScrollContent';
import { useVoiceStudio } from '@/hooks/useVoiceStudio';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import type { RootStackParamList } from '@/navigation/types';
import type { ProcessedHistoryEntry } from '@/types/voiceStudio';
import { formatAiDurationSeconds } from '@/utils/creditsEconomy';
import { formatDurationLimitLabel } from '@/utils/formatDurationLimit';
import {
  isCombinedPreset,
  isPitchOnlyPreset,
} from '@/utils/derivedVoicePreset';
import { cn } from '@/lib/cn';

const STICKY_ACTION_HEIGHT = 48;
const STICKY_ACTION_GAP = 8;
const STICKY_FOOTER_PADDING = 12;
const SCROLL_BOTTOM_BUFFER = 24;
const SCROLL_BOTTOM_BUFFER_WITH_FOOTER = 20;
const EFFECT_SLIDER_BLOCK_HEIGHT = 88;

const CONVERSION_SUMMARY_BLOCK_HEIGHT = 88;

function stickyFooterHeight(
  showEditEffect: boolean,
  showConvert: boolean,
  showPitchAdjust: boolean,
  showSavePitch: boolean,
  showConversionSummary: boolean,
): number {
  let height = STICKY_FOOTER_PADDING;

  if (showPitchAdjust) {
    height += EFFECT_SLIDER_BLOCK_HEIGHT;
  }

  if (showSavePitch) {
    if (showPitchAdjust) {
      height += STICKY_ACTION_GAP;
    }
    height += STICKY_ACTION_HEIGHT;
  }

  if (showEditEffect) {
    if (showPitchAdjust || showSavePitch) {
      height += STICKY_ACTION_GAP;
    }
    height += STICKY_ACTION_HEIGHT;
  }

  if (showConversionSummary) {
    if (showPitchAdjust || showSavePitch || showEditEffect) {
      height += STICKY_ACTION_GAP;
    }
    height += CONVERSION_SUMMARY_BLOCK_HEIGHT;
  }

  if (showConvert) {
    if (showPitchAdjust || showSavePitch || showEditEffect || showConversionSummary) {
      height += STICKY_ACTION_GAP;
    }
    height += STICKY_ACTION_HEIGHT;
  }

  return height;
}

export function VoiceStudioPanel({ className }: VoiceStudioPanelProps) {
  const { t, locale } = useTranslation();
  const { isDark } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const studio = useVoiceStudio();
  const {
    refreshProcessedHistory,
    requestLoadFile,
    requestOpenRecordingModal,
    openProcessedHistoryPlayback,
    exportProcessedHistoryItem,
    shareProcessedHistoryItem,
    openRawPlaybackModal,
    requestDeleteFile,
    selectBuiltinPreset,
    selectAdvancedEffect,
    selectAiEffect,
    aiEffectsOffline,
    showAiOfflineAlert,
    selectCustomPreset,
    requestDeletePreset,
    openCreatePresetEditor,
    openCombineEffectsModal,
    requestDeleteProcessedHistory,
    getPresetAvatarInitial,
    selection,
    selectedCustomPreset,
    conversionSummary,
    canConvertAudio,
    hasPitchTweak,
    effects,
    isEditorLocked,
    isLoadingFile,
    isPreparingSource,
    isDeletingFile,
    recordingModalVisible,
    audioFile,
    fileSummary,
    localMaxDurationSec,
    aiMaxDurationSec,
    effectiveAiMaxDurationSec,
    recordingMaxDurationSec,
    usesAiProcessing,
    aiUsageEstimate,
    balance,
    isPremium,
    supportedFormatsLabel,
    customPresets,
    recentProcessedPreview,
    exportingHistoryId,
    sharingHistoryId,
    hasMoreProcessedHistory,
    isSavingPreset,
    isProcessing,
    presetEditorVisible,
    combineEffectsModalVisible,
    combineEffectsSaveError,
    combineEffectGroups,
    presetEditorMode,
    presetEditorTarget,
    presetEditorDraftEffects,
    effectKeys,
    presetEditorCanUpdate,
    presetEditorSaveError,
    clearPresetEditorSaveError,
    closePresetEditor,
    setPresetDraftEffectValue,
    createPreset,
    requestPresetUpdate,
    savePresetAsNew,
    processingStage,
    processingProgress,
    isCancellingProcessing,
    cancelProcessing,
    isRecordingActive,
    isFinalizingRecording,
    recordingElapsedSec,
    recordingLevel,
    startRecording,
    finishRecording,
    cancelRecording,
    presetSuccessNotice,
    exportSuccessNotice,
    aiConvertCreditsNotice,
    dismissPresetSuccessNotice,
    dismissExportSuccessNotice,
    dismissAiConvertCreditsNotice,
    presetUpdatePending,
    cancelPresetUpdate,
    confirmPresetUpdate,
    presetPendingDelete,
    isDeletingPreset,
    cancelDeletePreset,
    confirmDeletePreset,
    fileDeletePending,
    cancelDeleteFile,
    confirmDeleteFile,
    sourceDurationLimitNotice,
    cancelSourceDurationLimitNotice,
    confirmSourceDurationLimitNotice,
    aiStatusConvertWarningVisible,
    cancelAiStatusConvertWarning,
    confirmAiStatusConvertWarning,
    processedHistoryDeletePending,
    isDeletingProcessedHistory,
    cancelDeleteProcessedHistory,
    confirmDeleteProcessedHistory,
    playbackModal,
    playbackProgressSec,
    playbackDurationSec,
    isAudioPlaying,
    playbackWaveformBars,
    isPlaybackWaveformLoading,
    playModalAudio,
    pauseModalAudio,
    stopModalAudio,
    closePlaybackModal,
    openEditPresetEditor,
    setEffectValue,
    savePitchTweakPreset,
    convertAudio,
    createCombinedPreset,
    closeCombineEffectsModal,
    clearCombineEffectsSaveError,
  } = studio;

  useFocusEffect(
    useCallback(() => {
      refreshProcessedHistory().catch(() => undefined);
    }, [refreshProcessedHistory]),
  );

  const iconColor = isDark ? '#E5E7EB' : '#374151';
  const deleteIconColor = '#EF4444';
  const showEditEffect =
    selection.kind === 'custom' &&
    selectedCustomPreset !== null &&
    !isPitchOnlyPreset(selectedCustomPreset) &&
    !isCombinedPreset(selectedCustomPreset);
  const showConvert = canConvertAudio;
  const showConversionSummary = showConvert && conversionSummary !== null;
  const showPitchAdjust =
    showConvert &&
    (selection.kind === 'builtin' ||
      selection.kind === 'advanced' ||
      (selection.kind === 'custom' && !!selectedCustomPreset?.source));
  const showSavePitch = showPitchAdjust && hasPitchTweak;
  const showStickyFooter = showEditEffect || showConvert;
  const footerHeight = stickyFooterHeight(
    showEditEffect,
    showConvert,
    showPitchAdjust,
    showSavePitch,
    showConversionSummary,
  );

  const scrollBottomPadding =
    Math.max(insets.bottom, 16) +
    (showStickyFooter
      ? footerHeight + SCROLL_BOTTOM_BUFFER_WITH_FOOTER
      : SCROLL_BOTTOM_BUFFER);

  const handleLoadFile = useCallback(() => {
    requestLoadFile();
  }, [requestLoadFile]);

  const handleOpenRecordingModal = useCallback(() => {
    requestOpenRecordingModal();
  }, [requestOpenRecordingModal]);

  const planDurationLimitLabel = useMemo(() => {
    if (!isPremium) {
      return t('common.durationLimitSeconds', {
        count: formatAiDurationSeconds(localMaxDurationSec, locale),
      });
    }
    return formatDurationLimitLabel(localMaxDurationSec, locale, t);
  }, [isPremium, localMaxDurationSec, locale, t]);

  const planNameLabel = isPremium
    ? t('credits.planNamePremium')
    : t('credits.planNameFree');

  const handlePlayProcessedHistory = useCallback(
    (entry: ProcessedHistoryEntry) => {
      openProcessedHistoryPlayback(entry).catch(() => undefined);
    },
    [openProcessedHistoryPlayback],
  );

  const handleExportProcessedHistory = useCallback(
    (entry: ProcessedHistoryEntry) => {
      exportProcessedHistoryItem(entry).catch(() => undefined);
    },
    [exportProcessedHistoryItem],
  );

  const handleShareProcessedHistory = useCallback(
    (entry: ProcessedHistoryEntry) => {
      shareProcessedHistoryItem(entry).catch(() => undefined);
    },
    [shareProcessedHistoryItem],
  );

  return (
    <View className={cn('flex-1', className)}>
      <VoiceStudioScrollContent
        scrollBottomPadding={scrollBottomPadding}
        iconColor={iconColor}
        deleteIconColor={deleteIconColor}
        isEditorLocked={isEditorLocked}
        isLoadingFile={isLoadingFile}
        isPreparingSource={isPreparingSource}
        isDeletingFile={isDeletingFile}
        isRecordingModalVisible={recordingModalVisible}
        audioFile={audioFile}
        fileSummary={fileSummary}
        localMaxDurationSec={localMaxDurationSec}
        aiMaxDurationSec={aiMaxDurationSec}
        effectiveAiMaxDurationSec={effectiveAiMaxDurationSec}
        usesAiProcessing={usesAiProcessing}
        aiUsageEstimate={aiUsageEstimate}
        creditBalance={balance}
        isPremium={isPremium}
        supportedFormatsLabel={supportedFormatsLabel}
        selection={selection}
        customPresets={customPresets}
        recentProcessedPreview={recentProcessedPreview}
        exportingHistoryId={exportingHistoryId}
        sharingHistoryId={sharingHistoryId}
        hasMoreProcessedHistory={hasMoreProcessedHistory}
        navigation={navigation}
        onLoadFile={handleLoadFile}
        onOpenRecordingModal={handleOpenRecordingModal}
        onOpenRawPlayback={openRawPlaybackModal}
        onRequestDeleteFile={requestDeleteFile}
        onSelectBuiltinPreset={selectBuiltinPreset}
        onSelectAdvancedEffect={selectAdvancedEffect}
        onSelectAiEffect={selectAiEffect}
        aiEffectsOffline={aiEffectsOffline}
        onSelectCustomPreset={selectCustomPreset}
        onRequestDeletePreset={requestDeletePreset}
        onOpenCreatePresetEditor={openCreatePresetEditor}
        onOpenCombineEffectsModal={openCombineEffectsModal}
        onPlayProcessedHistory={handlePlayProcessedHistory}
        onExportProcessedHistory={handleExportProcessedHistory}
        onShareProcessedHistory={handleShareProcessedHistory}
        onDeleteProcessedHistory={requestDeleteProcessedHistory}
        getPresetAvatarInitial={getPresetAvatarInitial}
      />

      {showStickyFooter ? (
        <View
          className="border-t border-border bg-background px-6 pt-3 dark:border-border-dark dark:bg-background-dark"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          {showPitchAdjust ? (
            <EffectSlider
              effectKey="pitch"
              label={t('voiceStudio.effectsList.pitch')}
              value={effects.pitch}
              disabled={isEditorLocked}
              onValueChange={setEffectValue}
            />
          ) : null}
          {showSavePitch ? (
            <Button
              title={t('voiceStudio.savePitchTweak')}
              variant="secondary"
              loading={isSavingPreset}
              disabled={isEditorLocked}
              onPress={() => {
                savePitchTweakPreset().catch(() => undefined);
              }}
              className={cn(
                'min-h-12',
                (showEditEffect || showConvert) && 'mb-2',
              )}
            />
          ) : null}
          {showEditEffect ? (
            <Button
              title={t('voiceStudio.editEffect')}
              variant="secondary"
              disabled={isEditorLocked}
              onPress={openEditPresetEditor}
              className={cn('min-h-12', showConvert && 'mb-2')}
            />
          ) : null}
          {showConversionSummary && conversionSummary ? (
            <ConversionSummary
              effectName={conversionSummary.effectName}
              mode={conversionSummary.mode}
              creditCost={aiUsageEstimate?.creditCost}
            />
          ) : null}
          {showConvert ? (
            <Button
              title={t('voiceStudio.convert')}
              loading={isProcessing}
              disabled={isEditorLocked}
              onPress={() => {
                convertAudio().catch(() => undefined);
              }}
              className="min-h-12"
            />
          ) : null}
        </View>
      ) : null}

      <PresetEditorModal
        visible={presetEditorVisible}
        mode={presetEditorMode}
        target={presetEditorTarget}
        draftEffects={presetEditorDraftEffects}
        effectKeys={effectKeys}
        canUpdateExisting={presetEditorCanUpdate}
        isSaving={isSavingPreset}
        saveError={presetEditorSaveError}
        onClearSaveError={clearPresetEditorSaveError}
        onCancel={closePresetEditor}
        onDraftEffectChange={setPresetDraftEffectValue}
        onCreate={name => {
          createPreset(name).catch(() => undefined);
        }}
        onRequestUpdate={requestPresetUpdate}
        onSaveAsNew={name => {
          savePresetAsNew(name).catch(() => undefined);
        }}
      />

      <CombineEffectsModal
        visible={combineEffectsModalVisible}
        groups={combineEffectGroups}
        isSaving={isSavingPreset}
        saveError={combineEffectsSaveError}
        aiEffectsOffline={aiEffectsOffline}
        onAiOfflineAttempt={showAiOfflineAlert}
        onCancel={closeCombineEffectsModal}
        onClearSaveError={clearCombineEffectsSaveError}
        onCreate={(name, chain) => {
          createCombinedPreset(name, chain).catch(() => undefined);
        }}
      />

      <ProcessingModal
        visible={isProcessing}
        stage={processingStage}
        progress={processingProgress}
        isCancelling={isCancellingProcessing}
        onCancel={cancelProcessing}
      />

      <SourcePreparationModal
        visible={isPreparingSource && !recordingModalVisible}
      />

      <RecordingModal
        visible={recordingModalVisible}
        isRecording={isRecordingActive}
        isFinalizing={isFinalizingRecording}
        isPreparingSource={isPreparingSource}
        elapsedSec={recordingElapsedSec}
        maxDurationSec={recordingMaxDurationSec}
        creditLimitedDuration={usesAiProcessing}
        recordingLevel={recordingLevel}
        onStart={() => {
          startRecording().catch(() => undefined);
        }}
        onStop={() => {
          finishRecording().catch(() => undefined);
        }}
        onCancel={() => {
          cancelRecording().catch(() => undefined);
        }}
      />

      <SuccessDialog
        visible={presetSuccessNotice !== null}
        title={
          presetSuccessNotice?.kind === 'updated'
            ? t('voiceStudio.updatePresetSuccessTitle')
            : t('voiceStudio.savePresetSuccessTitle')
        }
        message={
          presetSuccessNotice?.kind === 'updated'
            ? t('voiceStudio.updatePresetSuccessMessage', {
                name: presetSuccessNotice?.name ?? '',
              })
            : t('voiceStudio.savePresetSuccessMessage', {
                name: presetSuccessNotice?.name ?? '',
              })
        }
        onClose={dismissPresetSuccessNotice}
      />

      <SuccessDialog
        visible={exportSuccessNotice !== null}
        title={t('voiceStudio.exportSuccessTitle')}
        message={
          Platform.OS === 'ios'
            ? t('voiceStudio.exportSuccessDialogMessageIos', {
                fileName: exportSuccessNotice?.fileName ?? '',
              })
            : t('voiceStudio.exportSuccessDialogMessageAndroid', {
                fileName: exportSuccessNotice?.fileName ?? '',
              })
        }
        onClose={dismissExportSuccessNotice}
      />

      <SuccessDialog
        visible={aiConvertCreditsNotice !== null}
        title={t('voiceStudio.aiConvertCreditsTitle')}
        message={t('voiceStudio.aiConvertCreditsMessage', {
          cost: aiConvertCreditsNotice?.cost ?? 0,
          balance: aiConvertCreditsNotice?.balance ?? 0,
        })}
        onClose={dismissAiConvertCreditsNotice}
      />

      <ConfirmDialog
        visible={presetUpdatePending}
        title={t('voiceStudio.updatePresetConfirmTitle')}
        message={t('voiceStudio.updatePresetConfirmMessage', {
          name:
            selectedCustomPreset?.name ??
            (presetEditorTarget.kind === 'custom'
              ? presetEditorTarget.preset.name
              : ''),
        })}
        confirmLabel={t('voiceStudio.updatePreset')}
        isLoading={isSavingPreset}
        onCancel={cancelPresetUpdate}
        onConfirm={() => {
          confirmPresetUpdate().catch(() => undefined);
        }}
      />

      <ConfirmDialog
        visible={presetPendingDelete !== null}
        title={t('voiceStudio.deletePresetTitle')}
        message={t('voiceStudio.deletePresetMessage', {
          name: presetPendingDelete?.name ?? '',
        })}
        confirmLabel={t('voiceStudio.deletePresetConfirm')}
        isLoading={isDeletingPreset}
        onCancel={cancelDeletePreset}
        onConfirm={() => {
          confirmDeletePreset().catch(() => undefined);
        }}
      />

      <ConfirmDialog
        visible={fileDeletePending}
        title={t('voiceStudio.deleteFileTitle')}
        message={t('voiceStudio.deleteFileMessage', {
          name: fileSummary?.name ?? '',
        })}
        confirmLabel={t('voiceStudio.deleteFileConfirm')}
        isLoading={isDeletingFile}
        onCancel={cancelDeleteFile}
        onConfirm={() => {
          confirmDeleteFile().catch(() => undefined);
        }}
      />

      <ConfirmDialog
        visible={sourceDurationLimitNotice !== null}
        title={t('voiceStudio.sourceDurationLimitTitle')}
        message={t('voiceStudio.sourceDurationLimitMessage', {
          plan: planNameLabel,
          maxDuration: planDurationLimitLabel,
        })}
        confirmLabel={t('common.ok')}
        cancelLabel={t('common.cancel')}
        onCancel={cancelSourceDurationLimitNotice}
        onConfirm={confirmSourceDurationLimitNotice}
      />

      <ConfirmDialog
        visible={aiStatusConvertWarningVisible}
        title={t('voiceStudio.aiStatusConvertWarningTitle')}
        message={t('voiceStudio.aiStatusConvertWarningMessage')}
        confirmLabel={t('common.ok')}
        cancelLabel={t('common.cancel')}
        onCancel={cancelAiStatusConvertWarning}
        onConfirm={confirmAiStatusConvertWarning}
      />

      <ConfirmDialog
        visible={processedHistoryDeletePending !== null}
        title={t('voiceStudio.deleteProcessedTitle')}
        message={t('voiceStudio.deleteProcessedMessage', {
          name: processedHistoryDeletePending?.fileName ?? '',
        })}
        confirmLabel={t('voiceStudio.deleteProcessedConfirm')}
        isLoading={isDeletingProcessedHistory}
        onCancel={cancelDeleteProcessedHistory}
        onConfirm={() => {
          confirmDeleteProcessedHistory().catch(() => undefined);
        }}
      />

      {playbackModal ? (
        <AudioPlaybackModal
          visible={playbackModal !== null}
          title={
            playbackModal.source === 'raw'
              ? t('voiceStudio.playbackOriginalTitle')
              : t('voiceStudio.playbackProcessedTitle')
          }
          fileName={playbackModal.fileName}
          progressSec={playbackProgressSec}
          durationSec={playbackDurationSec}
          isPlaying={isAudioPlaying}
          waveformBars={playbackWaveformBars}
          isWaveformLoading={isPlaybackWaveformLoading}
          onPlay={() => {
            playModalAudio().catch(() => undefined);
          }}
          onPause={() => {
            pauseModalAudio().catch(() => undefined);
          }}
          onStop={() => {
            stopModalAudio().catch(() => undefined);
          }}
          onClose={() => {
            closePlaybackModal().catch(() => undefined);
          }}
        />
      ) : null}
    </View>
  );
}
