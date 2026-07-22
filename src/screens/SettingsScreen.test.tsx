import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Switch } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { SettingsScreen } from '@/screens/SettingsScreen';

const mockNavigate = jest.fn();
const mockSetAccountPlan = jest.fn().mockResolvedValue(undefined);
const mockSetBalance = jest.fn().mockResolvedValue(undefined);
const mockSpendCredits = jest.fn().mockResolvedValue(0);
const mockResetLocalAppData = jest.fn().mockResolvedValue(undefined);
const mockReloadAppAfterReset = jest.fn();

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
    balance: 42,
    setAccountPlan: mockSetAccountPlan,
    setBalance: mockSetBalance,
    spendCredits: mockSpendCredits,
  }),
}));

jest.mock('@/config/env', () => ({
  env: {
    debugMode: true,
    privacyPolicyUrl: 'https://ukrywane.pl/privacy',
  },
}));

jest.mock('@/components', () => ({
  Screen: ({ children }: { children: React.ReactNode }) => children,
  AppVersionInfo: () => null,
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

jest.mock('@/services/database/resetAppData', () => ({
  resetLocalAppData: (...args: unknown[]) => mockResetLocalAppData(...args),
  reloadAppAfterReset: (...args: unknown[]) => mockReloadAppAfterReset(...args),
}));

jest.mock('@/components/molecules/ConfirmDialog', () => ({
  ConfirmDialog: ({
    visible,
    title,
    confirmLabel,
    onConfirm,
  }: {
    visible: boolean;
    title: string;
    confirmLabel: string;
    onConfirm: () => void;
  }) => {
    if (!visible) {
      return null;
    }
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={confirmLabel}
        onPress={onConfirm}>
        <Text>{title}</Text>
      </Pressable>
    );
  },
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders premium switch and developer action buttons', () => {
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
    expect(texts).toContain('settings.clearCreditsTitle');
    expect(texts).toContain('settings.clearAppDataTitle');
    expect(texts).not.toContain('settings.addCreditsTitle');
    expect(tree!.root.findAllByType(Switch)).toHaveLength(1);
    expect(tree!.root.findAllByType(Button)).toHaveLength(2);
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

  it('clear credits button spends current balance for testing', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SettingsScreen navigation={{ navigate: mockNavigate } as never} />,
      );
    });

    const clearButton = tree!.root
      .findAllByType(Button)
      .find(node => node.props.title === 'settings.clearCreditsTitle');

    await ReactTestRenderer.act(async () => {
      clearButton!.props.onPress();
    });

    expect(mockSpendCredits).toHaveBeenCalledWith(42, 'debug_clear');
    expect(mockSetBalance).not.toHaveBeenCalled();
  });

  it('reset app data confirms then wipes local state and reloads', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SettingsScreen navigation={{ navigate: mockNavigate } as never} />,
      );
    });

    const resetButton = tree!.root
      .findAllByType(Button)
      .find(node => node.props.title === 'settings.clearAppDataTitle');

    await ReactTestRenderer.act(async () => {
      resetButton!.props.onPress();
    });

    const confirm = tree!.root.findByProps({
      accessibilityLabel: 'settings.clearAppDataConfirmAction',
    });

    await ReactTestRenderer.act(async () => {
      await confirm.props.onPress();
    });

    expect(mockResetLocalAppData).toHaveBeenCalled();
    expect(mockReloadAppAfterReset).toHaveBeenCalled();
  });
});
