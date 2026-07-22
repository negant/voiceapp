import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { useCredits } from '@/providers/CreditsProvider';

import { WelcomeCreditsPrompt } from './WelcomeCreditsPrompt';

const mockDismiss = jest.fn().mockResolvedValue(undefined);

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: { count?: number }) =>
      params?.count !== undefined ? `${key}:${params.count}` : key,
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

jest.mock('@/providers/CreditsProvider', () => ({
  useCredits: jest.fn(),
}));

jest.mock('@/components/molecules/SuccessDialog', () => ({
  SuccessDialog: ({
    visible,
    title,
    message,
    confirmLabel,
    onClose,
  }: {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onClose: () => void;
  }) => {
    if (!visible) {
      return null;
    }
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={onClose}>
        <Text>{title}</Text>
        <Text>{message}</Text>
        <Text>{confirmLabel}</Text>
      </Pressable>
    );
  },
}));

const mockUseCredits = useCredits as jest.Mock;

describe('WelcomeCreditsPrompt', () => {
  beforeEach(() => {
    mockDismiss.mockClear();
  });

  it('renders nothing when there is no welcome grant', () => {
    mockUseCredits.mockReturnValue({
      welcomeCreditsGrant: null,
      dismissWelcomeCreditsGrant: mockDismiss,
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<WelcomeCreditsPrompt />);
    });

    expect(tree!.toJSON()).toBeNull();
  });

  it('shows grant dialog and dismisses on confirm', async () => {
    mockUseCredits.mockReturnValue({
      welcomeCreditsGrant: 10,
      dismissWelcomeCreditsGrant: mockDismiss,
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<WelcomeCreditsPrompt />);
    });

    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => String(node.props.children));

    expect(texts).toContain('credits.welcomeGrantTitle');
    expect(texts).toContain('credits.welcomeGrantMessage:10');
    expect(texts).toContain('credits.welcomeGrantAction');

    await ReactTestRenderer.act(async () => {
      tree!.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
    });

    expect(mockDismiss).toHaveBeenCalled();
  });
});
