import { getUpdateStatusMessage } from './updateStatus';

const t = (key: string, params?: Record<string, string | number>) => {
  if (params?.version) {
    return `${key}:${params.version}`;
  }
  return key;
};

describe('getUpdateStatusMessage', () => {
  it('returns checking message', () => {
    expect(getUpdateStatusMessage(t, { state: 'checking' })).toBe(
      'settings.updateChecking',
    );
  });

  it('returns up to date message', () => {
    expect(getUpdateStatusMessage(t, { state: 'current' })).toBe(
      'settings.updateUpToDate',
    );
  });

  it('returns available update message with version', () => {
    expect(
      getUpdateStatusMessage(t, { state: 'available', version: '1.2.0' }),
    ).toBe('settings.updateAvailable:1.2.0');
  });
});
