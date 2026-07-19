import { Share } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { shareProcessedAudio } from '@/services/audio/audioExport';

describe('shareProcessedAudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ReactNativeBlobUtil.fs.exists as jest.Mock).mockResolvedValue(true);
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns missing_file when the source does not exist', async () => {
    (ReactNativeBlobUtil.fs.exists as jest.Mock).mockResolvedValue(false);

    const result = await shareProcessedAudio({
      sourceUri: 'file:///missing.wav',
      fileName: 'missing.wav',
    });

    expect(result).toEqual({ ok: false, reason: 'missing_file' });
  });

  it('shares an existing processed file', async () => {
    const result = await shareProcessedAudio({
      sourceUri: 'file:///processed/demo.wav',
      fileName: 'demo.wav',
    });

    expect(result).toEqual({ ok: true });
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('processed/demo.wav'),
        title: 'demo.wav',
      }),
    );
  });

  it('returns cancelled when the user dismisses the share sheet', async () => {
    jest.spyOn(Share, 'share').mockResolvedValue({
      action: Share.dismissedAction,
    });

    const result = await shareProcessedAudio({
      sourceUri: 'file:///processed/demo.wav',
      fileName: 'demo.wav',
    });

    expect(result).toEqual({ ok: false, reason: 'cancelled' });
  });
});
