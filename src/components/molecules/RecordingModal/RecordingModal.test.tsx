import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('@/components/molecules/RecordingModal/RecordingVisualizer', () => {
  const mockReact = jest.requireActual('react');
  const { Pressable } = jest.requireActual('react-native');

  function MockRecordingVisualizer({
    isRecording,
    onStart,
    onStop,
  }: {
    isRecording: boolean;
    onStart: () => void;
    onStop: () => void;
  }) {
    return mockReact.createElement(Pressable, {
      accessibilityRole: 'button',
      accessibilityLabel: isRecording
        ? 'voiceStudio.recordingStop'
        : 'voiceStudio.recordingStart',
      onPress: isRecording ? onStop : onStart,
    });
  }

  return { RecordingVisualizer: MockRecordingVisualizer };
});

import { RecordingModal } from './RecordingModal';

describe('RecordingModal', () => {
  it('shows mic start control when idle', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <RecordingModal
          visible
          isRecording={false}
          isFinalizing={false}
          isPreparingSource={false}
          elapsedSec={0}
          maxDurationSec={30}
          recordingLevel={0}
          onStart={jest.fn()}
          onStop={jest.fn()}
          onCancel={jest.fn()}
        />,
      );
    });

    const labels = tree!.root
      .findAllByProps({ accessibilityRole: 'button' })
      .map(node => node.props.accessibilityLabel);

    expect(labels).toContain('voiceStudio.recordingStart');
  });

  it('shows stop control while recording', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <RecordingModal
          visible
          isRecording
          isFinalizing={false}
          isPreparingSource={false}
          elapsedSec={5}
          maxDurationSec={30}
          recordingLevel={0.6}
          onStart={jest.fn()}
          onStop={jest.fn()}
          onCancel={jest.fn()}
        />,
      );
    });

    const labels = tree!.root
      .findAllByProps({ accessibilityRole: 'button' })
      .map(node => node.props.accessibilityLabel);

    expect(labels).toContain('voiceStudio.recordingStop');
  });
});
