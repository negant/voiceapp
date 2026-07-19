import { mixDownToMono } from '@/utils/audioBufferMix';
import type { RenderableAudioBuffer } from '@/services/audio/audioDecode';

describe('mixDownToMono', () => {
  it('returns a copy for mono input', () => {
    const samples = new Float32Array([0.25, -0.5, 1]);
    const source: RenderableAudioBuffer = {
      numberOfChannels: 1,
      length: samples.length,
      sampleRate: 44100,
      duration: samples.length / 44100,
      getChannelData: () => samples,
      copyToChannel: () => undefined,
    };

    const mono = mixDownToMono(source);
    expect(mono).toEqual(samples);
    expect(mono).not.toBe(samples);
  });

  it('snapshots each channel only once', () => {
    const left = new Float32Array([1, 0]);
    const right = new Float32Array([-1, 1]);
    const getChannelData = jest.fn((channel: number) =>
      channel === 0 ? left : right,
    );
    const source: RenderableAudioBuffer = {
      numberOfChannels: 2,
      length: 2,
      sampleRate: 44100,
      duration: 2 / 44100,
      getChannelData,
      copyToChannel: () => undefined,
    };

    mixDownToMono(source);
    expect(getChannelData).toHaveBeenCalledTimes(2);
  });

  it('averages stereo channels', () => {
    const left = new Float32Array([1, 0]);
    const right = new Float32Array([-1, 1]);
    const source: RenderableAudioBuffer = {
      numberOfChannels: 2,
      length: 2,
      sampleRate: 44100,
      duration: 2 / 44100,
      getChannelData: channel => (channel === 0 ? left : right),
      copyToChannel: () => undefined,
    };

    expect(Array.from(mixDownToMono(source))).toEqual([0, 0.5]);
  });
});
