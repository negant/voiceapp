import { pickAudioFile } from '@/services/audio/audioImport';

const documentPicker = jest.requireMock('@react-native-documents/picker');

describe('pickAudioFile', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('waits briefly before opening the native picker', async () => {
    documentPicker.pick.mockResolvedValue([
      { uri: 'content://media/external/audio/1', name: 'voice.txt' },
    ]);

    const resultPromise = pickAudioFile({
      supportedFormats: ['mp3'],
      maxSizeMb: 50,
    });

    expect(documentPicker.pick).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(159);
    expect(documentPicker.pick).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(1);
    const result = await resultPromise;

    expect(documentPicker.pick).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      ok: false,
      reason: 'unsupported_format',
      detail: 'extension=txt',
    });
  });
});
