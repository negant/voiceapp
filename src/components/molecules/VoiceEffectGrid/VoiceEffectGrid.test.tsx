import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import { VoiceEffectGrid } from './VoiceEffectGrid';

describe('VoiceEffectGrid', () => {
  it('renders each child inside a column slot', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <VoiceEffectGrid>
          <Text key="a">A</Text>
          <Text key="b">B</Text>
        </VoiceEffectGrid>,
      );
    });

    const labels = tree!.root
      .findAllByType(Text as never)
      .map(node => node.props.children);

    expect(labels).toEqual(['A', 'B']);
  });
});
