import {
  resolveConversionProcessingMode,
  resolveConversionSummary,
} from '@/utils/conversionSummary';
import type { SavedVoicePreset } from '@/types/voiceStudio';

describe('resolveConversionProcessingMode', () => {
  it('returns null when nothing is selected', () => {
    expect(resolveConversionProcessingMode({ kind: 'none' }, null)).toBeNull();
  });

  it('marks builtin and advanced as local', () => {
    expect(
      resolveConversionProcessingMode({ kind: 'builtin', id: 'male' }, null),
    ).toBe('local');
    expect(
      resolveConversionProcessingMode(
        { kind: 'advanced', id: 'chipmunk' },
        null,
      ),
    ).toBe('local');
  });

  it('marks ai selection as cloud', () => {
    expect(
      resolveConversionProcessingMode({ kind: 'ai', id: 'narrator' }, null),
    ).toBe('cloud');
  });

  it('detects mixed chains with ai and local tiers', () => {
    const preset = {
      name: 'Robot + Narrator',
      effectChain: [
        { tier: 'basic', presetId: 'robot' },
        { tier: 'ai', effectId: 'narrator' },
      ],
    } as SavedVoicePreset;

    expect(
      resolveConversionProcessingMode(
        { kind: 'custom', id: 'preset-1' },
        preset,
      ),
    ).toBe('mixed');
  });
});

describe('resolveConversionSummary', () => {
  it('returns effect label and mode for ai selection', () => {
    expect(
      resolveConversionSummary({
        selection: { kind: 'ai', id: 'narrator' },
        aiLabel: 'Narrator',
        customMixLabel: 'Custom mix',
      }),
    ).toEqual({
      effectName: 'Narrator',
      mode: 'cloud',
    });
  });
});
