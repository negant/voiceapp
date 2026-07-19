import {
  resampleByPlaybackRate,
  resampleMono,
  VOICE_PROCESSING_SAMPLE_RATE,
} from '@/utils/audioResample';

describe('resampleMono', () => {
  it('halves length when downsampling 2:1', () => {
    const input = new Float32Array([1, 0, -1, 0]);
    const output = resampleMono(input, 44_100, 22_050);

    expect(output.length).toBe(2);
  });

  it('returns a copy when rates match', () => {
    const input = new Float32Array([0.25, 0.5]);
    const output = resampleMono(input, VOICE_PROCESSING_SAMPLE_RATE, VOICE_PROCESSING_SAMPLE_RATE);

    expect(output).toEqual(input);
    expect(output).not.toBe(input);
  });
});

describe('resampleByPlaybackRate', () => {
  it('shortens audio when playback rate is above 1', () => {
    const input = new Float32Array([0, 0.5, 1, 0.5, 0, -0.5, -1, -0.5]);
    const output = resampleByPlaybackRate(input, 2);

    expect(output.length).toBe(4);
  });
});
