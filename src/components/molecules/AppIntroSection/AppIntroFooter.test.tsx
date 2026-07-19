import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { AppIntroFooter } from './AppIntroFooter';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('AppIntroFooter', () => {
  it('renders long intro body at the bottom of the home screen', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<AppIntroFooter />);
    });

    const text = tree!.root.findByType('Text' as never);
    expect(text.props.children).toBe('home.introBody');
  });
});
