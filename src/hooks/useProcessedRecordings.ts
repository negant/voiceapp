import { useCallback, useEffect, useRef, useState } from 'react';
import { env } from '@/config/env';
import { useAppAlert } from '@/hooks/useAppAlert';
import { useDatabase } from '@/hooks/useDatabase';
import { useTranslation } from '@/hooks/useTranslation';
import { useProcessedRecordingsCount } from '@/providers/ProcessedRecordingsCountProvider';
import {
  deleteStoredAudioFile,
  exportProcessedAudio,
  getAudioPlaybackInfo,
  getAudioWaveformPreview,
  pauseAudioPlayback,
  playAudioFile,
  resumeAudioPlayback,
  shareProcessedAudio,
  stopAudioPlayback,
} from '@/services/audio';
import {
  deleteAllProcessedHistory,
  deleteProcessedHistoryEntry,
  listProcessedHistory,
} from '@/services/database/processedHistoryRepository';
import {
  ensurePermission,
  showPermissionDeniedAlert,
} from '@/services/permissions/appPermissions';
import type { ProcessedHistoryEntry } from '@/types/voiceStudio';
import { logger } from '@/utils/logger';

type PlaybackStatus = 'idle' | 'playing' | 'paused';

type PlaybackModalState = {
  uri: string;
  fileName: string;
  durationSec: number | null;
};

type UseProcessedRecordingsOptions = {
  /** Reserved for future screen-specific behaviour. */
  autoLoad?: boolean;
};

