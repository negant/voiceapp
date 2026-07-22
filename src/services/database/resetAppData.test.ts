import {
  reloadAppAfterReset,
  resetLocalAppData,
} from '@/services/database/resetAppData';
import { getSQLiteManager } from '@/services/database/sqliteManager';

const mockExecuteQuery = jest.fn();
const mockExists = jest.fn();
const mockLs = jest.fn();
const mockUnlink = jest.fn();
const mockMkdir = jest.fn();
const mockReload = jest.fn();

jest.mock('@/services/database/sqliteManager', () => ({
  getSQLiteManager: jest.fn(),
}));

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: {
      dirs: {
        DocumentDir: '/tmp/docs',
        CacheDir: '/tmp/cache',
      },
      exists: (...args: unknown[]) => mockExists(...args),
      ls: (...args: unknown[]) => mockLs(...args),
      unlink: (...args: unknown[]) => mockUnlink(...args),
      mkdir: (...args: unknown[]) => mockMkdir(...args),
    },
  },
}));

jest.mock('react-native', () => ({
  DevSettings: {
    reload: (...args: unknown[]) => mockReload(...args),
  },
}));

describe('resetLocalAppData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSQLiteManager as jest.Mock).mockReturnValue({
      executeQuery: mockExecuteQuery,
    });
    mockExecuteQuery.mockResolvedValue({ success: true, data: [], error: null });
    mockExists.mockResolvedValue(true);
    mockLs.mockResolvedValue(['a.wav', 'b.mp3']);
    mockUnlink.mockResolvedValue(undefined);
    mockMkdir.mockResolvedValue(undefined);
  });

  it('clears settings, presets, history and audio directories', async () => {
    await resetLocalAppData();

    expect(mockExecuteQuery).toHaveBeenCalledWith('DELETE FROM settings');
    expect(mockExecuteQuery).toHaveBeenCalledWith('DELETE FROM voice_presets');
    expect(mockExecuteQuery).toHaveBeenCalledWith(
      'DELETE FROM processed_history',
    );

    expect(mockUnlink).toHaveBeenCalledWith('/tmp/docs/audio/imports/a.wav');
    expect(mockUnlink).toHaveBeenCalledWith('/tmp/docs/audio/imports/b.mp3');
    expect(mockUnlink).toHaveBeenCalledWith('/tmp/docs/audio/processed/a.wav');
    expect(mockUnlink).toHaveBeenCalledWith('/tmp/docs/VoiceApp/a.wav');
    expect(mockUnlink).toHaveBeenCalledWith('/tmp/cache/voice-app-sts/a.wav');
  });

  it('throws when a table wipe fails', async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      success: false,
      data: [],
      error: 'boom',
    });

    await expect(resetLocalAppData()).rejects.toThrow('boom');
  });
});

describe('reloadAppAfterReset', () => {
  it('triggers DevSettings.reload', () => {
    reloadAppAfterReset();
    expect(mockReload).toHaveBeenCalled();
  });
});
