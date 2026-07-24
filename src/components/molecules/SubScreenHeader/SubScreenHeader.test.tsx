import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { SubScreenHeader } from './SubScreenHeader';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    canGoBack: () => true,
    goBack: mockGoBack,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 47, bottom: 0, left: 0, right: 0 }),
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

describe('SubScreenHeader', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
  });

  it('renders title and navigates back', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<SubScreenHeader title="Settings" />);
    });

    expect(tree!.root.findByProps({ children: 'Settings' })).toBeTruthy();

    await ReactTestRenderer.act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: 'common.back' })
        .props.onPress();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
