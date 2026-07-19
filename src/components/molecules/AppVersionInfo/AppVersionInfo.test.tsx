import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

import { AppVersionInfo } from './AppVersionInfo';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('@/services/updates', () => ({
  fetchAppUpdateStatus: jest.fn().mockResolvedValue({ state: 'current' }),
  getUpdateStatusMessage: (_t: unknown, status: { state: string }) =>
    status.state === 'current' ? 'settings.updateUpToDate' : 'settings.updateChecking',
}));

jest.mock('@/providers/CreditsProvider', () => ({
  useCredits: () => ({
    deviceId: '11111111-2222-4333-8444-555555555555',
  }),
}));

describe('AppVersionInfo', () => {
  it('renders version, update, and device id rows', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      tree = ReactTestRenderer.create(<AppVersionInfo />);
      await Promise.resolve();
    });

    const texts = tree!.root.findAllByType('Text' as never);
    const values = texts.map(node => node.props.children).flat();

    expect(values).toContain('settings.aboutSection');
    expect(values).toContain('settings.versionLabel');
    expect(values).toContain('0.0.1');
    expect(values).toContain('settings.updateUpToDate');
    expect(values).toContain('settings.deviceIdLabel');
    expect(values).toContain('11111111-2222-4333-8444-555555555555');
    expect(values).toContain('settings.deviceIdHint');
  });
});
