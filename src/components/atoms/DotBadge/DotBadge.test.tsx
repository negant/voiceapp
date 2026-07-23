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

  it('supports inline placement and status tones', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <DotBadge visible placement="inline" tone="yellow" />,
      );
    });

    const className = String(tree!.root.findByType('View' as never).props.className);
    expect(className).toContain('bg-amber-400');
    expect(className).not.toContain('absolute');
  });
});
