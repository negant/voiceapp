import React from 'react';
import { Platform } from 'react-native';
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
  const originalOS = Platform.OS;

  beforeEach(() => {
    mockGoBack.mockClear();
    Platform.OS = originalOS;
  });

  afterEach(() => {
    Platform.OS = originalOS;
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

  it('places back on the right and uses a taller bar on Android', async () => {
    Platform.OS = 'android';

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<SubScreenHeader title="Settings" />);
    });

    const row = tree!.root.findAllByType('View').find(node => {
      const className = node.props.className as string | undefined;
      return typeof className === 'string' && className.includes('h-14');
    });
    expect(row).toBeTruthy();

    const backButton = tree!.root.findByProps({
      accessibilityLabel: 'common.back',
    });
    expect(backButton.props.className).toContain('ml-1');
  });
});
