import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { AudioPlaybackModal } from './AudioPlaybackModal';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, isHydrated: true }),
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('lucide-react-native', () => ({
  Pause: 'Pause',
  Play: 'Play',
  Square: 'Square',
  X: 'X',
}));

describe('AudioPlaybackModal', () => {
  it('renders file details and playback controls', () => {
    const onPlay = jest.fn();
    const onPause = jest.fn();
    const onStop = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AudioPlaybackModal
          visible
          title="Preview"
          fileName="voice.mp3"
          progressSec={12}
          durationSec={30}
          isPlaying
          waveformBars={[12, 40, 24, 60, 18, 52, 30, 68]}
          isWaveformLoading={false}
          onPlay={onPlay}
          onPause={onPause}
          onStop={onStop}
          onClose={jest.fn()}
        />,
      );
    });

    const textValues = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();

    expect(textValues).toContain('Preview');
    expect(textValues).toContain('voice.mp3');
    expect(textValues).toContain('0:12');
    expect(textValues).toContain('0:30');

    ReactTestRenderer.act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: 'voiceStudio.playbackPlay' })
        .props.onPress();
      tree!.root
        .findByProps({ accessibilityLabel: 'voiceStudio.playbackPause' })
        .props.onPress();
      tree!.root
        .findByProps({ accessibilityLabel: 'voiceStudio.playbackStop' })
        .props.onPress();
    });

    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
