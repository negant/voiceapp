import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { AppIntroSection } from './AppIntroSection';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/components/atoms/Logo', () => ({
  Logo: () => null,
}));

describe('AppIntroSection', () => {
  it('renders static logo, brand name, tagline, and hero subtitle', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<AppIntroSection />);
    });

    const texts = tree!.root.findAllByType('Text' as never);
    const values = texts.map(node => node.props.children);

    expect(values).toContain('home.brandName');
    expect(values).toContain('home.tagline');
    expect(values).toContain('home.heroSubtitle');
    expect(values).not.toContain('home.introBody');
    expect(values).not.toContain('home.platformReels');
  });
});