export function useProcessedRecordings(_options?: UseProcessedRecordingsOptions) {
  const { t } = useTranslation();
  const { isReady } = useDatabase();
  const { refreshCount: refreshRecordingsCount } = useProcessedRecordingsCount();
  const { showErrorAlert, showWarningAlert } = useAppAlert();
  const [entries, setEntries] = useState<ProcessedHistoryEntry[]>([]);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<{
    fileName: string;
  } | null>(null);
  const [deletePending, setDeletePending] = useState<ProcessedHistoryEntry | null>(
    null,
  );
  const [deleteAllPending, setDeleteAllPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [playbackModal, setPlaybackModal] = useState<PlaybackModalState | null>(
    null,
  );
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

  const refreshEntries = useCallback(async () => {
    const list = await listProcessedHistory();
    setEntries(list);
    await refreshRecordingsCount().catch(() => undefined);
    return list;
  }, [refreshRecordingsCount]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    refreshEntries().catch(() => undefined);
  }, [isReady, refreshEntries]);

  useEffect(() => {
    return () => {
      stopAudioPlayback().catch(() => undefined);
    };
  }, []);

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
      logger.warn('ProcessedRecordings', 'waveform preview failed', { uri, error });
      if (requestId === waveformRequestIdRef.current) {
        setPlaybackWaveformBars(null);
      }
    } finally {
      if (requestId === waveformRequestIdRef.current) {
        setIsPlaybackWaveformLoading(false);
      }
    }
  }, []);

  const openPlayback = useCallback(
    async (entry: ProcessedHistoryEntry) => {
      if (!env.enableAudioPreview) {
        showWarningAlert(
          t('voiceStudio.previewDisabledTitle'),
          t('voiceStudio.previewDisabledMessage'),
        );
        return;
      }

      await stopAudioPlayback().catch(() => undefined);
      setPlaybackModal({
        uri: entry.outputUri,
        fileName: entry.fileName,
        durationSec: null,
      });
      setPlaybackStatus('idle');
      setPlaybackProgressSec(0);
      setPlaybackDurationSec(null);
      loadPlaybackWaveform(entry.outputUri).catch(() => undefined);
    },
    [loadPlaybackWaveform, showWarningAlert, t],
  );

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
        t('voiceStudio.previewFailedMessage'),
      );
    }
  }, [playbackModal, playbackStatus, showErrorAlert, t]);

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

  const exportEntry = useCallback(
    async (entry: ProcessedHistoryEntry) => {
      setExportingId(entry.id);
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
        setExportingId(null);
      }
    },
    [showErrorAlert, t],
  );

  const shareEntry = useCallback(
    async (entry: ProcessedHistoryEntry) => {
      setSharingId(entry.id);
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
        setSharingId(null);
      }
    },
    [showErrorAlert, t],
  );

  const requestDelete = useCallback((entry: ProcessedHistoryEntry) => {
    setDeleteAllPending(false);
    setDeletePending(entry);
  }, []);

  const cancelDelete = useCallback(() => {
    if (!isDeleting) {
      setDeletePending(null);
    }
  }, [isDeleting]);

  const requestDeleteAll = useCallback(() => {
    setDeletePending(null);
    setDeleteAllPending(true);
  }, []);

  const cancelDeleteAll = useCallback(() => {
    if (!isDeleting) {
      setDeleteAllPending(false);
    }
  }, [isDeleting]);

  const confirmDelete = useCallback(async () => {
    if (!deletePending || !isReady) {
      return;
    }

    const deletingEntry = deletePending;
    setIsDeleting(true);
    try {
      if (playbackModal?.uri === deletingEntry.outputUri) {
        await stopAudioPlayback().catch(() => undefined);
        setPlaybackModal(null);
        setPlaybackStatus('idle');
        setPlaybackProgressSec(0);
        setPlaybackDurationSec(null);
        setPlaybackWaveformBars(null);
      }

      await deleteProcessedHistoryEntry(deletingEntry.id);
      await deleteStoredAudioFile(deletingEntry.outputUri).catch(() => undefined);
      await refreshEntries();
      setDeletePending(null);
    } catch {
      showErrorAlert(
        t('voiceStudio.deleteProcessedFailedTitle'),
        t('voiceStudio.deleteProcessedFailedMessage'),
      );
    } finally {
      setIsDeleting(false);
    }
  }, [deletePending, isReady, playbackModal, refreshEntries, showErrorAlert, t]);

  const confirmDeleteAll = useCallback(async () => {
    if (!deleteAllPending || !isReady) {
      return;
    }

    setIsDeleting(true);
    try {
      if (playbackModal) {
        await stopAudioPlayback().catch(() => undefined);
        setPlaybackModal(null);
        setPlaybackStatus('idle');
        setPlaybackProgressSec(0);
        setPlaybackDurationSec(null);
        setPlaybackWaveformBars(null);
      }

      const outputUris = await deleteAllProcessedHistory();
      await Promise.all(
        outputUris.map(uri => deleteStoredAudioFile(uri).catch(() => undefined)),
      );
      await refreshEntries();
      setDeleteAllPending(false);
    } catch {
      showErrorAlert(
        t('voiceStudio.deleteProcessedFailedTitle'),
        t('voiceStudio.deleteProcessedFailedMessage'),
      );
    } finally {
      setIsDeleting(false);
    }
  }, [deleteAllPending, isReady, playbackModal, refreshEntries, showErrorAlert, t]);

  const dismissExportSuccessNotice = useCallback(() => {
    setExportSuccessNotice(null);
  }, []);

  return {
    entries,
    exportingId,
    sharingId,
    exportSuccessNotice,
    deletePending,
    deleteAllPending,
    isDeleting,
    playbackModal,
    playbackStatus,
    playbackProgressSec,
    playbackDurationSec,
    playbackWaveformBars,
    isPlaybackWaveformLoading,
    isAudioPlaying: playbackStatus === 'playing',
    refreshEntries,
    openPlayback,
    closePlaybackModal,
    playModalAudio,
    pauseModalAudio,
    stopModalAudio,
    exportEntry,
    shareEntry,
    requestDelete,
    cancelDelete,
    confirmDelete,
    requestDeleteAll,
    cancelDeleteAll,
    confirmDeleteAll,
    dismissExportSuccessNotice,
  };
}

export type UseProcessedRecordingsReturn = ReturnType<typeof useProcessedRecordings>;
