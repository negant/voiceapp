import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { Button } from './Button';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, isHydrated: true }),
}));

describe('Button', () => {
  it('renders optional icon next to title', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Button
          title="Record"
          icon={<Text testID="button-icon">icon</Text>}
          onPress={jest.fn()}
        />,
      );
    });

    expect(tree!.root.findByProps({ testID: 'button-icon' })).toBeTruthy();
    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();
    expect(texts).toContain('Record');
  });

  it('renders icon-only button without title text', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Button
          icon={<Text testID="icon-only">icon</Text>}
          accessibilityLabel="Play"
          onPress={jest.fn()}
        />,
      );
    });

    expect(tree!.root.findByProps({ testID: 'icon-only' })).toBeTruthy();
    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat()
      .filter(Boolean);
    expect(texts).not.toContain('Play');
  });
});
