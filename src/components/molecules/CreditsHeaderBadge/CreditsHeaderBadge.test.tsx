import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { useCredits } from '@/providers/CreditsProvider';

import { CreditsHeaderBadge } from './CreditsHeaderBadge';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: { count?: number }) =>
      params?.count !== undefined ? `${key}:${params.count}` : key,
    locale: 'en',
  }),
}));

jest.mock('@/providers/CreditsProvider', () => ({
  useCredits: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  Coins: 'Coins',
}));

const mockUseCredits = useCredits as jest.Mock;

describe('CreditsHeaderBadge', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseCredits.mockReturnValue({
      balance: 500,
      isPremium: true,
      creditsPerStartedMinute: 1,
      isHydrated: true,
      refreshBalance: jest.fn(),
      setBalance: jest.fn(),
    });
  });

  it('renders credit balance when premium is enabled', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<CreditsHeaderBadge />);
    });

    const text = tree!.root.findByType('Text' as never);
    expect(text.props.children).toBe('500');

    const badge = tree!.root.findByProps({
      accessibilityLabel: 'accessibility.openCreditsInfo',
      accessibilityHint: 'accessibility.creditsBalance:500',
    });
    expect(badge).toBeTruthy();
  });

  it('renders free-plan balance when credits remain', () => {
    mockUseCredits.mockReturnValue({
      balance: 10,
      isPremium: false,
      isHydrated: true,
      refreshBalance: jest.fn(),
      setBalance: jest.fn(),
    });

    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<CreditsHeaderBadge />);
    });

    const text = tree!.root.findByType('Text' as never);
    expect(text.props.children).toBe('10');
  });

  it('renders Buy Premium when free and balance is empty', () => {
    mockUseCredits.mockReturnValue({
      balance: 0,
      isPremium: false,
      isHydrated: true,
      refreshBalance: jest.fn(),
      setBalance: jest.fn(),
    });

    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<CreditsHeaderBadge />);
    });

    const text = tree!.root.findByType('Text' as never);
    expect(text.props.children).toBe('credits.buyPremium');

    const badge = tree!.root.findByProps({
      accessibilityLabel: 'accessibility.buyPremium',
      accessibilityHint: 'accessibility.buyPremium',
    });
    expect(badge).toBeTruthy();
  });

  it('navigates to credits info on press', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<CreditsHeaderBadge />);
    });

    ReactTestRenderer.act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: 'accessibility.openCreditsInfo' })
        .props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('CreditsInfo');
  });

  it('renders nothing before hydration', () => {
    mockUseCredits.mockReturnValue({
      balance: 0,
      isPremium: false,
      isHydrated: false,
      refreshBalance: jest.fn(),
      setBalance: jest.fn(),
    });

    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<CreditsHeaderBadge />);
    });

    expect(tree!.toJSON()).toBeNull();
  });
});
