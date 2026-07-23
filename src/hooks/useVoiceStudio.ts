import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AUDIO_EFFECT_KEYS,
  DEFAULT_VOICE_PRESET_ID,
  NEUTRAL_AUDIO_EFFECTS,
  VOICE_PRESETS,
} from '@/constants/voiceStudio';
import {
  resolveAiMaxDurationSec,
  resolveImportMaxSizeMb,
  resolvePlanMaxDurationSec,
} from '@/constants/audioLimits';
import { ADVANCED_EFFECTS } from '@/constants/advancedEffects';
import { AI_EFFECTS, findAiEffect, CLOUD_AI_EFFECT_IDS, isAiEffectProviderConfigured } from '@/constants/aiEffects';
import { RECENT_PROCESSED_PREVIEW_LIMIT } from '@/constants/processedHistory';
import { env } from '@/config/env';
import type {
  CombineEffectOptionGroup,
} from '@/components/molecules/CombineEffectsModal/CombineEffectsModal.types';
import type {
  PresetEditorMode,
  PresetEditorTarget,
} from '@/components/molecules/PresetEditorModal/PresetEditorModal.types';
import { useDatabase } from '@/hooks/useDatabase';
import { useAppAlert } from '@/hooks/useAppAlert';
import { useNetworkConnectivity } from '@/hooks/useNetworkConnectivity';
import { useTranslation } from '@/hooks/useTranslation';
import { useProcessedRecordingsCount } from '@/providers/ProcessedRecordingsCountProvider';
import { useAiServiceStatus } from '@/providers/AiServiceStatusProvider';
import { useCredits } from '@/providers/CreditsProvider';
import { chargeAiCreditsBeforeProcessing } from '@/utils/aiCreditCharge';
import {
  calculateAiSecondsAffordableFromCredits,
  calculateCreditsForAiDurationSec,
  formatAiDurationSeconds,
  resolveAiBillableDurationSec,
  resolveEffectiveAiMaxDurationSec,
} from '@/utils/creditsEconomy';
import {
  AudioRecordingSession,
  deleteStoredAudioFile,
  exportProcessedAudio,
  getAudioPlaybackInfo,
  pauseAudioPlayback,
  pickAudioFile,
  playAudioFile,
  prepareSourceAudio,
  processAudio,
  resumeAudioPlayback,
  shareProcessedAudio,
  stopAudioPlayback,
  getAudioWaveformPreview,
} from '@/services/audio';
import {
  ensurePermission,
  showPermissionDeniedAlert,
} from '@/services/permissions/appPermissions';
import type { ProcessingStage } from '@/services/audio/audioDsp';
import {
  addProcessedHistoryEntry,
  deleteProcessedHistoryEntry,
  listProcessedHistory,
} from '@/services/database/processedHistoryRepository';
import {
  createVoicePreset,
  deleteVoicePreset,
  hasDuplicatePresetName,
  listVoicePresets,
  updateVoicePreset,
} from '@/services/database/voicePresetRepository';
import type {
  AdvancedEffectId,
  AiEffectId,
  AudioEffectKey,
  AudioEffects,
  PresetSelection,
  ProcessedHistoryEntry,
  SavedVoicePreset,
  SavedVoicePresetSource,
  SelectedAudioFile,
  VoicePresetId,
} from '@/types/voiceStudio';
import {
  buildDerivedPresetEffects,
  buildDerivedPresetName,
  getDerivedPresetAccentColor,
  getDerivedPresetAvatarKey,
  resolveUniquePresetName,
} from '@/utils/derivedVoicePreset';
import {
  formatAudioDuration,
  formatFileSize,
} from '@/utils/audioDuration';
import { formatDurationLimitLabel } from '@/utils/formatDurationLimit';
import { useSupportedFormatsLabel } from '@/hooks/useSupportedFormatsLabel';
import { getPresetAvatarInitial } from '@/utils/presetAppearance';
import {
  selectionUsesAiProcessing,
  toggleAdvancedEffectSelection,
  toggleAiEffectSelection,
  toggleBuiltinPresetSelection,
  toggleCustomPresetSelection,
} from '@/utils/presetSelection';
import { resolveConversionSummary } from '@/utils/conversionSummary';
import {
  areAudioEffectsEqual,
} from '@/utils/voiceStudioEffects';
import {
  getBuiltinBaseline,
  resolveProcessingEffects,
} from '@/utils/resolveProcessingEffects';
import {
  formatCombinedEffectDescription,
  getEffectRefAccentColor,
  hasMultipleAiInChain,
} from '@/utils/effectChain';
import { logger } from '@/utils/logger';

async function removeStoredFiles(
  file: SelectedAudioFile | null,
): Promise<void> {
  if (file) {
    await deleteStoredAudioFile(file.uri).catch(() => undefined);
  }
}

async function removeStoredOutputUris(uris: string[]): Promise<void> {
  for (const uri of uris) {
    await deleteStoredAudioFile(uri).catch(() => undefined);
  }
}

/**
 * Plan duration-limit dialog (import/record) — once per app process, not every tap.
 */
let sourceDurationLimitNoticeShownThisLaunch = false;

/**
 * Yellow/red AI status warning before Convert — once per app process.
 */
let aiStatusConvertWarningShownThisLaunch = false;

type PlaybackStatus = 'idle' | 'playing' | 'paused';

type PlaybackModalState = {
  source: 'raw' | 'processed';
  uri: string;
  fileName: string;
  durationSec: number | null;
};

