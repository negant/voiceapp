import {
  computeWaveformBars,
  MAX_WAVEFORM_BAR_HEIGHT,
  MIN_WAVEFORM_BAR_HEIGHT,
  mixDownToMono,
} from './waveformPreview';

describe('waveformPreview', () => {
  it('computes taller bars for louder segments', () => {
    const samples = new Float32Array(100);
    samples.fill(0.1, 0, 50);
    samples.fill(0.9, 50, 100);

    const bars = computeWaveformBars(samples, 2);

    expect(bars).toHaveLength(2);
    expect(bars[0]).toBeLessThan(bars[1]);
    expect(bars[1]).toBe(MAX_WAVEFORM_BAR_HEIGHT);
  });

  it('returns minimum height bars for silent audio', () => {
    const bars = computeWaveformBars(new Float32Array(32), 8);

    expect(bars).toEqual(Array(8).fill(MIN_WAVEFORM_BAR_HEIGHT));
  });

  it('mixes stereo channels into mono preview data', () => {
    const left = new Float32Array([1, 0]);
    const right = new Float32Array([0, 1]);

    const mono = mixDownToMono(
      channel => (channel === 0 ? left : right),
      2,
      2,
    );

    expect(Array.from(mono)).toEqual([0.5, 0.5]);
  });
});
