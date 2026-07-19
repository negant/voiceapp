import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { Logo } from './Logo';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, isHydrated: true }),
}));

jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  Stop: 'Stop',
  Rect: 'Rect',
  G: 'G',
}));

describe('Logo', () => {
  it('renders background rect in mark variant', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Logo variant="mark" size={96} />);
    });

    const rects = tree!.root.findAllByType('Rect' as never);
    // Background rect plus nine waveform bars.
    expect(rects).toHaveLength(10);
  });

  it('omits background rect in plain variant', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Logo variant="plain" size={96} />);
    });

    const rects = tree!.root.findAllByType('Rect' as never);
    // Plain variant renders waveform bars only.
    expect(rects).toHaveLength(9);
  });
});
