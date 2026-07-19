import {
  deleteStoredAudioFile,
  normalizePathForBlobUtil,
  sanitizeImportFileName,
  sanitizeExportFileName,
  toFileUri,
  toFsPath,
} from '@/services/audio/audioStorage';

describe('audioStorage paths', () => {
  it('normalizes Android file URIs with a missing leading slash', () => {
    expect(
      normalizePathForBlobUtil(
        'file://data/user/0/com.voiceapp/files/uuid/song.mp3',
      ),
    ).toBe('/data/user/0/com.voiceapp/files/uuid/song.mp3');
  });

  it('normalizes standard file URIs', () => {
    expect(
      normalizePathForBlobUtil('file:///data/user/0/com.voiceapp/files/song.mp3'),
    ).toBe('/data/user/0/com.voiceapp/files/song.mp3');
  });

  it('decodes percent-encoded file names', () => {
    expect(
      normalizePathForBlobUtil(
        'file:///data/user/0/com.voiceapp/files/my%20song.mp3',
      ),
    ).toBe('/data/user/0/com.voiceapp/files/my song.mp3');
  });

  it('passes content URIs through unchanged', () => {
    const uri = 'content://media/external/audio/media/123';
    expect(normalizePathForBlobUtil(uri)).toBe(uri);
  });

  it('toFsPath delegates to normalizePathForBlobUtil', () => {
    expect(toFsPath('file://data/user/0/app/files/a.mp3')).toBe(
      '/data/user/0/app/files/a.mp3',
    );
  });

  it('toFileUri keeps absolute paths as file URIs', () => {
    expect(toFileUri('/data/user/0/app/files/a.mp3')).toBe(
      'file:///data/user/0/app/files/a.mp3',
    );
  });

  it('sanitizeImportFileName removes unsafe characters', () => {
    expect(sanitizeImportFileName('my/track?.mp3')).toBe('my_track_.mp3');
    expect(sanitizeImportFileName('18.06.2026 22.07.wav')).toBe(
      '18.06.2026_22.07.wav',
    );
    expect(sanitizeImportFileName('   ')).toBe('audio.mp3');
  });

  it('sanitizeExportFileName slugifies names for export', () => {
    expect(
      sanitizeExportFileName('18.06.2026 22.07-kratos-processed.wav'),
    ).toBe('18-06-2026-22-07-kratos-processed.wav');
  });
});

describe('deleteStoredAudioFile', () => {
  const ReactNativeBlobUtil = jest.requireMock('react-native-blob-util').default;

  beforeEach(() => {
    jest.clearAllMocks();
    ReactNativeBlobUtil.fs.exists.mockResolvedValue(true);
    ReactNativeBlobUtil.fs.unlink.mockResolvedValue(true);
  });

  it('unlinks existing local files', async () => {
    await deleteStoredAudioFile('file:///data/user/0/app/files/song.mp3');

    expect(ReactNativeBlobUtil.fs.exists).toHaveBeenCalledWith(
      '/data/user/0/app/files/song.mp3',
    );
    expect(ReactNativeBlobUtil.fs.unlink).toHaveBeenCalledWith(
      '/data/user/0/app/files/song.mp3',
    );
  });

  it('skips content URIs', async () => {
    await deleteStoredAudioFile('content://media/external/audio/1');

    expect(ReactNativeBlobUtil.fs.exists).not.toHaveBeenCalled();
    expect(ReactNativeBlobUtil.fs.unlink).not.toHaveBeenCalled();
  });
});
