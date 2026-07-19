import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { AnimatedLogo } from './AnimatedLogo';

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

describe('AnimatedLogo', () => {
  it('renders animated waveform bars in mark variant', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<AnimatedLogo variant="mark" size={96} />);
    });

    const rects = tree!.root.findAllByType('Rect' as never);
    expect(rects).toHaveLength(10);
  });
});
