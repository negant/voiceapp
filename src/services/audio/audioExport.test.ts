import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { exportProcessedAudio } from '@/services/audio/audioExport';

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

const MediaCollection = ReactNativeBlobUtil.MediaCollection as {
  copyToMediaStore: jest.Mock;
};

describe('exportProcessedAudio', () => {
  beforeEach(() => {
    Platform.OS = 'android';
    jest.clearAllMocks();
    (ReactNativeBlobUtil.fs.exists as jest.Mock).mockResolvedValue(true);
    (ReactNativeBlobUtil.fs.mkdir as jest.Mock).mockResolvedValue(true);
    (ReactNativeBlobUtil.fs.cp as jest.Mock).mockResolvedValue(true);
    MediaCollection.copyToMediaStore.mockResolvedValue(
      'content://media/external/downloads/1',
    );
  });

  it('saves processed wav to Downloads via MediaCollection on Android', async () => {
    const result = await exportProcessedAudio({
      sourceUri:
        'file:///data/user/0/com.voiceapp/files/audio/processed/18.06.2026 22.07-kratos-processed.wav',
      fileName: '18.06.2026 22.07-kratos-processed.wav',
    });

    expect(result).toEqual({ ok: true });
    expect(MediaCollection.copyToMediaStore).toHaveBeenCalledWith(
      {
        name: '18-06-2026-22-07-kratos-processed.wav',
        parentFolder: 'VoiceApp',
        mimeType: 'audio/wav',
      },
      'Download',
      '/data/user/0/com.voiceapp/files/audio/processed/18.06.2026 22.07-kratos-processed.wav',
    );
    expect(ReactNativeBlobUtil.fs.cp).not.toHaveBeenCalled();
  });

  it('copies processed wav to Documents/VoiceApp on iOS', async () => {
    Platform.OS = 'ios';

    const result = await exportProcessedAudio({
      sourceUri: 'file:///var/mobile/Containers/Data/Application/abc/processed.wav',
      fileName: 'processed.wav',
    });

    expect(result).toEqual({ ok: true });
    expect(ReactNativeBlobUtil.fs.cp).toHaveBeenCalledWith(
      '/var/mobile/Containers/Data/Application/abc/processed.wav',
      '/mock/documents/VoiceApp/processed.wav',
    );
    expect(MediaCollection.copyToMediaStore).not.toHaveBeenCalled();
  });

  it('returns missing_file when processed output does not exist', async () => {
    (ReactNativeBlobUtil.fs.exists as jest.Mock).mockResolvedValue(false);

    const result = await exportProcessedAudio({
      sourceUri: 'file:///data/user/0/com.voiceapp/files/audio/processed/missing.wav',
      fileName: 'missing.wav',
    });

    expect(result).toEqual({ ok: false, reason: 'missing_file' });
    expect(MediaCollection.copyToMediaStore).not.toHaveBeenCalled();
  });
});
