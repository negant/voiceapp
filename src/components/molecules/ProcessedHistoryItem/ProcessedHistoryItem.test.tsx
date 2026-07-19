import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { ProcessedHistoryItem } from './ProcessedHistoryItem';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (params) {
        return `${key}:${JSON.stringify(params)}`;
      }
      return key;
    },
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, isHydrated: true }),
}));

jest.mock('lucide-react-native', () => ({
  Play: () => null,
  Download: () => null,
  Share2: () => null,
  Trash2: () => null,
}));

describe('ProcessedHistoryItem', () => {
  const entry = {
    id: 'processed_1',
    fileName: 'demo-processed.wav',
    outputUri: 'file:///processed/demo.wav',
    sourceFileName: 'demo.mp3',
    presetLabel: 'Light',
    createdAt: 1,
  };

  it('renders title and effect on separate lines with action buttons', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ProcessedHistoryItem
          entry={entry}
          onPlay={jest.fn()}
          onExport={jest.fn()}
          onShare={jest.fn()}
          onDelete={jest.fn()}
        />,
      );
    });

    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();

    expect(texts).toContain('demo-processed.wav');
    expect(texts).toContain(
      'voiceStudio.recentProcessedPreset:{"preset":"Light"}',
    );

    const buttons = tree!.root.findAllByProps({ accessibilityRole: 'button' });
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });
});
