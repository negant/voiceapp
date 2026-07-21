import ReactNativeBlobUtil from 'react-native-blob-util';

import {
  convertSpeechToSpeechWithWaveSpeed,
  WaveSpeedStsError,
} from '@/services/audio/aiEffects/waveSpeed/waveSpeedSpeechToSpeech';
import {
  WAVESPEED_MEDIA_UPLOAD_ENDPOINT,
  WAVESPEED_STS_ENDPOINT,
} from '@/services/audio/aiEffects/waveSpeed/waveSpeedConfig';

jest.mock('@/config/env', () => ({
  env: {
    waveSpeedApiKey: 'wsk_test_key',
    enableWaveSpeedSts: true,
  },
  isWaveSpeedStsConfigured: jest.fn(() => true),
}));

jest.mock('react-native-blob-util', () => {
  const fetchMock = jest.fn();
  const wrapMock = jest.fn((path: string) => `wrap:${path}`);
  return {
    __esModule: true,
    default: {
      config: jest.fn(() => ({
        fetch: fetchMock,
      })),
      wrap: wrapMock,
      fs: {
        dirs: { CacheDir: '/tmp/cache' },
        exists: jest.fn(async () => true),
        readFile: jest.fn(async () =>
          globalThis.btoa('source-audio-bytes-long-enough'),
        ),
        writeFile: jest.fn(async () => undefined),
        unlink: jest.fn(async () => undefined),
      },
      __fetchMock: fetchMock,
      __wrapMock: wrapMock,
    },
  };
});

jest.mock('@/services/audio/audioStorage', () => ({
  AUDIO_IMPORTS_DIR: '/tmp/imports',
  normalizePathForBlobUtil: (uri: string) =>
    uri.replace(/^file:\/\//, '').replace(/^file:/, ''),
}));

type BlobUtilMock = typeof ReactNativeBlobUtil & {
  __fetchMock: jest.Mock;
  __wrapMock: jest.Mock;
};

const blobUtil = ReactNativeBlobUtil as BlobUtilMock;

function mockBlobResponse(status: number, jsonBody: unknown, base64 = '') {
  return {
    info: () => ({ status }),
    json: () => jsonBody,
    base64: () => base64,
    text: () => JSON.stringify(jsonBody),
    cancel: jest.fn(),
  };
}

describe('convertSpeechToSpeechWithWaveSpeed', () => {
  beforeEach(() => {
    blobUtil.__fetchMock.mockReset();
    blobUtil.__wrapMock.mockImplementation((path: string) => `wrap:${path}`);
    (blobUtil.fs.writeFile as jest.Mock).mockClear();
  });

  it('uploads source, polls prediction, and writes mp3 output', async () => {
    const outputBase64 = globalThis.btoa('mp3-bytes-long-enough-for-validation');

    blobUtil.__fetchMock
      .mockResolvedValueOnce(
        mockBlobResponse(200, {
          data: {
            download_url: 'https://cdn.example/source.mp3',
          },
        }),
      )
      .mockResolvedValueOnce(
        mockBlobResponse(200, {
          data: {
            id: 'pred-1',
            urls: {
              get: 'https://api.wavespeed.ai/api/v3/predictions/pred-1/result',
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        mockBlobResponse(200, {
          data: {
            status: 'completed',
            outputs: ['https://cdn.example/out.mp3'],
          },
        }),
      )
      .mockResolvedValueOnce(mockBlobResponse(200, {}, outputBase64));

    const result = await convertSpeechToSpeechWithWaveSpeed({
      sourceUri: 'file:///tmp/source.mp3',
      referenceAudioUrl: 'https://cdn.example/reference.mp3',
    });

    expect(result.mp3Path).toContain('/tmp/imports/wavespeed-sts-');
    expect(result.mp3Path.endsWith('.mp3')).toBe(true);
    expect(blobUtil.fs.writeFile).toHaveBeenCalledWith(
      result.mp3Path,
      outputBase64,
      'base64',
    );

    expect(blobUtil.__fetchMock).toHaveBeenNthCalledWith(
      1,
      'POST',
      WAVESPEED_MEDIA_UPLOAD_ENDPOINT,
      expect.objectContaining({
        Authorization: 'Bearer wsk_test_key',
      }),
      expect.arrayContaining([
        expect.objectContaining({
          name: 'file',
          data: 'wrap:/tmp/source.mp3',
        }),
      ]),
    );
    expect(blobUtil.__fetchMock).toHaveBeenNthCalledWith(
      2,
      'POST',
      WAVESPEED_STS_ENDPOINT,
      expect.objectContaining({
        Authorization: 'Bearer wsk_test_key',
        'Content-Type': 'application/json',
      }),
      expect.stringContaining('https://cdn.example/source.mp3'),
    );
  });

  it('throws WaveSpeedStsError on submit failure', async () => {
    blobUtil.__fetchMock
      .mockResolvedValueOnce(
        mockBlobResponse(200, {
          data: { download_url: 'https://cdn.example/source.mp3' },
        }),
      )
      .mockResolvedValueOnce(mockBlobResponse(401, { message: 'unauthorized' }));

    await expect(
      convertSpeechToSpeechWithWaveSpeed({
        sourceUri: 'file:///tmp/source.mp3',
        referenceAudioUrl: 'https://cdn.example/reference.mp3',
      }),
    ).rejects.toBeInstanceOf(WaveSpeedStsError);
  });
});
