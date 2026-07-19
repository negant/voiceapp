import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { SuccessDialog } from './SuccessDialog';

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

describe('SuccessDialog', () => {
  it('renders title and message when visible', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SuccessDialog
          visible
          title="Preset ready"
          message="My preset was saved."
          onClose={jest.fn()}
        />,
      );
    });

    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();

    expect(texts).toContain('Preset ready');
    expect(texts).toContain('My preset was saved.');
  });

  it('calls onClose when confirm button is pressed', () => {
    const onClose = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SuccessDialog
          visible
          title="Done"
          message="All good."
          confirmLabel="Got it"
          onClose={onClose}
        />,
      );
    });

    ReactTestRenderer.act(() => {
      tree!.root.findByProps({ title: 'Got it' }).props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
