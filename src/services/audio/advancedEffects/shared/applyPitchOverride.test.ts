import { applyPitchOverrideToFilters } from '@/services/audio/advancedEffects/shared/applyPitchOverride';
import { displayToStorage } from '@/utils/audioEffectScale';
import { pitchStorageToMultiplier } from '@/utils/pitchStorageMultiplier';

describe('applyPitchOverrideToFilters', () => {
  it('leaves filters unchanged at neutral pitch', () => {
    const filters = [{ type: 'pitch_shift' as const, factor: 1.55 }];

    expect(applyPitchOverrideToFilters(filters, 50)).toBe(filters);
  });

  it('scales pitch_shift factors with user pitch tweak', () => {
    const pitchStorage = displayToStorage(5);
    const filters = [
      { type: 'pitch_shift' as const, factor: 0.8 },
      { type: 'gain' as const, linear: 0.9 },
    ];

    const adjusted = applyPitchOverrideToFilters(filters, pitchStorage);

    expect(adjusted[0]).toEqual({
      type: 'pitch_shift',
      factor: 0.8 * pitchStorageToMultiplier(pitchStorage),
    });
    expect(adjusted[1]).toEqual(filters[1]);
  });
});
