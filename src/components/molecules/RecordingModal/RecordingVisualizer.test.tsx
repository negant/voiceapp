import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { RecordingVisualizer } from './RecordingVisualizer';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View },
    View,
    cancelAnimation: jest.fn(),
    createAnimatedComponent: (Component: unknown) => Component,
    useAnimatedStyle: (updater: () => object) => updater(),
    useSharedValue: (initial: number) => ({ value: initial }),
    withRepeat: (value: number) => value,
    withTiming: (value: number) => value,
    Easing: {
      inOut: () => 'ease',
      sin: 'sin',
    },
  };
});

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('lucide-react-native', () => ({
  Mic: 'Mic',
  Square: 'Square',
}));

describe('RecordingVisualizer', () => {
  it('renders large mic start button when idle', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <RecordingVisualizer
          isRecording={false}
          recordingLevel={0}
          onStart={jest.fn()}
          onStop={jest.fn()}
        />,
      );
    });

    expect(
      tree!.root.findByProps({ accessibilityLabel: 'voiceStudio.recordingStart' }),
    ).toBeTruthy();
  });

  it('renders stop button while recording', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <RecordingVisualizer
          isRecording
          recordingLevel={0.4}
          onStart={jest.fn()}
          onStop={jest.fn()}
        />,
      );
    });

    expect(
      tree!.root.findByProps({ accessibilityLabel: 'voiceStudio.recordingStop' }),
    ).toBeTruthy();
  });
});
