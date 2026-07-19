jest.mock('@/services/audio/aiEffects/waveSpeed/waveSpeedSpeechToSpeech', () => ({
  convertSpeechToSpeechWithWaveSpeed: jest.fn(),
}));

import { applyWaveSpeedAiEffect } from '@/services/audio/aiEffects/waveSpeed/applyWaveSpeedAiEffect';
import { convertSpeechToSpeechWithWaveSpeed } from '@/services/audio/aiEffects/waveSpeed/waveSpeedSpeechToSpeech';

const convertMock = convertSpeechToSpeechWithWaveSpeed as jest.MockedFunction<
  typeof convertSpeechToSpeechWithWaveSpeed
>;

describe('applyWaveSpeedAiEffect', () => {
  beforeEach(() => {
    convertMock.mockReset();
    convertMock.mockResolvedValue({ mp3Path: '/tmp/wavespeed-out.mp3' });
  });

  it('returns the WaveSpeed mp3 path without local decode/encode', async () => {
    const result = await applyWaveSpeedAiEffect('file:///tmp/source.wav', {
      referenceAudioUrl: 'https://cdn.example/reference.mp3',
    });

    expect(convertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceUri: 'file:///tmp/source.wav',
        referenceAudioUrl: 'https://cdn.example/reference.mp3',
      }),
    );
    expect(result).toEqual({
      path: '/tmp/wavespeed-out.mp3',
      extension: 'mp3',
    });
  });
});
