import { applyEffectStep } from '@/services/audio/applyEffectStep';
import { processEffectChain } from '@/services/audio/processEffectChain';

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: {
      dirs: {
        DocumentDir: '/tmp/voice-app',
      },
      exists: jest.fn().mockResolvedValue(true),
      unlink: jest.fn().mockResolvedValue(undefined),
      mkdir: jest.fn().mockResolvedValue(undefined),
    },
  },
}));

jest.mock('@/services/audio/aiEffects', () => ({
  applyAiEffect: jest.fn(),
}));

jest.mock('@/services/audio/aiEffects/waveSpeed/applyWaveSpeedAiEffect', () => ({
  discardAiTempFile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/audio/audioDecode', () => ({
  readAudioFileArrayBuffer: jest
    .fn()
    .mockResolvedValue(Uint8Array.from([1, 2, 3]).buffer),
}));

jest.mock('@/services/audio/advancedEffects', () => ({
  applyAdvancedEffect: jest.fn(),
}));

jest.mock('@/services/audio/audioDsp', () => ({
  applyAudioEffects: jest.fn(),
  writeProcessedWav: jest.fn(),
}));

const { applyAiEffect } = jest.requireMock('@/services/audio/aiEffects') as {
  applyAiEffect: jest.Mock;
};
const { applyAdvancedEffect } = jest.requireMock(
  '@/services/audio/advancedEffects',
) as { applyAdvancedEffect: jest.Mock };
const { applyAudioEffects, writeProcessedWav } = jest.requireMock(
  '@/services/audio/audioDsp',
) as { applyAudioEffects: jest.Mock; writeProcessedWav: jest.Mock };
const { readAudioFileArrayBuffer } = jest.requireMock(
  '@/services/audio/audioDecode',
) as { readAudioFileArrayBuffer: jest.Mock };

describe('applyEffectStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    applyAiEffect.mockResolvedValue({
      path: '/tmp/sts.mp3',
      extension: 'mp3',
    });
    applyAdvancedEffect.mockResolvedValue(new Uint8Array([2]));
    applyAudioEffects.mockResolvedValue(new Uint8Array([3]));
    readAudioFileArrayBuffer.mockResolvedValue(
      Uint8Array.from([1, 2, 3]).buffer,
    );
  });

  it('routes ai references to applyAiEffect and keeps mp3 bytes', async () => {
    const result = await applyEffectStep('file://demo.wav', {
      tier: 'ai',
      effectId: 'narrator',
    });

    expect(applyAiEffect).toHaveBeenCalledWith(
      'file://demo.wav',
      'narrator',
      undefined,
    );
    expect(result).toEqual({
      bytes: new Uint8Array([1, 2, 3]),
      extension: 'mp3',
    });
  });

  it('routes advanced references to applyAdvancedEffect', async () => {
    const result = await applyEffectStep('file://demo.wav', {
      tier: 'advanced',
      effectId: 'hall',
    });

    expect(applyAdvancedEffect).toHaveBeenCalledWith(
      'file://demo.wav',
      'hall',
      expect.objectContaining({ pitchStorage: undefined }),
    );
    expect(result.extension).toBe('wav');
  });

  it('routes basic references to applyAudioEffects with preset values', async () => {
    await applyEffectStep('file://demo.wav', {
      tier: 'basic',
      presetId: 'robot',
    });

    expect(applyAudioEffects).toHaveBeenCalledWith(
      'file://demo.wav',
      expect.objectContaining({ pitch: expect.any(Number) }),
      expect.objectContaining({ voicePresetId: 'robot' }),
    );
  });
});

describe('processEffectChain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    applyAiEffect.mockResolvedValue({
      path: '/tmp/sts.mp3',
      extension: 'mp3',
    });
    applyAdvancedEffect.mockResolvedValue(new Uint8Array([20]));
    applyAudioEffects.mockResolvedValue(new Uint8Array([30]));
    writeProcessedWav.mockResolvedValue(undefined);
    readAudioFileArrayBuffer.mockResolvedValue(
      Uint8Array.from([10]).buffer,
    );
  });

  it('applies the second effect on top of the first effect output', async () => {
    const result = await processEffectChain('file://source.wav', [
      { tier: 'basic', presetId: 'robot' },
      { tier: 'advanced', effectId: 'hall' },
    ]);

    expect(applyAudioEffects).toHaveBeenCalledTimes(1);
    expect(applyAdvancedEffect).toHaveBeenCalledTimes(1);
    expect(applyAdvancedEffect.mock.calls[0][0]).toContain('file://');
    expect(writeProcessedWav).toHaveBeenCalled();
    expect(result).toEqual({
      bytes: new Uint8Array([20]),
      extension: 'wav',
    });
  });
});
