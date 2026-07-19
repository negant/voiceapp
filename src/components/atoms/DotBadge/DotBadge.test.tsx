import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { DotBadge } from './DotBadge';

describe('DotBadge', () => {
  it('renders nothing when not visible', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<DotBadge visible={false} />);
    });

    expect(tree!.toJSON()).toBeNull();
  });

  it('renders the dot when visible', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<DotBadge visible />);
    });

    expect(tree!.toJSON()).not.toBeNull();
  });
});
