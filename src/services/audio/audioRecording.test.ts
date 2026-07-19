import ReactNativeBlobUtil from 'react-native-blob-util';

const mockEnableFileOutput = jest.fn();
const mockOnAudioReady = jest.fn();
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockGetCurrentDuration = jest.fn();
const mockIsRecording = jest.fn();
const mockClearOnError = jest.fn();
const mockClearOnAudioReady = jest.fn();

jest.mock('react-native-audio-api', () => ({
  AudioRecorder: jest.fn().mockImplementation(() => ({
    enableFileOutput: mockEnableFileOutput,
    onAudioReady: mockOnAudioReady,
    start: mockStart,
    stop: mockStop,
    getCurrentDuration: mockGetCurrentDuration,
    isRecording: mockIsRecording,
    clearOnError: mockClearOnError,
    clearOnAudioReady: mockClearOnAudioReady,
  })),
  FileDirectory: { Cache: 1, Document: 0 },
  FileFormat: { M4A: 2 },
}));

jest.mock('@/services/audio/getAudioDuration', () => ({
  getAudioDurationSec: jest.fn().mockResolvedValue(12),
}));

import { getAudioDurationSec } from '@/services/audio/getAudioDuration';
import {
  AudioRecordingSession,
  buildRecordingFileName,
  finalizeRecordedAudio,
} from '@/services/audio/audioRecording';

describe('buildRecordingFileName', () => {
  it('uses m4a extension and timestamp', () => {
    expect(buildRecordingFileName(1_700_000_000_000)).toBe(
      'recording-1700000000000.m4a',
    );
  });
});

describe('finalizeRecordedAudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ReactNativeBlobUtil.fs.stat as jest.Mock).mockResolvedValue({ size: 2048 });
    (ReactNativeBlobUtil.fs.cp as jest.Mock).mockResolvedValue(true);
    (ReactNativeBlobUtil.fs.unlink as jest.Mock).mockResolvedValue(true);
    (getAudioDurationSec as jest.Mock).mockResolvedValue(12);
  });

  it('copies recording into imports and returns SelectedAudioFile', async () => {
    const result = await finalizeRecordedAudio('/cache/recording.m4a', {
      supportedFormats: ['m4a', 'mp3'],
      maxSizeMb: 50,
      maxDurationSec: 30,
    });

    expect(result).toEqual({
      ok: true,
      file: {
        uri: expect.stringContaining('recording-'),
        name: expect.stringMatching(/^recording-\d+\.m4a$/),
        sizeBytes: 2048,
        durationSec: 12,
        extension: 'm4a',
      },
    });
    expect(ReactNativeBlobUtil.fs.cp).toHaveBeenCalled();
  });

  it('rejects recordings longer than demo limit', async () => {
    (getAudioDurationSec as jest.Mock).mockResolvedValue(45);

    const result = await finalizeRecordedAudio('/cache/recording.m4a', {
      supportedFormats: ['m4a'],
      maxSizeMb: 50,
      maxDurationSec: 30,
    });

    expect(result).toEqual({ ok: false, reason: 'duration_exceeded' });
    expect(ReactNativeBlobUtil.fs.unlink).toHaveBeenCalled();
  });

  it('rejects empty recordings', async () => {
    (ReactNativeBlobUtil.fs.stat as jest.Mock).mockResolvedValue({ size: 0 });

    const result = await finalizeRecordedAudio('/cache/recording.m4a', {
      supportedFormats: ['m4a'],
      maxSizeMb: 50,
      maxDurationSec: 30,
    });

    expect(result).toEqual({ ok: false, reason: 'empty_recording' });
  });
});

describe('AudioRecordingSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsRecording.mockReturnValue(false);
    mockGetCurrentDuration.mockReturnValue(0);
    mockStart.mockResolvedValue({ status: 'success' });
    mockStop.mockResolvedValue({
      status: 'success',
      paths: ['/cache/recording.m4a'],
      size: 0.001,
      duration: 8,
    });
    (ReactNativeBlobUtil.fs.stat as jest.Mock).mockResolvedValue({ size: 1500 });
    (getAudioDurationSec as jest.Mock).mockResolvedValue(8);
  });

  it('starts and finalizes a recording session', async () => {
    const session = new AudioRecordingSession();

    const startResult = await session.start();
    expect(startResult).toEqual({ ok: true });
    expect(mockEnableFileOutput).toHaveBeenCalled();

    const finalizeResult = await session.stopAndFinalize({
      supportedFormats: ['m4a'],
      maxSizeMb: 50,
      maxDurationSec: 30,
    });

    expect(finalizeResult.ok).toBe(true);
    expect(mockStop).toHaveBeenCalled();
  });

  it('cancels an active recording without importing', async () => {
    mockIsRecording.mockReturnValue(true);
    const session = new AudioRecordingSession();
    await session.start();
    await session.cancel();

    expect(mockStop).toHaveBeenCalled();
  });
});
