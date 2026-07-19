import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { ProcessedHistoryList } from './ProcessedHistoryList';

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

describe('ProcessedHistoryList', () => {
  it('renders empty hint when there are no entries', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ProcessedHistoryList
          entries={[]}
          exportingId={null}
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

    expect(texts).toContain('voiceStudio.recentProcessedEmpty');
  });

  it('renders file name and preset label for each entry', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ProcessedHistoryList
          entries={[
            {
              id: 'processed_1',
              fileName: 'demo-processed.wav',
              outputUri: 'file:///processed/demo.wav',
              sourceFileName: 'demo.mp3',
              presetLabel: 'Warm',
              createdAt: 1,
            },
          ]}
          exportingId={null}
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
      'voiceStudio.recentProcessedPreset:{"preset":"Warm"}',
    );
  });
});
