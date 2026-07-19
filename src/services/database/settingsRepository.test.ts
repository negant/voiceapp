import { parseAppLocale, parseThemeMode } from './settingsRepository';

describe('parseThemeMode', () => {
  it('returns valid theme modes', () => {
    expect(parseThemeMode('light')).toBe('light');
    expect(parseThemeMode('dark')).toBe('dark');
    expect(parseThemeMode('system')).toBe('system');
  });

  it('returns null for invalid values', () => {
    expect(parseThemeMode(null)).toBeNull();
    expect(parseThemeMode('')).toBeNull();
    expect(parseThemeMode('invalid')).toBeNull();
  });
});

describe('parseAppLocale', () => {
  it('returns valid locales', () => {
    expect(parseAppLocale('pl')).toBe('pl');
    expect(parseAppLocale('en')).toBe('en');
  });

  it('returns null for invalid values', () => {
    expect(parseAppLocale(null)).toBeNull();
    expect(parseAppLocale('')).toBeNull();
    expect(parseAppLocale('de')).toBeNull();
  });
});
