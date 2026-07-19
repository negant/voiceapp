import {
  formatSupportedFormatsList,
  getAudioExtension,
  isSupportedAudioExtension,
  isWithinMaxUploadSize,
} from './audioFile';

describe('getAudioExtension', () => {
  it('returns lowercase extension', () => {
    expect(getAudioExtension('track.MP3')).toBe('mp3');
  });

  it('returns empty string when no extension', () => {
    expect(getAudioExtension('noextension')).toBe('');
  });
});

describe('isSupportedAudioExtension', () => {
  const formats = ['mp3', 'wav'] as const;

  it('returns true for supported format', () => {
    expect(isSupportedAudioExtension('mp3', formats)).toBe(true);
  });

  it('is case insensitive', () => {
    expect(isSupportedAudioExtension('WAV', formats)).toBe(true);
  });

  it('returns false for unsupported format', () => {
    expect(isSupportedAudioExtension('flac', formats)).toBe(false);
  });
});

describe('formatSupportedFormatsList', () => {
  it('returns uppercase comma-separated labels', () => {
    expect(formatSupportedFormatsList(['mp3', 'wav', 'm4a'])).toBe(
      'MP3, WAV, M4A',
    );
  });
});

describe('isWithinMaxUploadSize', () => {
  it('returns true when within limit', () => {
    expect(isWithinMaxUploadSize(10 * 1024 * 1024, 50)).toBe(true);
  });

  it('returns false when over limit', () => {
    expect(isWithinMaxUploadSize(51 * 1024 * 1024, 50)).toBe(false);
  });

  it('returns false for invalid input', () => {
    expect(isWithinMaxUploadSize(-1, 50)).toBe(false);
    expect(isWithinMaxUploadSize(100, 0)).toBe(false);
  });
});
