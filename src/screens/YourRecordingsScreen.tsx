import { Platform, Text, View } from 'react-native';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/atoms/Button';
import { AudioPlaybackModal } from '@/components/molecules/AudioPlaybackModal';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { ProcessedHistoryList } from '@/components/molecules/ProcessedHistoryList';
import { SuccessDialog } from '@/components/molecules/SuccessDialog';
import { Screen } from '@/components/organisms/Screen';
import { useProcessedRecordings } from '@/hooks/useProcessedRecordings';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { useTranslation } from '@/hooks/useTranslation';
import type { RootStackScreenProps } from '@/navigation/types';

export function YourRecordingsScreen(
  _props: RootStackScreenProps<'YourRecordings'>,
) {
  const { t } = useTranslation();
  useScreenTitle('nav.yourRecordings');
  const recordings = useProcessedRecordings();
  const { refreshEntries } = recordings;

  useFocusEffect(
    useCallback(() => {
      refreshEntries().catch(() => undefined);
    }, [refreshEntries]),
  );

  return (
    <Screen scrollable>
      <Text className="mb-4 mt-2 text-sm leading-6 text-foreground-muted dark:text-foreground-muted-dark">
        {t('yourRecordings.intro')}
      </Text>

      <ProcessedHistoryList
        entries={recordings.entries}
        exportingId={recordings.exportingId}
        sharingId={recordings.sharingId}
        onPlay={entry => {
          recordings.openPlayback(entry).catch(() => undefined);
        }}
        onExport={entry => {
          recordings.exportEntry(entry).catch(() => undefined);
        }}
        onShare={entry => {
          recordings.shareEntry(entry).catch(() => undefined);
        }}
        onDelete={recordings.requestDelete}
      />

      {recordings.entries.length > 2 ? (
        <View className="mt-4">
          <Button
            title={t('yourRecordings.deleteAllButton')}
            variant="secondary"
            onPress={recordings.requestDeleteAll}
            className="min-h-12"
          />
        </View>
      ) : null}

      <SuccessDialog
        visible={recordings.exportSuccessNotice !== null}
        title={t('voiceStudio.exportSuccessTitle')}
        message={
          Platform.OS === 'ios'
            ? t('voiceStudio.exportSuccessDialogMessageIos', {
                fileName: recordings.exportSuccessNotice?.fileName ?? '',
              })
            : t('voiceStudio.exportSuccessDialogMessageAndroid', {
                fileName: recordings.exportSuccessNotice?.fileName ?? '',
              })
        }
        onClose={recordings.dismissExportSuccessNotice}
      />

      <ConfirmDialog
        visible={recordings.deletePending !== null}
        title={t('voiceStudio.deleteProcessedTitle')}
        message={t('voiceStudio.deleteProcessedMessage', {
          name: recordings.deletePending?.fileName ?? '',
        })}
        confirmLabel={t('voiceStudio.deleteProcessedConfirm')}
        isLoading={recordings.isDeleting}
        onCancel={recordings.cancelDelete}
        onConfirm={() => {
          recordings.confirmDelete().catch(() => undefined);
        }}
      />

      <ConfirmDialog
        visible={recordings.deleteAllPending}
        title={t('yourRecordings.deleteAllTitle')}
        message={t('yourRecordings.deleteAllMessage', {
          count: recordings.entries.length,
        })}
        confirmLabel={t('yourRecordings.deleteAllConfirm')}
        isLoading={recordings.isDeleting}
        onCancel={recordings.cancelDeleteAll}
        onConfirm={() => {
          recordings.confirmDeleteAll().catch(() => undefined);
        }}
      />

      {recordings.playbackModal ? (
        <AudioPlaybackModal
          visible={recordings.playbackModal !== null}
          title={t('voiceStudio.playbackProcessedTitle')}
          fileName={recordings.playbackModal.fileName}
          progressSec={recordings.playbackProgressSec}
          durationSec={recordings.playbackDurationSec}
          isPlaying={recordings.isAudioPlaying}
          waveformBars={recordings.playbackWaveformBars}
          isWaveformLoading={recordings.isPlaybackWaveformLoading}
          onPlay={() => {
            recordings.playModalAudio().catch(() => undefined);
          }}
          onPause={() => {
            recordings.pauseModalAudio().catch(() => undefined);
          }}
          onStop={() => {
            recordings.stopModalAudio().catch(() => undefined);
          }}
          onClose={() => {
            recordings.closePlaybackModal().catch(() => undefined);
          }}
        />
      ) : null}
    </Screen>
  );
}
