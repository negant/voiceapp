import { computeRecordingLevel } from '@/utils/recordingLevel';

describe('computeRecordingLevel', () => {
  function bufferFrom(samples: number[]) {
    return {
      numberOfChannels: 1,
      getChannelData: () => Float32Array.from(samples),
    };
  }

  it('returns 0 for silence', () => {
    expect(computeRecordingLevel(bufferFrom([0, 0, 0, 0]))).toBe(0);
  });

  it('returns higher values for louder input', () => {
    const quiet = computeRecordingLevel(bufferFrom([0.02, -0.02, 0.01]));
    const loud = computeRecordingLevel(bufferFrom([0.4, -0.35, 0.3]));

    expect(loud).toBeGreaterThan(quiet);
    expect(loud).toBeLessThanOrEqual(1);
  });
});
