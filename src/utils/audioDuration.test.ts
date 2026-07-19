import {
  formatAudioDuration,
  formatFileSize,
  isWithinDemoDuration,
} from './audioDuration';

describe('formatAudioDuration', () => {
  it('formats mm:ss', () => {
    expect(formatAudioDuration(0)).toBe('0:00');
    expect(formatAudioDuration(28)).toBe('0:28');
    expect(formatAudioDuration(90)).toBe('1:30');
  });
});

describe('isWithinDemoDuration', () => {
  it('allows unknown duration until metadata is available', () => {
    expect(isWithinDemoDuration(null)).toBe(true);
    expect(isWithinDemoDuration(undefined)).toBe(true);
  });

  it('enforces the max duration', () => {
    expect(isWithinDemoDuration(600, 600)).toBe(true);
    expect(isWithinDemoDuration(601, 600)).toBe(false);
    expect(isWithinDemoDuration(0)).toBe(false);
  });
});

describe('formatFileSize', () => {
  it('formats bytes and kilobytes', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
