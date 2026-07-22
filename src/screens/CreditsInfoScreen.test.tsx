import { CreditsInfoScreen } from '@/screens/CreditsInfoScreen';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (!params) {
        return key;
      }

      return `${key}:${JSON.stringify(params)}`;
    },
    locale: 'en',
  }),
}));

jest.mock('@/hooks/useScreenTitle', () => ({
  useScreenTitle: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('@/config/env', () => ({
  env: {
    debugMode: true,
    premiumPriceUsd: 4.99,
    premiumCredits: 100,
    premiumGratisCredits: 25,
  },
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

jest.mock('@/providers/CreditsProvider', () => ({
  useCredits: () => ({
    balance: 10,
    creditsPerStartedMinute: 1,
    accountPlan: 'free',
    isPremium: false,
    isHydrated: true,
    refreshBalance: jest.fn().mockResolvedValue(10),
    setBalance: jest.fn(),
    setAccountPlan: jest.fn(),
  }),
}));

jest.mock('@/components', () => ({
  Screen: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/components/atoms/Button', () => ({
  Button: ({
    title,
    onPress,
  }: {
    title: string;
    onPress: () => void;
  }) => {
    const { Text, Pressable } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    );
  },
}));

jest.mock('lucide-react-native', () => ({
  Coins: 'Coins',
  Crown: 'Crown',
}));

describe('CreditsInfoScreen', () => {
  it('renders account sections without API or local-free copy', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<CreditsInfoScreen />);
    });

    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => String(node.props.children));

    expect(texts).toContain('credits.balanceTitle');
    expect(texts).toContain('credits.accountPlanTitle');
    expect(texts).toContain('credits.planNameFree');
    expect(texts.some(value => value.includes('credits.premiumUpgradeTitle'))).toBe(
      true,
    );
    expect(texts.some(value => value.includes('credits.premiumBonusHighlight'))).toBe(
      true,
    );
    expect(texts.some(value => value.includes('credits.planFeatureMaxFile'))).toBe(
      true,
    );
    expect(
      texts.some(value => value.includes('credits.planFeatureCombineEffects')),
    ).toBe(true);
    expect(texts.some(value => value.includes('credits.planFeatureCreditsPack'))).toBe(
      true,
    );
    expect(
      texts.some(value =>
        value.includes('credits.planFeatureCreditsRenewMonthly'),
      ),
    ).toBe(true);
    expect(texts.some(value => value.includes('credits.buyPremium'))).toBe(true);
    expect(texts).toContain('credits.billingTitle');
    expect(texts).toContain('credits.billingBody');
    expect(texts).not.toContain('credits.infoIntro');
    expect(texts).not.toContain('credits.localFreeTitle');
    expect(texts).not.toContain('credits.localFreeBody');
  });
});
