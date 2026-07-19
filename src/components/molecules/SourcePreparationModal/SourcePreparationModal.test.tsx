import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { SourcePreparationModal } from './SourcePreparationModal';

describe('SourcePreparationModal', () => {
  it('shows preparation copy while visible', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<SourcePreparationModal visible />);
    });

    const textValues = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children);

    expect(textValues).toContain('voiceStudio.sourcePreparingTitle');
    expect(textValues).toContain('voiceStudio.sourcePreparingMessage');
  });
});
