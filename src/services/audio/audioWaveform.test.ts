import { decodeAudioFile } from '@/services/audio/audioDecode';
import {
  clearAudioWaveformCache,
  getAudioWaveformPreview,
} from '@/services/audio/audioWaveform';

jest.mock('@/services/audio/audioDecode', () => ({
  decodeAudioFile: jest.fn(),
}));

const decodeAudioFileMock = decodeAudioFile as jest.MockedFunction<
  typeof decodeAudioFile
>;

describe('audioWaveform', () => {
  beforeEach(() => {
    clearAudioWaveformCache();
    decodeAudioFileMock.mockReset();
  });

  it('builds waveform bars from decoded audio buffer', async () => {
    const channel = new Float32Array([0, 0.2, 0.8, 0.1]);
    decodeAudioFileMock.mockResolvedValue({
      numberOfChannels: 1,
      length: channel.length,
      sampleRate: 44100,
      duration: 0.01,
      getChannelData: () => channel,
    });

    const bars = await getAudioWaveformPreview('file:///tmp/voice.wav', 4);

    expect(bars).toHaveLength(4);
    expect(decodeAudioFileMock).toHaveBeenCalledTimes(1);

    const cachedBars = await getAudioWaveformPreview(
      'file:///tmp/voice.wav',
      4,
    );
    expect(cachedBars).toEqual(bars);
    expect(decodeAudioFileMock).toHaveBeenCalledTimes(1);
  });
});
