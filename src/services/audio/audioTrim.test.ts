import { decodeAudioFile } from '@/services/audio/audioDecode';
import { getAudioDurationSec } from '@/services/audio/getAudioDuration';
import { deleteStoredAudioFile } from '@/services/audio/audioStorage';
import {
  prepareAiSourceForSts,
  sliceRenderableAudioBuffer,
  trimAudioFileIfNeeded,
} from '@/services/audio/audioTrim';
import { mixDownToMonoAsync } from '@/utils/audioBufferMix';
import { encodeAudioBufferToWavBytesAsync } from '@/utils/wavEncoder';
import { writeBinaryFile } from '@/utils/binaryFile';

jest.mock('@/services/audio/audioDecode', () => ({
  decodeAudioFile: jest.fn(),
}));

jest.mock('@/utils/audioBufferMix', () => ({
  mixDownToMonoAsync: jest.fn(),
}));

jest.mock('@/utils/wavEncoder', () => ({
  encodeAudioBufferToWavBytesAsync: jest.fn(),
  wavBytesToBase64: jest.fn((bytes: Uint8Array) => `base64:${bytes.byteLength}`),
}));

jest.mock('@/utils/binaryFile', () => ({
  writeBinaryFile: jest.fn(),
}));

jest.mock('@/services/audio/getAudioDuration', () => ({
  getAudioDurationSec: jest.fn(),
}));

jest.mock('@/services/audio/audioStorage', () => ({
  AUDIO_IMPORTS_DIR: '/mock/imports',
  deleteStoredAudioFile: jest.fn().mockResolvedValue(undefined),
  ensureAudioDirs: jest.fn().mockResolvedValue(undefined),
  sanitizeImportFileName: (name: string) => name,
  toFileUri: (path: string) => `file://${path}`,
}));

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: {
      stat: jest.fn().mockResolvedValue({ size: 4096 }),
    },
  },
}));

const sourceFile = {
  uri: 'file:///mock/source.mp3',
  name: 'podcast.mp3',
  sizeBytes: 12_000_000,
  durationSec: 900,
  extension: 'mp3',
};

function createBuffer(durationSec: number, sampleRate = 44100) {
  const length = Math.ceil(durationSec * sampleRate);
  return {
    numberOfChannels: 1,
    length,
    sampleRate,
    duration: durationSec,
    getChannelData: () => new Float32Array(length).fill(0.1),
    copyToChannel: jest.fn(),
  };
}

describe('sliceRenderableAudioBuffer', () => {
  it('returns the original buffer when within the limit', () => {
    const buffer = createBuffer(30);
    const result = sliceRenderableAudioBuffer(buffer, 600);
    expect(result.trimmed).toBe(false);
    expect(result.buffer.length).toBe(buffer.length);
  });

  it('slices samples to the max duration', () => {
    const buffer = createBuffer(900);
    const result = sliceRenderableAudioBuffer(buffer, 600);
    expect(result.trimmed).toBe(true);
    expect(result.buffer.duration).toBeCloseTo(600, 0);
    expect(result.buffer.length).toBe(600 * 44100);
  });
});

describe('trimAudioFileIfNeeded', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (decodeAudioFile as jest.Mock).mockResolvedValue(createBuffer(900));
    (mixDownToMonoAsync as jest.Mock).mockResolvedValue(
      new Float32Array(600 * 44100).fill(0.1),
    );
    (encodeAudioBufferToWavBytesAsync as jest.Mock).mockResolvedValue(
      new Uint8Array(2048),
    );
    (writeBinaryFile as jest.Mock).mockResolvedValue(undefined);
    (getAudioDurationSec as jest.Mock).mockResolvedValue(600);
  });

  it('skips work when duration metadata is already within the limit', async () => {
    const result = await trimAudioFileIfNeeded(
      { ...sourceFile, durationSec: 120 },
      600,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.trimmed).toBe(false);
      expect(result.file).toEqual({ ...sourceFile, durationSec: 120 });
    }
    expect(decodeAudioFile).not.toHaveBeenCalled();
  });

  it('writes a trimmed wav when duration exceeds the limit', async () => {
    const result = await trimAudioFileIfNeeded(sourceFile, 600);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.trimmed).toBe(true);
      expect(result.file.durationSec).toBe(600);
      expect(result.file.extension).toBe('wav');
      expect(result.originalDurationSec).toBe(900);
    }
    expect(writeBinaryFile).toHaveBeenCalled();
    expect(deleteStoredAudioFile).toHaveBeenCalled();
  });

  it('keeps the source file when replaceSource is false', async () => {
    const result = await trimAudioFileIfNeeded(sourceFile, 600, {
      outputSuffix: 'process-trim',
      replaceSource: false,
    });

    expect(result.ok).toBe(true);
    expect(deleteStoredAudioFile).not.toHaveBeenCalled();
  });
});

describe('prepareAiSourceForSts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (decodeAudioFile as jest.Mock).mockResolvedValue(createBuffer(11.376));
    (mixDownToMonoAsync as jest.Mock).mockResolvedValue(
      new Float32Array(10 * 44100).fill(0.1),
    );
    (encodeAudioBufferToWavBytesAsync as jest.Mock).mockResolvedValue(
      new Uint8Array(2048),
    );
    (writeBinaryFile as jest.Mock).mockResolvedValue(undefined);
  });

  it('reuses the original file when duration is within the AI limit', async () => {
    const result = await prepareAiSourceForSts(
      { ...sourceFile, durationSec: 8 },
      10,
    );

    expect(result).toEqual({
      ok: true,
      mode: 'file',
      sourceUri: sourceFile.uri,
      trimmed: false,
    });
    expect(decodeAudioFile).not.toHaveBeenCalled();
  });

  it('returns base64 audio when the clip exceeds the AI limit', async () => {
    const result = await prepareAiSourceForSts(
      { ...sourceFile, durationSec: 11 },
      10,
    );

    expect(result.ok).toBe(true);
    if (result.ok && result.mode === 'base64') {
      expect(result.trimmed).toBe(true);
      expect(result.audioBase64).toBe('base64:2048');
      expect(result.durationSec).toBeCloseTo(10, 0);
    }
    expect(decodeAudioFile).toHaveBeenCalled();
  });
});
