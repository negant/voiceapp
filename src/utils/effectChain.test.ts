import {
  areEffectRefsEqual,
  buildCombinedEffectDefaultName,
  formatCombinedEffectDescription,
  getEffectRefKey,
  hasMultipleAiInChain,
  isCombinedPreset,
  listSelectableEffectRefs,
} from '@/utils/effectChain';

describe('effectChain', () => {
  it('builds stable keys for effect references', () => {
    expect(getEffectRefKey({ tier: 'basic', presetId: 'robot' })).toBe(
      'basic:robot',
    );
    expect(getEffectRefKey({ tier: 'advanced', effectId: 'hall' })).toBe(
      'advanced:hall',
    );
    expect(getEffectRefKey({ tier: 'ai', effectId: 'narrator' })).toBe(
      'ai:narrator',
    );
  });

  it('compares effect references by key', () => {
    expect(
      areEffectRefsEqual(
        { tier: 'basic', presetId: 'male' },
        { tier: 'basic', presetId: 'male' },
      ),
    ).toBe(true);
    expect(
      areEffectRefsEqual(
        { tier: 'basic', presetId: 'male' },
        { tier: 'advanced', effectId: 'maleVoice' },
      ),
    ).toBe(false);
  });

  it('detects multiple AI steps in a chain', () => {
    expect(
      hasMultipleAiInChain([
        { tier: 'ai', effectId: 'narrator' },
        { tier: 'ai', effectId: 'legionista' },
      ]),
    ).toBe(true);
    expect(
      hasMultipleAiInChain([
        { tier: 'basic', presetId: 'robot' },
        { tier: 'ai', effectId: 'narrator' },
      ]),
    ).toBe(false);
  });

  it('detects combined presets', () => {
    expect(isCombinedPreset({ effectChain: undefined })).toBe(false);
    expect(
      isCombinedPreset({
        effectChain: [
          { tier: 'basic', presetId: 'robot' },
          { tier: 'ai', effectId: 'narrator' },
        ],
      }),
    ).toBe(true);
  });

  it('builds default combined names and descriptions', () => {
    expect(buildCombinedEffectDefaultName('Robot', 'Narrator', ' + ')).toBe(
      'Robot + Narrator',
    );
    expect(
      formatCombinedEffectDescription(
        [
          { tier: 'basic', presetId: 'robot' },
          { tier: 'ai', effectId: 'narrator' },
        ],
        ref =>
          ref.tier === 'basic' ? ref.presetId : ref.effectId,
      ),
    ).toBe('robot → narrator');
  });

  it('lists all selectable built-in effect references', () => {
    const refs = listSelectableEffectRefs();
    expect(refs.some(ref => ref.tier === 'basic' && ref.presetId === 'female')).toBe(
      true,
    );
    expect(
      refs.some(ref => ref.tier === 'advanced' && ref.effectId === 'chipmunk'),
    ).toBe(true);
    expect(refs.some(ref => ref.tier === 'ai' && ref.effectId === 'narratorka')).toBe(
      true,
    );
    expect(refs.some(ref => ref.tier === 'ai' && ref.effectId === 'legionista')).toBe(
      true,
    );
    expect(refs.some(ref => ref.tier === 'ai' && ref.effectId === 'narrator')).toBe(
      true,
    );
    expect(refs.some(ref => ref.tier === 'ai' && ref.effectId === 'demonMale')).toBe(
      true,
    );
    expect(
      refs.some(ref => ref.tier === 'ai' && ref.effectId === 'frenchFemale'),
    ).toBe(true);
    expect(refs.some(ref => ref.tier === 'ai' && ref.effectId === 'matureMale')).toBe(
      true,
    );
    expect(
      refs.some(ref => ref.tier === 'ai' && ref.effectId === 'femaleSensual'),
    ).toBe(true);
  });
});
