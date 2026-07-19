import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { AppAlert } from './AppAlert';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, isHydrated: true }),
}));

describe('AppAlert', () => {
  it('renders title and message when visible', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AppAlert
          visible
          title="No internet"
          message="You are offline."
          variant="warning"
          iconHint="offline"
          onClose={jest.fn()}
        />,
      );
    });

    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();

    expect(texts).toContain('No internet');
    expect(texts).toContain('You are offline.');
  });

  it('applies readable theme text colors for warning variant', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AppAlert
          visible
          title="Warning"
          message="Check this."
          variant="warning"
          onClose={jest.fn()}
        />,
      );
    });

    const texts = tree!.root.findAllByType('Text' as never);
    const title = texts.find(node => node.props.children === 'Warning');
    const message = texts.find(node => node.props.children === 'Check this.');

    expect(title?.props.style).toEqual(
      expect.objectContaining({ color: '#1A1A2E' }),
    );
    expect(message?.props.style).toEqual(
      expect.objectContaining({ color: '#6B7280' }),
    );
  });
});