export function useVoiceStudio() {
  const { t, locale } = useTranslation();
  const { isReady } = useDatabase();
  const { isOnline } = useNetworkConnectivity();
  const { showOfflineAlert, showErrorAlert, showWarningAlert } = useAppAlert();
  const { refreshStatusAfterAiFailure, status: aiServiceStatus } =
    useAiServiceStatus();
  const { refreshCount: refreshRecordingsCount } = useProcessedRecordingsCount();
  const {
    accountPlan,
    isPremium,
    balance,
    creditsPerStartedMinute,
    spendCredits,
    refreshBalance,
  } = useCredits();
  const aiMaxDurationSec = useMemo(
    () => resolveAiMaxDurationSec(accountPlan),
    [accountPlan],
  );
  const planMaxDurationSec = useMemo(
    () => resolvePlanMaxDurationSec(accountPlan),
    [accountPlan],
  );
  const affordableAiSeconds = useMemo(
    () =>
      calculateAiSecondsAffordableFromCredits(
        balance,
        creditsPerStartedMinute,
      ),
    [balance, creditsPerStartedMinute],
  );
  const effectiveAiMaxDurationSec = useMemo(
    () => resolveEffectiveAiMaxDurationSec(aiMaxDurationSec, affordableAiSeconds),
    [affordableAiSeconds, aiMaxDurationSec],
  );

  const [audioFile, setAudioFile] = useState<SelectedAudioFile | null>(null);
  const [processedHistory, setProcessedHistory] = useState<
    ProcessedHistoryEntry[]
  >([]);
  const [processedHistoryDeletePending, setProcessedHistoryDeletePending] =
    useState<ProcessedHistoryEntry | null>(null);
  const [isDeletingProcessedHistory, setIsDeletingProcessedHistory] =
    useState(false);
  const [exportingHistoryId, setExportingHistoryId] = useState<string | null>(
    null,
  );
  const [sharingHistoryId, setSharingHistoryId] = useState<string | null>(null);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<{
    fileName: string;
  } | null>(null);
  const [aiConvertCreditsNotice, setAiConvertCreditsNotice] = useState<{
    cost: number;
    balance: number;
  } | null>(null);
  const [presetUpdatePending, setPresetUpdatePending] = useState(false);
  const [presetEditorSaveError, setPresetEditorSaveError] = useState<
    string | null
  >(null);
  const [selection, setSelection] = useState<PresetSelection>({ kind: 'none' });
  const [effects, setEffects] = useState<AudioEffects>(() => ({
    ...NEUTRAL_AUDIO_EFFECTS,
  }));
  const [customPresets, setCustomPresets] = useState<SavedVoicePreset[]>([]);

  const selectedCustomPresetForAi = useMemo(() => {
    if (selection.kind !== 'custom') {
      return null;
    }

    return customPresets.find(preset => preset.id === selection.id) ?? null;
  }, [customPresets, selection]);

  const usesAiProcessing = useMemo(
    () => selectionUsesAiProcessing(selection, selectedCustomPresetForAi),
    [selectedCustomPresetForAi, selection],
  );

  const recordingMaxDurationSec = useMemo(() => {
    if (!usesAiProcessing) {
      return planMaxDurationSec;
    }

    return effectiveAiMaxDurationSec;
  }, [effectiveAiMaxDurationSec, planMaxDurationSec, usesAiProcessing]);

  const aiUsageEstimate = useMemo(() => {
    if (!usesAiProcessing) {
      return null;
    }

    const billableSeconds = resolveAiBillableDurationSec(
      audioFile?.durationSec ?? null,
      effectiveAiMaxDurationSec,
    );
    const creditCost = calculateCreditsForAiDurationSec(
      billableSeconds,
      creditsPerStartedMinute,
    );

    return {
      affordableSeconds: effectiveAiMaxDurationSec,
      billableSeconds,
      creditCost,
      canAfford: effectiveAiMaxDurationSec > 0 && balance >= creditCost,
    };
  }, [
    audioFile?.durationSec,
    balance,
    creditsPerStartedMinute,
    effectiveAiMaxDurationSec,
    usesAiProcessing,
  ]);

  const [presetEditorVisible, setPresetEditorVisible] = useState(false);
  const [combineEffectsModalVisible, setCombineEffectsModalVisible] =
    useState(false);
  const [combineEffectsSaveError, setCombineEffectsSaveError] = useState<
    string | null
  >(null);
  const [presetEditorMode, setPresetEditorMode] =
    useState<PresetEditorMode>('create');
  const [presetEditorDraftEffects, setPresetEditorDraftEffects] =
    useState<AudioEffects>(() => ({ ...NEUTRAL_AUDIO_EFFECTS }));
  const [presetEditorBaseEffects, setPresetEditorBaseEffects] =
    useState<AudioEffects>(() => ({ ...NEUTRAL_AUDIO_EFFECTS }));
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetPendingDelete, setPresetPendingDelete] =
    useState<SavedVoicePreset | null>(null);
  const [isDeletingPreset, setIsDeletingPreset] = useState(false);
  const [fileDeletePending, setFileDeletePending] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [sourceDurationLimitNotice, setSourceDurationLimitNotice] = useState<
    'import' | 'record' | null
  >(null);
  const [aiStatusConvertWarningVisible, setAiStatusConvertWarningVisible] =
    useState(false);
  const [playbackModal, setPlaybackModal] =
    useState<PlaybackModalState | null>(null);
  const [playbackStatus, setPlaybackStatus] =
    useState<PlaybackStatus>('idle');
  const [playbackProgressSec, setPlaybackProgressSec] = useState(0);
  const [playbackDurationSec, setPlaybackDurationSec] = useState<number | null>(
    null,
  );
  const [playbackWaveformBars, setPlaybackWaveformBars] = useState<
    number[] | null
  >(null);
  const [isPlaybackWaveformLoading, setIsPlaybackWaveformLoading] =
    useState(false);
  const waveformRequestIdRef = useRef(0);
  const [recordingExpanded, setRecordingExpanded] = useState(false);
  const [recordingModalVisible, setRecordingModalVisible] = useState(false);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [recordingElapsedSec, setRecordingElapsedSec] = useState(0);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const [isFinalizingRecording, setIsFinalizingRecording] = useState(false);
  const recordingSessionRef = useRef<AudioRecordingSession | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [presetSuccessNotice, setPresetSuccessNotice] = useState<{
    kind: 'created' | 'updated';
    name: string;
  } | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isPreparingSource, setIsPreparingSource] = useState(false);
  const isLoadingFileRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] =
    useState<ProcessingStage>('preparing');
  const [processingProgress, setProcessingProgress] = useState(0);
  const processingAbortRef = useRef<AbortController | null>(null);
  const [isCancellingProcessing, setIsCancellingProcessing] = useState(false);
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);

  useEffect(() => {
    if (
      selection.kind === 'ai' &&
      CLOUD_AI_EFFECT_IDS.has(selection.id) &&
      !isAiEffectProviderConfigured(selection.id)
    ) {
      setSelection({ kind: 'none' });
    }
  }, [selection]);

  useEffect(() => {
    if (isOnline) {
      return;
    }

    if (selection.kind === 'ai') {
      setSelection({ kind: 'none' });
      return;
    }

    if (selection.kind === 'custom') {
      const preset = customPresets.find(item => item.id === selection.id);
      if (preset && selectionUsesAiProcessing(selection, preset)) {
        setSelection({ kind: 'none' });
      }
    }
  }, [customPresets, isOnline, selection]);

  const showAiOfflineAlert = useCallback(() => {
    showOfflineAlert();
  }, [showOfflineAlert]);

  useEffect(() => {
    return () => {
      stopAudioPlayback().catch(() => undefined);
    };
  }, []);

  const clearRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const resetRecordingUi = useCallback(() => {
    clearRecordingTimer();
    setIsRecordingActive(false);
    setRecordingElapsedSec(0);
    setRecordingLevel(0);
    setIsFinalizingRecording(false);
    setRecordingModalVisible(false);
    recordingSessionRef.current = null;
  }, [clearRecordingTimer]);

  useEffect(() => {
    return () => {
      clearRecordingTimer();
      recordingSessionRef.current?.cancel().catch(() => undefined);
    };
  }, [clearRecordingTimer]);

  const applyImportedAudioFile = useCallback(
    async (file: SelectedAudioFile) => {
      const previousFile = audioFile;
      await stopAudioPlayback().catch(() => undefined);
      await removeStoredFiles(previousFile);
      setPlaybackModal(null);
      setPlaybackStatus('idle');
      setPlaybackProgressSec(0);
      setPlaybackDurationSec(null);

      setIsPreparingSource(true);
      try {
        const prepared = await prepareSourceAudio(file, {
          maxDurationSec: planMaxDurationSec,
          maxSizeMb: resolveImportMaxSizeMb(env.maxUploadSizeMb),
        });
        setAudioFile(prepared.file);
        if (prepared.trimmed) {
          showWarningAlert(
            t('voiceStudio.sourceTrimmedTitle'),
            t('voiceStudio.sourceTrimmedMessage', {
              limit: formatAudioDuration(planMaxDurationSec),
              original: formatAudioDuration(prepared.originalDurationSec ?? 0),
            }),
          );
        }
      } finally {
        setIsPreparingSource(false);
      }
    },
    [audioFile, planMaxDurationSec, showWarningAlert, t]);

  const showRecordingFailure = useCallback(
    (
      reason:
        | 'unsupported_format'
        | 'file_too_large'
        | 'duration_exceeded'
        | 'copy_failed'
        | 'stat_failed'
        | 'empty_recording'
        | 'stop_failed'
        | 'start_failed',
      detail?: string,
    ) => {
      if (reason === 'unsupported_format') {
        showWarningAlert(
          t('voiceStudio.unsupportedFormatTitle'),
          t('voiceStudio.unsupportedFormatMessage', {
            formats: supportedFormatsLabel,
          }),
        );
        return;
      }

      if (reason === 'file_too_large') {
        showWarningAlert(
          t('voiceStudio.fileTooLargeTitle'),
          t('voiceStudio.fileTooLargeMessage', {
            size: resolveImportMaxSizeMb(env.maxUploadSizeMb),
          }),
        );
        return;
      }

      if (reason === 'duration_exceeded') {
        showWarningAlert(
          t('voiceStudio.durationExceededTitle'),
          t('voiceStudio.recordingDurationExceededMessage', {
            maxDuration:
              accountPlan === 'free'
                ? t('common.durationLimitSeconds', {
                    count: formatAiDurationSeconds(planMaxDurationSec, locale),
                  })
                : formatDurationLimitLabel(planMaxDurationSec, locale, t),
          }),
        );
        return;
      }

      const debugSuffix =
        env.debugMode && detail
          ? `\n\n${reason}: ${detail}`
          : env.debugMode
            ? `\n\n${reason}`
            : '';

      showErrorAlert(
        t('voiceStudio.recordingFailedTitle'),
        t('voiceStudio.recordingFailedMessage') + debugSuffix,
      );
    },
    [accountPlan, planMaxDurationSec, showWarningAlert, supportedFormatsLabel, t, locale, showErrorAlert]);

  useEffect(() => {
    if (isProcessing || isCancellingProcessing) {
      setIsInteractionLocked(true);
      return;
    }

    // Brief lock after processing ends so a cancel tap does not hit sliders underneath.
    const unlockTimer = setTimeout(() => {
      setIsInteractionLocked(false);
    }, 500);

    return () => clearTimeout(unlockTimer);
  }, [isCancellingProcessing, isProcessing]);

  useEffect(() => {
    if (!playbackModal || playbackStatus !== 'playing') {
      return;
    }

    const intervalId = setInterval(() => {
      getAudioPlaybackInfo()
        .then(info => {
          if (!info) {
            setPlaybackProgressSec(current => {
              if (!playbackDurationSec) {
                return current + 0.5;
              }
              return Math.min(playbackDurationSec, current + 0.5);
            });
            return;
          }

          setPlaybackProgressSec(info.currentTime);
          if (info.duration > 0) {
            setPlaybackDurationSec(info.duration);
          }
          if (info.duration > 0 && info.currentTime >= info.duration) {
            setPlaybackStatus('idle');
          }
        })
        .catch(() => undefined);
    }, 500);

    return () => clearInterval(intervalId);
  }, [playbackDurationSec, playbackModal, playbackStatus]);

  const refreshCustomPresets = useCallback(async () => {
    const presets = await listVoicePresets();
    setCustomPresets(presets);
    return presets;
  }, []);

  const refreshProcessedHistory = useCallback(async () => {
    const entries = await listProcessedHistory();
    setProcessedHistory(entries);
    await refreshRecordingsCount().catch(() => undefined);
    return entries;
  }, [refreshRecordingsCount]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    refreshCustomPresets().catch(() => {
      // Preset list is optional on first paint; save flow surfaces DB errors.
    });
    refreshProcessedHistory().catch(() => {
      // History is optional on first paint; actions surface DB errors.
    });
  }, [isReady, refreshCustomPresets, refreshProcessedHistory]);

  const hasProcessedHistory = processedHistory.length > 0;

  const recentProcessedPreview = useMemo(
    () => processedHistory.slice(0, RECENT_PROCESSED_PREVIEW_LIMIT),
    [processedHistory],
  );

  const hasMoreProcessedHistory =
    processedHistory.length > RECENT_PROCESSED_PREVIEW_LIMIT;

  const selectedBuiltinPreset = useMemo(() => {
    if (selection.kind !== 'builtin') {
      return null;
    }
    return VOICE_PRESETS.find(preset => preset.id === selection.id) ?? null;
  }, [selection]);

  const selectedCustomPreset = useMemo(() => {
    if (selection.kind !== 'custom') {
      return null;
    }
    return customPresets.find(preset => preset.id === selection.id) ?? null;
  }, [customPresets, selection]);

  const selectedAdvancedEffect = useMemo(() => {
    if (selection.kind !== 'advanced') {
      return null;
    }
    return ADVANCED_EFFECTS.find(effect => effect.id === selection.id) ?? null;
  }, [selection]);

  const selectedAiEffect = useMemo(() => {
    if (selection.kind !== 'ai') {
      return null;
    }
    return findAiEffect(selection.id) ?? null;
  }, [selection]);

  const conversionSummary = useMemo(
    () =>
      resolveConversionSummary({
        selection,
        customPreset: selectedCustomPreset,
        builtinLabel: selectedBuiltinPreset
          ? t(selectedBuiltinPreset.labelKey)
          : undefined,
        advancedLabel: selectedAdvancedEffect
          ? t(selectedAdvancedEffect.labelKey)
          : undefined,
        aiLabel: selectedAiEffect ? t(selectedAiEffect.labelKey) : undefined,
        customMixLabel: t('voiceStudio.customMix'),
      }),
    [
      selectedAdvancedEffect,
      selectedAiEffect,
      selectedBuiltinPreset,
      selectedCustomPreset,
      selection,
      t,
    ],
  );

  const presetEditorTarget = useMemo((): PresetEditorTarget => {
    if (selection.kind === 'builtin' && selectedBuiltinPreset) {
      return {
        kind: 'builtin',
        id: selection.id,
        label: t(selectedBuiltinPreset.labelKey),
      };
    }

    if (selection.kind === 'custom' && selectedCustomPreset) {
      return { kind: 'custom', preset: selectedCustomPreset };
    }

    return { kind: 'none' };
  }, [selectedBuiltinPreset, selectedCustomPreset, selection, t]);

  const presetEditorCanUpdate = useMemo(() => {
    if (presetEditorMode !== 'edit' || selection.kind !== 'custom') {
      return false;
    }
    return !areAudioEffectsEqual(
      presetEditorDraftEffects,
      presetEditorBaseEffects,
    );
  }, [presetEditorBaseEffects, presetEditorDraftEffects, presetEditorMode, selection.kind]);

  const presetEditorEffectKeys = useMemo((): readonly AudioEffectKey[] => {
    if (
      presetEditorMode === 'edit' &&
      selection.kind === 'custom' &&
      selectedCustomPreset?.source
    ) {
      return ['pitch'];
    }

    return AUDIO_EFFECT_KEYS;
  }, [presetEditorMode, selectedCustomPreset, selection.kind]);

  const pitchBaseline = useMemo(() => {
    if (selection.kind === 'builtin') {
      return getBuiltinBaseline(selection.id).pitch;
    }

    if (selection.kind === 'advanced') {
      return NEUTRAL_AUDIO_EFFECTS.pitch;
    }

    if (selection.kind === 'custom' && selectedCustomPreset) {
      return selectedCustomPreset.effects.pitch;
    }

    return NEUTRAL_AUDIO_EFFECTS.pitch;
  }, [selectedCustomPreset, selection]);

  const hasPitchTweak = effects.pitch !== pitchBaseline;

  const fileSummary = useMemo(() => {
    if (!audioFile) {
      return null;
    }

    const durationLabel =
      audioFile.durationSec === null
        ? t('voiceStudio.durationUnknown')
        : formatAudioDuration(audioFile.durationSec);

    return {
      name: audioFile.name,
      meta: `${durationLabel} · ${formatFileSize(audioFile.sizeBytes)}`,
      exceedsAiLimit:
        usesAiProcessing &&
        effectiveAiMaxDurationSec > 0 &&
        audioFile.durationSec !== null &&
        audioFile.durationSec > effectiveAiMaxDurationSec,
      exceedsPlanLimit:
        planMaxDurationSec > 0 &&
        audioFile.durationSec !== null &&
        audioFile.durationSec > planMaxDurationSec,
    };
  }, [
    audioFile,
    effectiveAiMaxDurationSec,
    planMaxDurationSec,
    t,
    usesAiProcessing,
  ]);

  const supportedFormatsLabel = useSupportedFormatsLabel();

  const resolveEffectRefLabel = useCallback(
    (ref: SavedVoicePresetSource) => {
      if (ref.tier === 'basic') {
        const preset = VOICE_PRESETS.find(item => item.id === ref.presetId);
        return preset ? t(preset.labelKey) : ref.presetId;
      }

      if (ref.tier === 'advanced') {
        const effect = ADVANCED_EFFECTS.find(item => item.id === ref.effectId);
        return effect ? t(effect.labelKey) : ref.effectId;
      }

      const effect = findAiEffect(ref.effectId);
      return effect ? t(effect.labelKey) : ref.effectId;
    },
    [t]);

  const combineEffectGroups = useMemo((): CombineEffectOptionGroup[] => {
    return [
      {
        title: t('voiceStudio.basicEffects'),
        options: VOICE_PRESETS.map(preset => ({
          ref: { tier: 'basic', presetId: preset.id },
          label: t(preset.labelKey),
        })),
      },
      {
        title: t('voiceStudio.advancedEffects'),
        options: ADVANCED_EFFECTS.map(effect => ({
          ref: { tier: 'advanced', effectId: effect.id },
          label: t(effect.labelKey),
        })),
      },
      {
        title: t('voiceStudio.aiEffects'),
        options: AI_EFFECTS.map(effect => ({
          ref: { tier: 'ai', effectId: effect.id },
          label: t(effect.labelKey),
        })),
      },
    ];
  }, [t]);

  const getCombinedPresetDescription = useCallback(
    (preset: SavedVoicePreset) => {
      if (!preset.effectChain) {
        return undefined;
      }

      return formatCombinedEffectDescription(
        preset.effectChain,
        resolveEffectRefLabel,
      );
    },
    [resolveEffectRefLabel]);

  const selectBuiltinPreset = useCallback((presetId: VoicePresetId) => {
    const nextSelection = toggleBuiltinPresetSelection(selection, presetId);
    setSelection(nextSelection);

    if (nextSelection.kind === 'builtin') {
      setEffects({ ...getBuiltinBaseline(nextSelection.id) });
    }
  }, [selection]);

  const selectAdvancedEffect = useCallback((effectId: AdvancedEffectId) => {
    const nextSelection = toggleAdvancedEffectSelection(selection, effectId);
    setSelection(nextSelection);

    if (nextSelection.kind === 'advanced') {
      setEffects(current => ({
        ...current,
        pitch: NEUTRAL_AUDIO_EFFECTS.pitch,
      }));
    }
  }, [selection]);

  const selectAiEffect = useCallback((effectId: AiEffectId) => {
    if (CLOUD_AI_EFFECT_IDS.has(effectId) && !isAiEffectProviderConfigured(effectId)) {
      return;
    }

    if (!isOnline) {
      showAiOfflineAlert();
      return;
    }

    const nextSelection = toggleAiEffectSelection(selection, effectId);
    setSelection(nextSelection);

    if (nextSelection.kind === 'ai') {
      setEffects(current => ({
        ...current,
        pitch: NEUTRAL_AUDIO_EFFECTS.pitch,
      }));
    }
  }, [isOnline, selection, showAiOfflineAlert]);

  const setEffectValue = useCallback((key: AudioEffectKey, value: number) => {
    setEffects(current => ({ ...current, [key]: value }));
  }, []);

  const selectCustomPreset = useCallback((preset: SavedVoicePreset) => {
    const nextSelection = toggleCustomPresetSelection(selection, preset.id);

    if (
      nextSelection.kind === 'custom' &&
      !isOnline &&
      selectionUsesAiProcessing(nextSelection, preset)
    ) {
      showAiOfflineAlert();
      return;
    }

    setSelection(nextSelection);

    if (nextSelection.kind === 'custom') {
      setEffects({ ...NEUTRAL_AUDIO_EFFECTS, ...preset.effects });
    }
  }, [isOnline, selection, showAiOfflineAlert]);

  const dismissPresetSuccessNotice = useCallback(() => {
    setPresetSuccessNotice(null);
  }, []);

  const closePresetEditor = useCallback(() => {
    if (!isSavingPreset) {
      setPresetEditorVisible(false);
      setPresetEditorSaveError(null);
      setPresetUpdatePending(false);
    }
  }, [isSavingPreset]);

  const openCreatePresetEditor = useCallback(() => {
    setPresetEditorSaveError(null);
    setPresetEditorDraftEffects({ ...effects });
    setPresetEditorBaseEffects({ ...effects });
    setPresetEditorMode('create');
    setPresetEditorVisible(true);
  }, [effects]);

  const openCombineEffectsModal = useCallback(() => {
    if (!isPremium) {
      showWarningAlert(
        t('voiceStudio.combineEffectsPremiumTitle'),
        t('voiceStudio.combineEffectsPremiumMessage'),
      );
      return;
    }

    setCombineEffectsSaveError(null);
    setCombineEffectsModalVisible(true);
  }, [isPremium, showWarningAlert, t]);

  const closeCombineEffectsModal = useCallback(() => {
    if (!isSavingPreset) {
      setCombineEffectsModalVisible(false);
      setCombineEffectsSaveError(null);
    }
  }, [isSavingPreset]);

  const clearCombineEffectsSaveError = useCallback(() => {
    setCombineEffectsSaveError(null);
  }, []);

  const createCombinedPreset = useCallback(
    async (
      name: string,
      chain: [SavedVoicePresetSource, SavedVoicePresetSource],
    ) => {
      if (!isReady) {
        showErrorAlert(t('voiceStudio.savePresetFailedTitle'));
        return;
      }

      if (!isOnline && chain.some(ref => ref.tier === 'ai')) {
        showAiOfflineAlert();
        return;
      }

      if (hasMultipleAiInChain(chain)) {
        setCombineEffectsSaveError(
          t('voiceStudio.combineEffectsDoubleAiError'),
        );
        return;
      }

      if (!isPremium) {
        setCombineEffectsSaveError(t('voiceStudio.combineEffectsPremiumMessage'));
        return;
      }

      if (hasDuplicatePresetName(customPresets, name)) {
        setCombineEffectsSaveError(t('voiceStudio.savePresetDuplicateMessage'));
        return;
      }

      setCombineEffectsSaveError(null);
      setIsSavingPreset(true);
      try {
        const saved = await createVoicePreset(name, NEUTRAL_AUDIO_EFFECTS, {
          effectChain: chain,
          accentColor: getEffectRefAccentColor(chain[0]),
        });
        const presets = await refreshCustomPresets();
        const created = presets.find(preset => preset.id === saved.id) ?? saved;
        commitPresetSnapshot(created.effects, {
          kind: 'custom',
          id: created.id,
        });
        setCombineEffectsModalVisible(false);
        setPresetSuccessNotice({ kind: 'created', name: created.name });
      } catch {
        showErrorAlert(
          t('voiceStudio.savePresetFailedTitle'),
          t('voiceStudio.savePresetFailedMessage'),
        );
      } finally {
        setIsSavingPreset(false);
      }
    },
    [
      commitPresetSnapshot,
      customPresets,
      isOnline,
      isPremium,
      isReady,
      refreshCustomPresets,
      showAiOfflineAlert,
      t,
      showErrorAlert,
    ],
  );

  const openEditPresetEditor = useCallback(() => {
    if (selection.kind !== 'custom' || !selectedCustomPreset) {
      return;
    }

    setPresetEditorDraftEffects({ ...selectedCustomPreset.effects });
    setPresetEditorBaseEffects({ ...selectedCustomPreset.effects });
    setPresetEditorSaveError(null);
    setPresetEditorMode('edit');
    setPresetEditorVisible(true);
  }, [selectedCustomPreset, selection.kind]);

  const setPresetDraftEffectValue = useCallback(
    (key: AudioEffectKey, value: number) => {
      setPresetEditorDraftEffects(current => ({ ...current, [key]: value }));
    },
    []);

  const requestDeletePreset = useCallback((preset: SavedVoicePreset) => {
    setPresetPendingDelete(preset);
  }, []);

  const requestDeleteSelectedPreset = useCallback(() => {
    if (selectedCustomPreset) {
      requestDeletePreset(selectedCustomPreset);
    }
  }, [requestDeletePreset, selectedCustomPreset]);

  const commitPresetSnapshot = useCallback(
    (nextEffects: AudioEffects, nextSelection: PresetSelection) => {
      setEffects({ ...nextEffects });
      setSelection(nextSelection);
    },
    []);

  const createPreset = useCallback(
    async (name: string) => {
      if (!isReady) {
        showErrorAlert(t('voiceStudio.savePresetFailedTitle'));
        return;
      }

      if (hasDuplicatePresetName(customPresets, name)) {
        setPresetEditorSaveError(t('voiceStudio.savePresetDuplicateMessage'));
        return;
      }

      setPresetEditorSaveError(null);
      setIsSavingPreset(true);
      try {
        const saved = await createVoicePreset(name, presetEditorDraftEffects);
        const presets = await refreshCustomPresets();
        const created = presets.find(preset => preset.id === saved.id) ?? saved;
        commitPresetSnapshot(created.effects, {
          kind: 'custom',
          id: created.id,
        });
        setPresetEditorVisible(false);
        setPresetSuccessNotice({ kind: 'created', name: created.name });
      } catch {
        showErrorAlert(
          t('voiceStudio.savePresetFailedTitle'),
          t('voiceStudio.savePresetFailedMessage'),
        );
      } finally {
        setIsSavingPreset(false);
      }
    },
    [
      commitPresetSnapshot,
      customPresets,
      isReady,
      presetEditorDraftEffects,
      refreshCustomPresets,
      t,
      showErrorAlert,
    ],
  );

  const updateSelectedPreset = useCallback(async () => {
    if (selection.kind !== 'custom' || !selectedCustomPreset || !isReady) {
      return;
    }

    setIsSavingPreset(true);
    try {
      const updated = await updateVoicePreset(
        selectedCustomPreset.id,
        presetEditorDraftEffects,
      );
      await refreshCustomPresets();
      commitPresetSnapshot(updated.effects, {
        kind: 'custom',
        id: updated.id,
      });
      setPresetEditorVisible(false);
      setPresetSuccessNotice({ kind: 'updated', name: updated.name });
    } catch {
      showErrorAlert(
        t('voiceStudio.savePresetFailedTitle'),
        t('voiceStudio.savePresetFailedMessage'),
      );
    } finally {
      setIsSavingPreset(false);
    }
  }, [commitPresetSnapshot, isReady, presetEditorDraftEffects, refreshCustomPresets, selectedCustomPreset, selection.kind, t, showErrorAlert]);

  const savePresetAsNew = useCallback(
    async (name: string) => {
      if (!isReady) {
        showErrorAlert(t('voiceStudio.savePresetFailedTitle'));
        return;
      }

      if (hasDuplicatePresetName(customPresets, name)) {
        setPresetEditorSaveError(t('voiceStudio.savePresetDuplicateMessage'));
        return;
      }

      setPresetEditorSaveError(null);
      setIsSavingPreset(true);
      try {
        const saved = await createVoicePreset(name, presetEditorDraftEffects);
        const presets = await refreshCustomPresets();
        const created = presets.find(preset => preset.id === saved.id) ?? saved;
        commitPresetSnapshot(created.effects, {
          kind: 'custom',
          id: created.id,
        });
        setPresetEditorVisible(false);
        setPresetSuccessNotice({ kind: 'created', name: created.name });
      } catch {
        showErrorAlert(
          t('voiceStudio.savePresetFailedTitle'),
          t('voiceStudio.savePresetFailedMessage'),
        );
      } finally {
        setIsSavingPreset(false);
      }
    },
    [
      commitPresetSnapshot,
      customPresets,
      isReady,
      presetEditorDraftEffects,
      refreshCustomPresets,
      t,
      showErrorAlert,
    ],
  );

  const requestPresetUpdate = useCallback(() => {
    if (selection.kind === 'custom' && selectedCustomPreset) {
      setPresetUpdatePending(true);
    }
  }, [selectedCustomPreset, selection.kind]);

  const cancelPresetUpdate = useCallback(() => {
    if (!isSavingPreset) {
      setPresetUpdatePending(false);
    }
  }, [isSavingPreset]);

  const confirmPresetUpdate = useCallback(async () => {
    try {
      await updateSelectedPreset();
    } finally {
      setPresetUpdatePending(false);
    }
  }, [updateSelectedPreset]);

  const cancelDeletePreset = useCallback(() => {
    if (!isDeletingPreset) {
      setPresetPendingDelete(null);
    }
  }, [isDeletingPreset]);

  const confirmDeletePreset = useCallback(async () => {
    if (!presetPendingDelete || !isReady) {
      return;
    }

    const deletingId = presetPendingDelete.id;
    setIsDeletingPreset(true);
    try {
      await deleteVoicePreset(deletingId);
      await refreshCustomPresets();

      if (selection.kind === 'custom' && selection.id === deletingId) {
        setSelection({ kind: 'none' });
        setEffects({ ...NEUTRAL_AUDIO_EFFECTS });
      }

      setPresetPendingDelete(null);
    } catch {
      showErrorAlert(
        t('voiceStudio.deletePresetFailedTitle'),
        t('voiceStudio.deletePresetFailedMessage'),
      );
    } finally {
      setIsDeletingPreset(false);
    }
  }, [isReady, presetPendingDelete, refreshCustomPresets, selection, t, showErrorAlert]);

  const loadFile = useCallback(async () => {
    if (isLoadingFileRef.current || isInteractionLocked) {
      logger.debug('VoiceStudio', 'loadFile ignored while UI is busy');
      return;
    }

    isLoadingFileRef.current = true;
    setIsLoadingFile(true);
    logger.debug('VoiceStudio', 'loadFile tapped');

    const permission = await ensurePermission('storage');
    if (!permission.granted) {
      isLoadingFileRef.current = false;
      setIsLoadingFile(false);
      showPermissionDeniedAlert(
        t('permissions.storageDeniedTitle'),
        t('permissions.storageDeniedMessage'),
      );
      return;
    }

    try {
      const result = await pickAudioFile({
        supportedFormats: env.supportedAudioFormats,
        maxSizeMb: resolveImportMaxSizeMb(env.maxUploadSizeMb),
      });

      if (result.ok) {
        logger.debug('VoiceStudio', 'loadFile success', result.file);
        await applyImportedAudioFile(result.file);
        return;
      }

      if (result.reason === 'cancelled') {
        logger.debug('VoiceStudio', 'loadFile cancelled');
        return;
      }

      logger.warn('VoiceStudio', 'loadFile failed', {
        reason: result.reason,
        detail: result.detail,
      });

      if (result.reason === 'unsupported_format') {
        showErrorAlert(
          t('voiceStudio.unsupportedFormatTitle'),
          t('voiceStudio.unsupportedFormatMessage', {
            formats: supportedFormatsLabel,
          }) +
            (env.debugMode && result.detail ? `\n\n${result.detail}` : ''),
        );
        return;
      }

      if (result.reason === 'file_too_large') {
        showErrorAlert(
          t('voiceStudio.fileTooLargeTitle'),
          t('voiceStudio.fileTooLargeMessage', {
            size: resolveImportMaxSizeMb(env.maxUploadSizeMb),
          }),
        );
        return;
      }

      const debugSuffix =
        env.debugMode && result.detail
          ? `\n\n${result.reason}: ${result.detail}`
          : env.debugMode
            ? `\n\n${result.reason}`
            : '';

      showErrorAlert(
        t('voiceStudio.importFailedTitle'),
        t('voiceStudio.importFailedMessage') + debugSuffix,
      );
    } finally {
      isLoadingFileRef.current = false;
      setIsLoadingFile(false);
    }
  }, [applyImportedAudioFile, isInteractionLocked, supportedFormatsLabel, t, showErrorAlert]);

  const requestLoadFile = useCallback(() => {
    if (isLoadingFileRef.current || isInteractionLocked) {
      return;
    }
    if (sourceDurationLimitNoticeShownThisLaunch) {
      loadFile().catch(() => undefined);
      return;
    }
    setSourceDurationLimitNotice('import');
  }, [isInteractionLocked, loadFile]);

  const openRecordingModal = useCallback(async () => {
    if (isInteractionLocked || isLoadingFileRef.current || isFinalizingRecording) {
      return;
    }

    const permission = await ensurePermission('microphone');
    if (!permission.granted) {
      showPermissionDeniedAlert(
        t('permissions.microphoneDeniedTitle'),
        t('permissions.microphoneDeniedMessage'),
      );
      return;
    }

    recordingSessionRef.current = new AudioRecordingSession();
    setRecordingElapsedSec(0);
    setRecordingLevel(0);
    setIsRecordingActive(false);
    setIsFinalizingRecording(false);
    setRecordingModalVisible(true);
  }, [isFinalizingRecording, isInteractionLocked, t]);

  const requestOpenRecordingModal = useCallback(() => {
    if (isInteractionLocked || isLoadingFileRef.current || isFinalizingRecording) {
      return;
    }

    if (usesAiProcessing && effectiveAiMaxDurationSec <= 0) {
      showWarningAlert(
        t('credits.insufficientTitle'),
        t('voiceStudio.recordingAiCreditsBlockedMessage'),
      );
      return;
    }

    if (sourceDurationLimitNoticeShownThisLaunch) {
      openRecordingModal().catch(() => undefined);
      return;
    }

    setSourceDurationLimitNotice('record');
  }, [
    effectiveAiMaxDurationSec,
    isFinalizingRecording,
    isInteractionLocked,
    openRecordingModal,
    showWarningAlert,
    t,
    usesAiProcessing,
  ]);

  const dismissSourceDurationLimitNotice = useCallback(() => {
    sourceDurationLimitNoticeShownThisLaunch = true;
    setSourceDurationLimitNotice(null);
  }, []);

  const cancelSourceDurationLimitNotice = useCallback(() => {
    dismissSourceDurationLimitNotice();
  }, [dismissSourceDurationLimitNotice]);

  const confirmSourceDurationLimitNotice = useCallback(() => {
    const next = sourceDurationLimitNotice;
    dismissSourceDurationLimitNotice();
    if (next === 'import') {
      loadFile().catch(() => undefined);
      return;
    }
    if (next === 'record') {
      openRecordingModal().catch(() => undefined);
    }
  }, [
    dismissSourceDurationLimitNotice,
    loadFile,
    openRecordingModal,
    sourceDurationLimitNotice,
  ]);

  const startRecording = useCallback(async () => {
    const session = recordingSessionRef.current;
    if (!session || isFinalizingRecording) {
      return;
    }

    if (usesAiProcessing && recordingMaxDurationSec <= 0) {
      showWarningAlert(
        t('credits.insufficientTitle'),
        t('voiceStudio.recordingAiCreditsBlockedMessage'),
      );
      return;
    }

    const startResult = await session.start();
    if (!startResult.ok) {
      showRecordingFailure('start_failed', startResult.detail);
      return;
    }

    session.setLevelListener(level => {
      setRecordingLevel(level);
    });

    setIsRecordingActive(true);
    setRecordingElapsedSec(0);
    setRecordingLevel(0);
    clearRecordingTimer();
    recordingTimerRef.current = setInterval(() => {
      const elapsed = session.getCurrentDurationSec();
      setRecordingElapsedSec(elapsed);

      if (elapsed >= recordingMaxDurationSec) {
        clearRecordingTimer();
      }
    }, 250);
  }, [
    clearRecordingTimer,
    isFinalizingRecording,
    recordingMaxDurationSec,
    showRecordingFailure,
    showWarningAlert,
    t,
    usesAiProcessing,
  ]);

  const finishRecording = useCallback(async () => {
    const session = recordingSessionRef.current;
    if (!session || isFinalizingRecording) {
      return;
    }

    clearRecordingTimer();
    recordingSessionRef.current?.setLevelListener(null);
    setIsRecordingActive(false);
    setRecordingLevel(0);
    setIsFinalizingRecording(true);

    try {
      const result = await session.stopAndFinalize({
        supportedFormats: env.supportedAudioFormats,
        maxSizeMb: resolveImportMaxSizeMb(env.maxUploadSizeMb),
        maxDurationSec: recordingMaxDurationSec,
      });

      if (result.ok) {
        logger.debug('VoiceStudio', 'recording success', result.file);
        await applyImportedAudioFile(result.file);
        resetRecordingUi();
        return;
      }

      logger.warn('VoiceStudio', 'recording failed', {
        reason: result.reason,
        detail: result.detail,
      });
      showRecordingFailure(result.reason, result.detail);
      resetRecordingUi();
    } finally {
      setIsFinalizingRecording(false);
    }
  }, [
    applyImportedAudioFile,
    clearRecordingTimer,
    isFinalizingRecording,
    recordingMaxDurationSec,
    resetRecordingUi,
    showRecordingFailure,
  ]);

  const cancelRecording = useCallback(async () => {
    if (isFinalizingRecording) {
      return;
    }

    clearRecordingTimer();
    recordingSessionRef.current?.setLevelListener(null);
    setRecordingLevel(0);
    await recordingSessionRef.current?.cancel().catch(() => undefined);
    resetRecordingUi();
  }, [clearRecordingTimer, isFinalizingRecording, resetRecordingUi]);

  useEffect(() => {
    if (
      !isRecordingActive ||
      recordingElapsedSec < recordingMaxDurationSec ||
      isFinalizingRecording
    ) {
      return;
    }

    finishRecording().catch(() => undefined);
  }, [finishRecording, isFinalizingRecording, isRecordingActive, recordingElapsedSec, recordingMaxDurationSec]);

  const requestDeleteFile = useCallback(() => {
    if (!audioFile) {
      return;
    }
    setFileDeletePending(true);
  }, [audioFile]);

  const cancelDeleteFile = useCallback(() => {
    if (!isDeletingFile) {
      setFileDeletePending(false);
    }
  }, [isDeletingFile]);

  const confirmDeleteFile = useCallback(async () => {
    if (!audioFile) {
      return;
    }

    setIsDeletingFile(true);
    try {
      await stopAudioPlayback().catch(() => undefined);
      await removeStoredFiles(audioFile);
      setPlaybackModal(null);
      setPlaybackStatus('idle');
      setPlaybackProgressSec(0);
      setPlaybackDurationSec(null);
      setAudioFile(null);
      setFileDeletePending(false);
    } catch {
      showErrorAlert(
        t('voiceStudio.deleteFileFailedTitle'),
        t('voiceStudio.deleteFileFailedMessage'),
      );
    } finally {
      setIsDeletingFile(false);
    }
  }, [audioFile, t, showErrorAlert]);

  const buildProcessInput = useCallback(() => {
    if (!audioFile) {
      return null;
    }

    if (
      selection.kind === 'custom' &&
      selectedCustomPreset?.effectChain
    ) {
      return {
        file: audioFile,
        effectTier: 'basic' as const,
        effectChain: selectedCustomPreset.effectChain,
        presetLabel: selectedCustomPreset.name,
        pitchStorage: effects.pitch,
        maxDurationSec: planMaxDurationSec,
      };
    }

    if (selection.kind === 'advanced' && selectedAdvancedEffect) {
      return {
        file: audioFile,
        effectTier: 'advanced' as const,
        advancedEffectId: selection.id,
        presetLabel: t(selectedAdvancedEffect.labelKey),
        pitchStorage: effects.pitch,
        maxDurationSec: planMaxDurationSec,
      };
    }

    if (selection.kind === 'ai' && selectedAiEffect) {
      return {
        file: audioFile,
        effectTier: 'ai' as const,
        aiEffectId: selection.id,
        presetLabel: t(selectedAiEffect.labelKey),
        maxDurationSec: effectiveAiMaxDurationSec,
      };
    }

    if (
      selection.kind === 'custom' &&
      selectedCustomPreset?.source?.tier === 'ai'
    ) {
      return {
        file: audioFile,
        effectTier: 'ai' as const,
        aiEffectId: selectedCustomPreset.source.effectId,
        presetLabel: selectedCustomPreset.name,
        maxDurationSec: effectiveAiMaxDurationSec,
      };
    }

    if (
      selection.kind === 'custom' &&
      selectedCustomPreset?.source?.tier === 'advanced'
    ) {
      return {
        file: audioFile,
        effectTier: 'advanced' as const,
        advancedEffectId: selectedCustomPreset.source.effectId,
        presetLabel: selectedCustomPreset.name,
        pitchStorage: effects.pitch,
        maxDurationSec: planMaxDurationSec,
      };
    }

    const presetId =
      selection.kind === 'builtin'
        ? selection.id
        : selection.kind === 'custom' &&
            selectedCustomPreset?.source?.tier === 'basic'
          ? selectedCustomPreset.source.presetId
          : DEFAULT_VOICE_PRESET_ID;
    const presetLabel =
      selection.kind === 'custom'
        ? selectedCustomPreset?.name
        : selection.kind === 'builtin' && selectedBuiltinPreset
          ? t(selectedBuiltinPreset.labelKey)
          : t('voiceStudio.customMix');

    return {
      file: audioFile,
      effectTier: 'basic' as const,
      presetId,
      presetLabel,
      effects: resolveProcessingEffects(
        selection,
        effects,
        selectedCustomPreset,
      ),
      maxDurationSec: planMaxDurationSec,
    };
  }, [
    audioFile,
    effectiveAiMaxDurationSec,
    effects,
    planMaxDurationSec,
    selectedAdvancedEffect,
    selectedAiEffect,
    selectedBuiltinPreset,
    selectedCustomPreset,
    selection,
    t,
  ]);

  const ensureFileReadyForProcessing = useCallback(() => {
    const input = buildProcessInput();
    if (!input) {
      showErrorAlert(
        t('voiceStudio.noFileTitle'),
        t('voiceStudio.noFileMessage'),
      );
      return null;
    }

    return input;
  }, [buildProcessInput, t, showErrorAlert]);

  const loadPlaybackWaveform = useCallback(async (uri: string) => {
    const requestId = waveformRequestIdRef.current + 1;
    waveformRequestIdRef.current = requestId;
    setIsPlaybackWaveformLoading(true);
    setPlaybackWaveformBars(null);

    try {
      const bars = await getAudioWaveformPreview(uri);
      if (requestId === waveformRequestIdRef.current) {
        setPlaybackWaveformBars(bars);
      }
    } catch (error) {
      logger.warn('VoiceStudio', 'waveform preview failed', { uri, error });
      if (requestId === waveformRequestIdRef.current) {
        setPlaybackWaveformBars(null);
      }
    } finally {
      if (requestId === waveformRequestIdRef.current) {
        setIsPlaybackWaveformLoading(false);
      }
    }
  }, []);

  const openRawPlaybackModal = useCallback(async () => {
    if (!audioFile) {
      showErrorAlert(
        t('voiceStudio.noFileTitle'),
        t('voiceStudio.noFileMessage'),
      );
      return;
    }

    if (!env.enableAudioPreview) {
      showErrorAlert(
        t('voiceStudio.previewDisabledTitle'),
        t('voiceStudio.previewDisabledMessage'),
      );
      return;
    }

    await stopAudioPlayback().catch(() => undefined);
    setPlaybackModal({
      source: 'raw',
      uri: audioFile.uri,
      fileName: audioFile.name,
      durationSec: audioFile.durationSec,
    });
    setPlaybackStatus('idle');
    setPlaybackProgressSec(0);
    setPlaybackDurationSec(audioFile.durationSec);
    loadPlaybackWaveform(audioFile.uri).catch(() => undefined);
  }, [audioFile, loadPlaybackWaveform, t, showErrorAlert]);

  const closePlaybackModal = useCallback(async () => {
    waveformRequestIdRef.current += 1;
    await stopAudioPlayback().catch(() => undefined);
    setPlaybackModal(null);
    setPlaybackStatus('idle');
    setPlaybackProgressSec(0);
    setPlaybackDurationSec(null);
    setPlaybackWaveformBars(null);
    setIsPlaybackWaveformLoading(false);
  }, []);

  const playModalAudio = useCallback(async () => {
    if (!playbackModal) {
      return;
    }

    try {
      if (playbackStatus === 'paused') {
        await resumeAudioPlayback();
      } else {
        await playAudioFile(playbackModal.uri);
      }
      setPlaybackStatus('playing');
    } catch {
      showErrorAlert(
        t('voiceStudio.previewFailedTitle'),
        playbackModal.source === 'raw'
          ? t('voiceStudio.previewRawFailedMessage')
          : t('voiceStudio.previewFailedMessage'),
      );
    }
  }, [playbackModal, playbackStatus, t, showErrorAlert]);

  const pauseModalAudio = useCallback(async () => {
    if (!playbackModal || playbackStatus !== 'playing') {
      return;
    }

    await pauseAudioPlayback().catch(() => undefined);
    setPlaybackStatus('paused');
  }, [playbackModal, playbackStatus]);

  const stopModalAudio = useCallback(async () => {
    await stopAudioPlayback().catch(() => undefined);
    setPlaybackStatus('idle');
    setPlaybackProgressSec(0);
  }, []);

  const cancelProcessing = useCallback(() => {
    if (!processingAbortRef.current || isCancellingProcessing) {
      return;
    }

    processingAbortRef.current.abort();
    setIsCancellingProcessing(true);
  }, [isCancellingProcessing]);

  const convertAudio = useCallback(
    async (options?: { acknowledgedAiStatusRisk?: boolean }) => {
    const input = ensureFileReadyForProcessing();
    if (!input) {
      return;
    }

    const selectedCustom =
      selection.kind === 'custom'
        ? customPresets.find(item => item.id === selection.id)
        : null;
    if (
      !isOnline &&
      selectionUsesAiProcessing(selection, selectedCustom)
    ) {
      showAiOfflineAlert();
      return;
    }

    if (usesAiProcessing && effectiveAiMaxDurationSec <= 0) {
      showWarningAlert(
        t('credits.insufficientTitle'),
        t('voiceStudio.aiCreditsBlockedMessage'),
      );
      return;
    }

    const usesAi = usesAiProcessing;
    const aiCreditCost = usesAi
      ? calculateCreditsForAiDurationSec(
          resolveAiBillableDurationSec(
            audioFile?.durationSec ?? null,
            input.maxDurationSec,
          ),
          creditsPerStartedMinute,
        )
      : 0;

    if (usesAi && balance < aiCreditCost) {
      showWarningAlert(
        t('credits.insufficientTitle'),
        t('credits.insufficientMessage', {
          cost: aiCreditCost,
          balance,
        }),
      );
      return;
    }

    const aiStatusSeverity = aiServiceStatus?.severity;
    const aiServiceUnstable =
      aiStatusSeverity === 'degraded' || aiStatusSeverity === 'outage';
    if (
      usesAi &&
      aiServiceUnstable &&
      !options?.acknowledgedAiStatusRisk &&
      !aiStatusConvertWarningShownThisLaunch
    ) {
      setAiStatusConvertWarningVisible(true);
      return;
    }

    setIsProcessing(true);
    setIsCancellingProcessing(false);
    setProcessingStage('preparing');
    setProcessingProgress(0);
    processingAbortRef.current = new AbortController();

    try {
      // Charge before WaveSpeed — API bills on job submit; end-of-run spend
      // would miss kills/crashes after the cloud job already started.
      let aiCreditsCharged = false;
      try {
        aiCreditsCharged = await chargeAiCreditsBeforeProcessing({
          usesAi,
          creditCost: aiCreditCost,
          spendCredits,
        });
      } catch {
        showErrorAlert(
          t('credits.spendFailedTitle'),
          t('credits.spendFailedMessage'),
        );
        return;
      }

      const processed = await processAudio(input, {
        signal: processingAbortRef.current.signal,
        onProgress: ({ stage, progress }) => {
          setProcessingStage(stage);
          setProcessingProgress(progress);
        },
      });

      if (!processed.ok) {
        if (processed.reason === 'cancelled') {
          showErrorAlert(
            t('voiceStudio.processingCancelledTitle'),
            t('voiceStudio.processingCancelledMessage'),
          );
          return;
        }

        if (usesAi) {
          // Re-check provider status only after a real AI failure (not on a timer).
          refreshStatusAfterAiFailure().catch(() => undefined);
          if (aiCreditsCharged) {
            // Keep header balance in sync after a failed cloud job (credits already spent).
            await refreshBalance().catch(() => undefined);
          }
          showErrorAlert(
            t('voiceStudio.convertFailedTitle'),
            t('voiceStudio.convertFailedAiServiceMessage'),
          );
          return;
        }

        showErrorAlert(
          t('voiceStudio.convertFailedTitle'),
          env.debugMode
            ? `${t('voiceStudio.convertFailedMessage')}\n\nCheck Metro logs for WaveSpeedSts / AudioProcessing.`
            : t('voiceStudio.convertFailedMessage'),
        );
        return;
      }

      const { removedOutputUris } = await addProcessedHistoryEntry({
        fileName: processed.result.fileName,
        outputUri: processed.result.outputUri,
        sourceFileName: input.file.name,
        presetLabel: input.presetLabel ?? t('voiceStudio.customMix'),
      });
      await removeStoredOutputUris(removedOutputUris);
      await refreshProcessedHistory();

      if (usesAi && aiCreditsCharged) {
        // Output already validated in processAiTierAudio; sync credits from API.
        const nextBalance = await refreshBalance().catch(
          () => Math.max(0, balance - aiCreditCost),
        );
        setAiConvertCreditsNotice({
          cost: aiCreditCost,
          balance: nextBalance,
        });
      }

      if (env.enableAudioPreview) {
        await stopAudioPlayback().catch(() => undefined);
        setPlaybackModal({
          source: 'processed',
          uri: processed.result.outputUri,
          fileName: processed.result.fileName,
          durationSec: audioFile?.durationSec ?? null,
        });
        setPlaybackStatus('idle');
        setPlaybackProgressSec(0);
        setPlaybackDurationSec(audioFile?.durationSec ?? null);
        loadPlaybackWaveform(processed.result.outputUri).catch(() => undefined);
      }
    } finally {
      processingAbortRef.current = null;
      setIsCancellingProcessing(false);
      setIsProcessing(false);
    }
  }, [
    audioFile?.durationSec,
    balance,
    creditsPerStartedMinute,
    customPresets,
    effectiveAiMaxDurationSec,
    ensureFileReadyForProcessing,
    isOnline,
    loadPlaybackWaveform,
    refreshProcessedHistory,
    refreshStatusAfterAiFailure,
    selection,
    spendCredits,
    refreshBalance,
    showAiOfflineAlert,
    showErrorAlert,
    showWarningAlert,
    t,
    usesAiProcessing,
    aiServiceStatus?.severity,
  ]);

  const cancelAiStatusConvertWarning = useCallback(() => {
    aiStatusConvertWarningShownThisLaunch = true;
    setAiStatusConvertWarningVisible(false);
  }, []);

  const confirmAiStatusConvertWarning = useCallback(() => {
    aiStatusConvertWarningShownThisLaunch = true;
    setAiStatusConvertWarningVisible(false);
    convertAudio({ acknowledgedAiStatusRisk: true }).catch(() => undefined);
  }, [convertAudio]);

  const openProcessedHistoryPlayback = useCallback(
    async (entry: ProcessedHistoryEntry) => {
      if (!env.enableAudioPreview) {
        showErrorAlert(
          t('voiceStudio.previewDisabledTitle'),
          t('voiceStudio.previewDisabledMessage'),
        );
        return;
      }

      await stopAudioPlayback().catch(() => undefined);
      setPlaybackModal({
        source: 'processed',
        uri: entry.outputUri,
        fileName: entry.fileName,
        durationSec: audioFile?.durationSec ?? null,
      });
      setPlaybackStatus('idle');
      setPlaybackProgressSec(0);
      setPlaybackDurationSec(audioFile?.durationSec ?? null);
      loadPlaybackWaveform(entry.outputUri).catch(() => undefined);
    },
    [audioFile?.durationSec, loadPlaybackWaveform, t, showErrorAlert]);

  const exportProcessedHistoryItem = useCallback(
    async (entry: ProcessedHistoryEntry) => {
      setExportingHistoryId(entry.id);
      try {
        const permission = await ensurePermission('storage');
        if (!permission.granted) {
          showPermissionDeniedAlert(
            t('permissions.storageDeniedTitle'),
            t('permissions.storageDeniedMessage'),
          );
          return;
        }

        const exportResult = await exportProcessedAudio({
          sourceUri: entry.outputUri,
          fileName: entry.fileName,
        });

        if (!exportResult.ok) {
          showErrorAlert(
            t('voiceStudio.exportFailedTitle'),
            t('voiceStudio.exportFailedMessage'),
          );
          return;
        }

        setExportSuccessNotice({ fileName: entry.fileName });
      } finally {
        setExportingHistoryId(null);
      }
    },
    [t, showErrorAlert]);

  const shareProcessedHistoryItem = useCallback(
    async (entry: ProcessedHistoryEntry) => {
      setSharingHistoryId(entry.id);
      try {
        const shareResult = await shareProcessedAudio({
          sourceUri: entry.outputUri,
          fileName: entry.fileName,
        });

        if (!shareResult.ok && shareResult.reason !== 'cancelled') {
          showErrorAlert(
            t('voiceStudio.shareFailedTitle'),
            t('voiceStudio.shareFailedMessage'),
          );
        }
      } finally {
        setSharingHistoryId(null);
      }
    },
    [t, showErrorAlert]);

  const dismissExportSuccessNotice = useCallback(() => {
    setExportSuccessNotice(null);
  }, []);

  const dismissAiConvertCreditsNotice = useCallback(() => {
    setAiConvertCreditsNotice(null);
  }, []);

  const requestDeleteProcessedHistory = useCallback(
    (entry: ProcessedHistoryEntry) => {
      setProcessedHistoryDeletePending(entry);
    },
    []);

  const cancelDeleteProcessedHistory = useCallback(() => {
    if (!isDeletingProcessedHistory) {
      setProcessedHistoryDeletePending(null);
    }
  }, [isDeletingProcessedHistory]);

  const confirmDeleteProcessedHistory = useCallback(async () => {
    if (!processedHistoryDeletePending || !isReady) {
      return;
    }

    const deletingEntry = processedHistoryDeletePending;
    setIsDeletingProcessedHistory(true);
    try {
      if (
        playbackModal?.source === 'processed' &&
        playbackModal.uri === deletingEntry.outputUri
      ) {
        await stopAudioPlayback().catch(() => undefined);
        setPlaybackModal(null);
        setPlaybackStatus('idle');
        setPlaybackProgressSec(0);
        setPlaybackDurationSec(null);
        setPlaybackWaveformBars(null);
      }

      await deleteProcessedHistoryEntry(deletingEntry.id);
      await deleteStoredAudioFile(deletingEntry.outputUri).catch(() => undefined);
      await refreshProcessedHistory();
      setProcessedHistoryDeletePending(null);
    } catch {
      showErrorAlert(
        t('voiceStudio.deleteProcessedFailedTitle'),
        t('voiceStudio.deleteProcessedFailedMessage'),
      );
    } finally {
      setIsDeletingProcessedHistory(false);
    }
  }, [isReady, playbackModal, processedHistoryDeletePending, refreshProcessedHistory, t, showErrorAlert]);

  const clearPresetEditorSaveError = useCallback(() => {
    setPresetEditorSaveError(null);
  }, []);

  const savePitchTweakPreset = useCallback(async () => {
    if (!isReady || !hasPitchTweak) {
      return;
    }

    let source: SavedVoicePresetSource | undefined;
    let baseLabel = '';

    if (selection.kind === 'builtin' && selectedBuiltinPreset) {
      source = { tier: 'basic', presetId: selection.id };
      baseLabel = t(selectedBuiltinPreset.labelKey);
    } else if (selection.kind === 'advanced' && selectedAdvancedEffect) {
      source = { tier: 'advanced', effectId: selection.id };
      baseLabel = t(selectedAdvancedEffect.labelKey);
    } else if (selection.kind === 'ai' && selectedAiEffect) {
      source = { tier: 'ai', effectId: selection.id };
      baseLabel = t(selectedAiEffect.labelKey);
    } else if (selection.kind === 'custom' && selectedCustomPreset?.source) {
      source = selectedCustomPreset.source;
      if (source.tier === 'basic') {
        const builtin = VOICE_PRESETS.find(
          preset => preset.id === source.presetId,
        );
        baseLabel = t(builtin?.labelKey ?? 'voiceStudio.customMix');
      } else if (source.tier === 'advanced') {
        const advanced = ADVANCED_EFFECTS.find(
          effect => effect.id === source.effectId,
        );
        baseLabel = t(advanced?.labelKey ?? 'voiceStudio.customMix');
      } else {
        const aiEffect = findAiEffect(source.effectId);
        baseLabel = t(aiEffect?.labelKey ?? 'voiceStudio.customMix');
      }
    } else {
      return;
    }

    const presetEffects = buildDerivedPresetEffects(source, effects.pitch);
    const presetName = resolveUniquePresetName(
      customPresets,
      buildDerivedPresetName(baseLabel, effects.pitch),
      selection.kind === 'custom' ? selectedCustomPreset?.id : undefined,
    );

    setIsSavingPreset(true);
    try {
      if (selection.kind === 'custom' && selectedCustomPreset?.source) {
        const updated = await updateVoicePreset(
          selectedCustomPreset.id,
          presetEffects,
          presetName,
        );
        await refreshCustomPresets();
        commitPresetSnapshot(updated.effects, {
          kind: 'custom',
          id: updated.id,
        });
        setPresetSuccessNotice({ kind: 'updated', name: updated.name });
        return;
      }

      const saved = await createVoicePreset(presetName, presetEffects, {
        source,
        accentColor: getDerivedPresetAccentColor(source),
        avatarImageKey: getDerivedPresetAvatarKey(source),
      });
      const presets = await refreshCustomPresets();
      const created = presets.find(preset => preset.id === saved.id) ?? saved;
      commitPresetSnapshot(created.effects, {
        kind: 'custom',
        id: created.id,
      });
      setPresetSuccessNotice({ kind: 'created', name: created.name });
    } catch {
      showErrorAlert(
        t('voiceStudio.savePresetFailedTitle'),
        t('voiceStudio.savePresetFailedMessage'),
      );
    } finally {
      setIsSavingPreset(false);
    }
  }, [commitPresetSnapshot, customPresets, effects.pitch, hasPitchTweak, isReady, refreshCustomPresets, selectedAdvancedEffect, selectedAiEffect, selectedBuiltinPreset, selectedCustomPreset, selection, t, showErrorAlert]);

  const isBuiltinSelected = useCallback(
    (presetId: VoicePresetId) =>
      selection.kind === 'builtin' && selection.id === presetId,
    [selection]);

  const isCustomSelected = useCallback(
    (presetId: string) =>
      selection.kind === 'custom' && selection.id === presetId,
    [selection]);

  const isAdvancedSelected = useCallback(
    (effectId: AdvancedEffectId) =>
      selection.kind === 'advanced' && selection.id === effectId,
    [selection]);

  const isAiSelected = useCallback(
    (effectId: AiEffectId) => selection.kind === 'ai' && selection.id === effectId,
    [selection]);

  const isEditorLocked =
    isProcessing ||
    isCancellingProcessing ||
    isInteractionLocked ||
    isPreparingSource;

  const canConvertAudio =
    audioFile !== null &&
    selection.kind !== 'none' &&
    !(usesAiProcessing && (aiUsageEstimate === null || !aiUsageEstimate.canAfford));

  return {
    audioFile,
    fileSummary,
    processedHistory,
    recentProcessedPreview,
    hasMoreProcessedHistory,
    hasProcessedHistory,
    selection,
    selectedBuiltinPreset,
    selectedCustomPreset,
    conversionSummary,
    effects,
    effectKeys: presetEditorEffectKeys,
    hasPitchTweak,
    customPresets,
    recordingExpanded,
    recordingModalVisible,
    isRecordingActive,
    recordingElapsedSec,
    recordingLevel,
    isFinalizingRecording,
    presetSuccessNotice,
    exportSuccessNotice,
    aiConvertCreditsNotice,
    presetEditorSaveError,
    presetUpdatePending,
    processedHistoryDeletePending,
    isDeletingProcessedHistory,
    exportingHistoryId,
    sharingHistoryId,
    isLoadingFile,
    isPreparingSource,
    playbackModal,
    playbackStatus,
    playbackProgressSec,
    playbackDurationSec,
    playbackWaveformBars,
    isPlaybackWaveformLoading,
    isAudioPlaying: playbackStatus === 'playing',
    isProcessing,
    processingStage,
    processingProgress,
    isCancellingProcessing,
    isEditorLocked,
    canConvertAudio,
    cancelProcessing,
    isSavingPreset,
    presetEditorVisible,
    combineEffectsModalVisible,
    combineEffectsSaveError,
    combineEffectGroups,
    presetEditorMode,
    presetEditorTarget,
    presetEditorDraftEffects,
    presetEditorCanUpdate,
    presetPendingDelete,
    isDeletingPreset,
    fileDeletePending,
    isDeletingFile,
    sourceDurationLimitNotice,
    aiStatusConvertWarningVisible,
    localMaxDurationSec: planMaxDurationSec,
    aiMaxDurationSec,
    recordingMaxDurationSec,
    usesAiProcessing,
    aiUsageEstimate,
    affordableAiSeconds,
    effectiveAiMaxDurationSec,
    isPremium,
    balance,
    accountPlan,
    supportedFormatsLabel,
    presets: VOICE_PRESETS,
    advancedEffects: ADVANCED_EFFECTS,
    aiEffects: AI_EFFECTS,
    isOnline,
    aiEffectsOffline: !isOnline,
    showAiOfflineAlert,
    loadFile,
    requestLoadFile,
    openRecordingModal,
    requestOpenRecordingModal,
    cancelSourceDurationLimitNotice,
    confirmSourceDurationLimitNotice,
    cancelAiStatusConvertWarning,
    confirmAiStatusConvertWarning,
    startRecording,
    finishRecording,
    cancelRecording,
    openRawPlaybackModal,
    playModalAudio,
    pauseModalAudio,
    stopModalAudio,
    closePlaybackModal,
    requestDeleteFile,
    cancelDeleteFile,
    confirmDeleteFile,
    convertAudio,
    savePitchTweakPreset,
    selectBuiltinPreset,
    selectAdvancedEffect,
    selectAiEffect,
    selectCustomPreset,
    setEffectValue,
    isBuiltinSelected,
    isAdvancedSelected,
    isAiSelected,
    isCustomSelected,
    dismissPresetSuccessNotice,
    dismissExportSuccessNotice,
    dismissAiConvertCreditsNotice,
    clearPresetEditorSaveError,
    openCreatePresetEditor,
    openCombineEffectsModal,
    closeCombineEffectsModal,
    clearCombineEffectsSaveError,
    createCombinedPreset,
    getCombinedPresetDescription,
    openEditPresetEditor,
    closePresetEditor,
    setPresetDraftEffectValue,
    createPreset,
    requestPresetUpdate,
    cancelPresetUpdate,
    confirmPresetUpdate,
    updateSelectedPreset,
    savePresetAsNew,
    requestDeletePreset,
    requestDeleteSelectedPreset,
    cancelDeletePreset,
    confirmDeletePreset,
    getPresetAvatarInitial,
    toggleRecording: () => setRecordingExpanded(current => !current),
    openProcessedHistoryPlayback,
    exportProcessedHistoryItem,
    shareProcessedHistoryItem,
    requestDeleteProcessedHistory,
    cancelDeleteProcessedHistory,
    confirmDeleteProcessedHistory,
    refreshProcessedHistory,
  };
}

export type UseVoiceStudioReturn = ReturnType<typeof useVoiceStudio>;
