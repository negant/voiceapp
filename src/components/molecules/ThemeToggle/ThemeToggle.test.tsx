import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { ThemeToggle } from './ThemeToggle';

const mockSetThemeMode = jest.fn().mockResolvedValue(undefined);

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: false,
    isHydrated: true,
    setThemeMode: mockSetThemeMode,
  }),
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'pl',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('lucide-react-native', () => ({
  Moon: 'Moon',
  Sun: 'Sun',
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetThemeMode.mockClear();
  });

  it('renders compact switch with sun icon in light mode', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<ThemeToggle />);
    });

    expect(tree!.root.findByType('Sun' as never)).toBeTruthy();
    expect(tree!.root.findAllByType('Moon' as never)).toHaveLength(0);
  });

  it('toggles theme on press', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<ThemeToggle />);
    });

    await ReactTestRenderer.act(() => {
      tree!.root.findByProps({ accessibilityRole: 'switch' }).props.onPress();
    });

    expect(mockSetThemeMode).toHaveBeenCalledWith('dark');
  });
});
