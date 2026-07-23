import { assertAiOutputAudioFileReady } from './assertAiOutputAudioFileReady';

jest.mock('react-native-blob-util', () => ({
  fs: {
    exists: jest.fn(),
    stat: jest.fn(),
  },
}));

jest.mock('@/services/audio/audioStorage', () => ({
  normalizePathForBlobUtil: (path: string) =>
    path.replace(/^file:\/\//, ''),
}));

const blobUtil = jest.requireMock('react-native-blob-util') as {
  fs: {
    exists: jest.Mock;
    stat: jest.Mock;
  };
};

describe('assertAiOutputAudioFileReady', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves when the file exists and is large enough', async () => {
    blobUtil.fs.exists.mockResolvedValue(true);
    blobUtil.fs.stat.mockResolvedValue({ size: 4096 });

    await expect(
      assertAiOutputAudioFileReady('/tmp/out.mp3'),
    ).resolves.toBeUndefined();
  });

  it('rejects when the file is missing', async () => {
    blobUtil.fs.exists.mockResolvedValue(false);

    await expect(assertAiOutputAudioFileReady('/tmp/missing.mp3')).rejects.toThrow(
      /missing/,
    );
  });

  it('rejects when the file is empty or tiny', async () => {
    blobUtil.fs.exists.mockResolvedValue(true);
    blobUtil.fs.stat.mockResolvedValue({ size: 8 });

    await expect(assertAiOutputAudioFileReady('/tmp/tiny.mp3')).rejects.toThrow(
      /too small/,
    );
  });
});
