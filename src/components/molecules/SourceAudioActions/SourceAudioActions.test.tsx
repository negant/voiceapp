import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { SourceAudioActions } from './SourceAudioActions';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

jest.mock('lucide-react-native', () => ({
  FileAudio: () => null,
  Mic: () => null,
}));

describe('SourceAudioActions', () => {
  it('renders import and record action labels', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SourceAudioActions onLoadFile={jest.fn()} onRecord={jest.fn()} />,
      );
    });

    const texts = tree!.root.findAllByType('Text' as never);
    const values = texts.map(node => node.props.children).flat();

    expect(values).toContain('voiceStudio.loadFileActionTitle');
    expect(values).toContain('voiceStudio.recordAudioActionTitle');
  });
});
