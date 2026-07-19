import { YourRecordingsScreen } from '@/screens/YourRecordingsScreen';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

const mockUseProcessedRecordings = jest.fn();

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('@/hooks/useScreenTitle', () => ({
  useScreenTitle: jest.fn(),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, isHydrated: true }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('@/hooks/useProcessedRecordings', () => ({
  useProcessedRecordings: () => mockUseProcessedRecordings(),
}));

jest.mock('@/components/molecules/ProcessedHistoryList', () => ({
  ProcessedHistoryList: 'ProcessedHistoryList',
}));

jest.mock('@/components/molecules/ConfirmDialog', () => ({
  ConfirmDialog: 'ConfirmDialog',
}));

jest.mock('@/components/molecules/SuccessDialog', () => ({
  SuccessDialog: 'SuccessDialog',
}));

jest.mock('@/components/molecules/AudioPlaybackModal', () => ({
  AudioPlaybackModal: 'AudioPlaybackModal',
}));

jest.mock('@/components/organisms/Screen', () => ({
  Screen: ({ children }: { children: React.ReactNode }) => children,
}));

function createRecordingsMock(entryCount: number) {
  return {
    entries: Array.from({ length: entryCount }, (_, index) => ({
      id: `entry-${index}`,
      fileName: `file-${index}.wav`,
      outputUri: `file:///file-${index}.wav`,
      sourceFileName: `source-${index}.mp3`,
      presetLabel: 'Natural',
      createdAt: index,
    })),
    exportingId: null,
    sharingId: null,
    exportSuccessNotice: null,
    deletePending: null,
    deleteAllPending: false,
    isDeleting: false,
    playbackModal: null,
    playbackProgressSec: 0,
    playbackDurationSec: null,
    isAudioPlaying: false,
    playbackWaveformBars: null,
    isPlaybackWaveformLoading: false,
    refreshEntries: jest.fn(),
    openPlayback: jest.fn(),
    exportEntry: jest.fn(),
    shareEntry: jest.fn(),
    requestDelete: jest.fn(),
    requestDeleteAll: jest.fn(),
    cancelDelete: jest.fn(),
    cancelDeleteAll: jest.fn(),
    confirmDelete: jest.fn(),
    confirmDeleteAll: jest.fn(),
    dismissExportSuccessNotice: jest.fn(),
    closePlaybackModal: jest.fn(),
    playModalAudio: jest.fn(),
    pauseModalAudio: jest.fn(),
    stopModalAudio: jest.fn(),
  };
}

describe('YourRecordingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows delete-all button when there are more than two recordings', async () => {
    mockUseProcessedRecordings.mockReturnValue(createRecordingsMock(3));

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <YourRecordingsScreen
          navigation={{} as never}
          route={{ key: 'YourRecordings', name: 'YourRecordings' }}
        />,
      );
      await Promise.resolve();
    });

    const buttons = tree!.root.findAll(
      node => node.props?.title === 'yourRecordings.deleteAllButton',
    );
    expect(buttons).toHaveLength(1);
  });

  it('hides delete-all button when there are two or fewer recordings', async () => {
    mockUseProcessedRecordings.mockReturnValue(createRecordingsMock(2));

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <YourRecordingsScreen
          navigation={{} as never}
          route={{ key: 'YourRecordings', name: 'YourRecordings' }}
        />,
      );
      await Promise.resolve();
    });

    const buttons = tree!.root.findAll(
      node => node.props?.title === 'yourRecordings.deleteAllButton',
    );
    expect(buttons).toHaveLength(0);
  });
});
