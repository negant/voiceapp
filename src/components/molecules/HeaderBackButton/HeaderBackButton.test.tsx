import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { HeaderBackButton } from './HeaderBackButton';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    canGoBack: () => true,
    goBack: mockGoBack,
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: 'ChevronLeft',
}));

describe('HeaderBackButton', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
  });

  it('navigates back on press', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<HeaderBackButton />);
    });

    await ReactTestRenderer.act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: 'common.back' })
        .props.onPress();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
