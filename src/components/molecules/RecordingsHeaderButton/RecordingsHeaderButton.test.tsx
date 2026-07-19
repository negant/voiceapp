import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { RecordingsHeaderButton } from './RecordingsHeaderButton';

jest.mock('lucide-react-native', () => ({
  FolderOpen: 'FolderOpen',
}));

describe('RecordingsHeaderButton', () => {
  function render(count: number) {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <RecordingsHeaderButton
          count={count}
          label="Your recordings"
          iconColor="#111111"
          onPress={jest.fn()}
        />,
      );
    });

    return tree!;
  }

  function countViews(tree: ReactTestRenderer.ReactTestRenderer) {
    return tree.root.findAllByType('View' as never).length;
  }

  it('shows a dot badge when there are recordings', () => {
    const withRecordings = render(4);
    const withoutRecordings = render(0);

    expect(countViews(withRecordings)).toBeGreaterThan(
      countViews(withoutRecordings),
    );
  });

  it('hides the dot badge when all recordings are deleted', () => {
    const tree = render(2);
    const viewsWithBadge = countViews(tree);

    ReactTestRenderer.act(() => {
      tree.update(
        <RecordingsHeaderButton
          count={0}
          label="Your recordings"
          iconColor="#111111"
          onPress={jest.fn()}
        />,
      );
    });

    expect(countViews(tree)).toBeLessThan(viewsWithBadge);
  });
});
