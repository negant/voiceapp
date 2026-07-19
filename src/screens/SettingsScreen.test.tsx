import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Switch } from 'react-native';

import { SettingsScreen } from '@/screens/SettingsScreen';

const mockNavigate = jest.fn();
const mockSetAccountPlan = jest.fn().mockResolvedValue(undefined);
const mockSetBalance = jest.fn().mockResolvedValue(undefined);

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
    balance: 10,
    setAccountPlan: mockSetAccountPlan,
    setBalance: mockSetBalance,
  }),
}));

jest.mock('@/config/env', () => ({
  env: {
    debugMode: true,
    startingCredits: 10,
    premiumPriceUsd: 4.99,
    appUsdPerStartedMinute: 0.05,
    premiumCredits: 100,
    premiumGratisCredits: 25,
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

  it('enabling premium adds pack on top of remaining free credits', async () => {
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
    expect(mockSetBalance).toHaveBeenCalledWith(135);
  });

  it('disabling premium restores free welcome credits', async () => {
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
    expect(mockSetBalance).toHaveBeenCalledWith(10);
  });
});
