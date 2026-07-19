import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { ProcessingModal } from './ProcessingModal';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: { time?: string }) => {
      if (key === 'voiceStudio.processingElapsed' && params?.time) {
        return `${params.time} elapsed`;
      }
      return key;
    },
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

describe('ProcessingModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders processing warning and progress', () => {
    const onCancel = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ProcessingModal
          visible
          stage="rendering"
          progress={0.42}
          isCancelling={false}
          onCancel={onCancel}
        />,
      );
    });

    const textValues = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();

    expect(textValues).toContain('voiceStudio.processingTitle');
    expect(textValues).toContain('voiceStudio.processingMessage');
    expect(textValues).toContain('voiceStudio.processingStageRendering');
    expect(textValues).toContain('42%');
    expect(textValues).toContain('0:00 elapsed');

    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(2000);
    });

    const updatedValues = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();
    expect(updatedValues).toContain('0:02 elapsed');

    ReactTestRenderer.act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: 'voiceStudio.processingCancel' })
        .props.onPress();
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
