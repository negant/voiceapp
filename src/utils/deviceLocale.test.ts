import {
  getDeviceLocaleTag,
  resolveDeviceAppLocale,
  resolveSupportedLocale,
} from './deviceLocale';

describe('resolveSupportedLocale', () => {
  it('maps polish tags to pl', () => {
    expect(resolveSupportedLocale('pl')).toBe('pl');
    expect(resolveSupportedLocale('pl-PL')).toBe('pl');
    expect(resolveSupportedLocale('pl_PL')).toBe('pl');
  });

  it('maps english tags to en', () => {
    expect(resolveSupportedLocale('en')).toBe('en');
    expect(resolveSupportedLocale('en-US')).toBe('en');
    expect(resolveSupportedLocale('en_GB')).toBe('en');
  });

  it('falls back to english for unsupported languages', () => {
    expect(resolveSupportedLocale('de-DE')).toBe('en');
    expect(resolveSupportedLocale('fr')).toBe('en');
    expect(resolveSupportedLocale(null)).toBe('en');
    expect(resolveSupportedLocale('')).toBe('en');
  });
});

describe('resolveDeviceAppLocale', () => {
  const originalIntl = Intl.DateTimeFormat;

  afterEach(() => {
    Intl.DateTimeFormat = originalIntl;
  });

  it('uses the device locale when supported', () => {
    Intl.DateTimeFormat = jest.fn(
      () =>
        ({
          resolvedOptions: () => ({ locale: 'pl-PL' }),
        }) as Intl.DateTimeFormat,
    );

    expect(getDeviceLocaleTag()).toBe('pl-PL');
    expect(resolveDeviceAppLocale()).toBe('pl');
  });

  it('falls back to english when device locale is unsupported', () => {
    Intl.DateTimeFormat = jest.fn(
      () =>
        ({
          resolvedOptions: () => ({ locale: 'de-DE' }),
        }) as Intl.DateTimeFormat,
    );

    expect(resolveDeviceAppLocale()).toBe('en');
  });
});
