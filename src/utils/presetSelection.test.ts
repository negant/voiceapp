import { clearPresetSelectionOnEffectEdit, selectionUsesAiProcessing, toggleAdvancedEffectSelection, toggleAiEffectSelection, toggleBuiltinPresetSelection, toggleCustomPresetSelection } from '@/utils/presetSelection';

describe('clearPresetSelectionOnEffectEdit', () => {
  it('clears builtin selection when effects are edited', () => {
    expect(
      clearPresetSelectionOnEffectEdit({ kind: 'builtin', id: 'male' }),
    ).toEqual({ kind: 'none' });
  });

  it('clears custom selection when effects are edited', () => {
    expect(
      clearPresetSelectionOnEffectEdit({ kind: 'custom', id: 'preset-1' }),
    ).toEqual({ kind: 'none' });
  });

  it('clears advanced selection when effects are edited', () => {
    expect(
      clearPresetSelectionOnEffectEdit({ kind: 'advanced', id: 'chipmunk' }),
    ).toEqual({ kind: 'none' });
  });

  it('clears ai selection when effects are edited', () => {
    expect(
      clearPresetSelectionOnEffectEdit({ kind: 'ai', id: 'narrator' }),
    ).toEqual({ kind: 'none' });
  });

  it('keeps none selection unchanged', () => {
    expect(clearPresetSelectionOnEffectEdit({ kind: 'none' })).toEqual({
      kind: 'none',
    });
  });
});

describe('toggleBuiltinPresetSelection', () => {
  it('selects builtin preset when none or different preset is active', () => {
    expect(
      toggleBuiltinPresetSelection({ kind: 'none' }, 'female'),
    ).toEqual({ kind: 'builtin', id: 'female' });
    expect(
      toggleBuiltinPresetSelection({ kind: 'builtin', id: 'male' }, 'female'),
    ).toEqual({ kind: 'builtin', id: 'female' });
    expect(
      toggleBuiltinPresetSelection({ kind: 'advanced', id: 'chipmunk' }, 'male'),
    ).toEqual({ kind: 'builtin', id: 'male' });
  });

  it('deselects when the same builtin preset is tapped again', () => {
    expect(
      toggleBuiltinPresetSelection({ kind: 'builtin', id: 'female' }, 'female'),
    ).toEqual({ kind: 'none' });
  });
});

describe('toggleAdvancedEffectSelection', () => {
  it('selects advanced effect when none or different effect is active', () => {
    expect(
      toggleAdvancedEffectSelection({ kind: 'none' }, 'chipmunk'),
    ).toEqual({ kind: 'advanced', id: 'chipmunk' });
    expect(
      toggleAdvancedEffectSelection({ kind: 'builtin', id: 'male' }, 'chipmunk'),
    ).toEqual({ kind: 'advanced', id: 'chipmunk' });
  });

  it('deselects when the same advanced effect is tapped again', () => {
    expect(
      toggleAdvancedEffectSelection({ kind: 'advanced', id: 'chipmunk' }, 'chipmunk'),
    ).toEqual({ kind: 'none' });
  });
});

describe('toggleAiEffectSelection', () => {
  it('selects ai effect when none or different effect is active', () => {
    expect(toggleAiEffectSelection({ kind: 'none' }, 'narrator')).toEqual({
      kind: 'ai',
      id: 'narrator',
    });
    expect(
      toggleAiEffectSelection({ kind: 'advanced', id: 'chipmunk' }, 'narrator'),
    ).toEqual({ kind: 'ai', id: 'narrator' });
  });

  it('deselects when the same ai effect is tapped again', () => {
    expect(
      toggleAiEffectSelection({ kind: 'ai', id: 'narrator' }, 'narrator'),
    ).toEqual({ kind: 'none' });
  });
});

describe('toggleCustomPresetSelection', () => {
  it('selects custom preset when none or different preset is active', () => {
    expect(
      toggleCustomPresetSelection({ kind: 'none' }, 'preset-1'),
    ).toEqual({ kind: 'custom', id: 'preset-1' });
    expect(
      toggleCustomPresetSelection({ kind: 'custom', id: 'preset-2' }, 'preset-1'),
    ).toEqual({ kind: 'custom', id: 'preset-1' });
  });

  it('deselects when the same custom preset is tapped again', () => {
    expect(
      toggleCustomPresetSelection({ kind: 'custom', id: 'preset-1' }, 'preset-1'),
    ).toEqual({ kind: 'none' });
  });
});

describe('selectionUsesAiProcessing', () => {
  it('returns true for direct ai selection', () => {
    expect(
      selectionUsesAiProcessing({ kind: 'ai', id: 'narrator' }, null),
    ).toBe(true);
  });

  it('returns true for custom presets with ai source or chain', () => {
    expect(
      selectionUsesAiProcessing(
        { kind: 'custom', id: 'preset-1' },
        {
          id: 'preset-1',
          name: 'Narrator',
          effects: { pitch: 50, tempo: 50, echo: 50, reverb: 50, bass: 50 },
          source: { tier: 'ai', effectId: 'narrator' },
        },
      ),
    ).toBe(true);

    expect(
      selectionUsesAiProcessing(
        { kind: 'custom', id: 'preset-2' },
        {
          id: 'preset-2',
          name: 'Robot + Narrator',
          effects: { pitch: 50, tempo: 50, echo: 50, reverb: 50, bass: 50 },
          effectChain: [
            { tier: 'basic', presetId: 'robot' },
            { tier: 'ai', effectId: 'narrator' },
          ],
        },
      ),
    ).toBe(true);
  });

  it('returns false for non-ai selections', () => {
    expect(selectionUsesAiProcessing({ kind: 'none' }, null)).toBe(false);
    expect(
      selectionUsesAiProcessing(
        { kind: 'custom', id: 'preset-3' },
        {
          id: 'preset-3',
          name: 'Chipmunk',
          effects: { pitch: 50, tempo: 50, echo: 50, reverb: 50, bass: 50 },
          source: { tier: 'advanced', effectId: 'chipmunk' },
        },
      ),
    ).toBe(false);
  });
});
