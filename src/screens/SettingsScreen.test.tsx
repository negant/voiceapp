import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Switch } from 'react-native';

import { SettingsScreen } from '@/screens/SettingsScreen';

const mockNavigate = jest.fn();
const mockSetAccountPlan = jest.fn().mockResolvedValue(undefined);

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
  }),
}));

jest.mock('@/hooks/useScreenTitle', () => ({
  useScreenTitle: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@/providers/CreditsProvider', () => ({
  useCredits: () => ({
    isPremium: false,
    setAccountPlan: mockSetAccountPlan,
  }),
}));

jest.mock('@/config/env', () => ({
  env: {
    debugMode: true,
  },
}));

jest.mock('@/components', () => ({
  Screen: ({ children }: { children: React.ReactNode }) => children,
  AppVersionInfo: () => null,
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders only premium developer switch', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SettingsScreen navigation={{ navigate: mockNavigate } as never} />,
      );
    });

    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => String(node.props.children));

    expect(texts).toContain('settings.developerSection');
    expect(texts).toContain('settings.enablePremiumTitle');
    expect(texts).not.toContain('settings.clearCreditsTitle');
    expect(texts).not.toContain('settings.addCreditsTitle');
    expect(tree!.root.findAllByType(Switch)).toHaveLength(1);
  });

  it('enabling premium delegates to setAccountPlan (API/local pack)', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SettingsScreen navigation={{ navigate: mockNavigate } as never} />,
      );
    });

    const [premiumSwitch] = tree!.root.findAllByType(Switch);

    await ReactTestRenderer.act(async () => {
      premiumSwitch.props.onValueChange(true);
    });

    expect(mockSetAccountPlan).toHaveBeenCalledWith('premium');
  });

  it('disabling premium sets free plan via setAccountPlan', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SettingsScreen navigation={{ navigate: mockNavigate } as never} />,
      );
    });

    const [premiumSwitch] = tree!.root.findAllByType(Switch);

    await ReactTestRenderer.act(async () => {
      premiumSwitch.props.onValueChange(false);
    });

    expect(mockSetAccountPlan).toHaveBeenCalledWith('free');
  });
});
