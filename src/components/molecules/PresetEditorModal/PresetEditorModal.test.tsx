import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { PresetEditorModal } from './PresetEditorModal';

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

const BASE_EFFECTS = {
  pitch: 50,
  tempo: 50,
  echo: 20,
  reverb: 45,
  bass: 50,
};

describe('PresetEditorModal', () => {
  it('shows update action for modified custom presets', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <PresetEditorModal
          visible
          mode="edit"
          target={{
            kind: 'custom',
            preset: {
              id: 'preset_1',
              name: 'Studio',
              effects: BASE_EFFECTS,
              accentColor: '#6366F1',
              createdAt: 1,
              updatedAt: 1,
            },
          }}
          draftEffects={{ ...BASE_EFFECTS, pitch: 60 }}
          effectKeys={['pitch', 'tempo', 'echo', 'reverb', 'bass']}
          canUpdateExisting
          onCancel={jest.fn()}
          onDraftEffectChange={jest.fn()}
          onCreate={jest.fn()}
          onRequestUpdate={jest.fn()}
          onSaveAsNew={jest.fn()}
        />,
      );
    });

    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();

    expect(texts).toContain('voiceStudio.editPresetTitle');
    expect(texts).toContain('voiceStudio.presetNameLabel');
    expect(texts).toContain('voiceStudio.updatePreset');
  });
});
