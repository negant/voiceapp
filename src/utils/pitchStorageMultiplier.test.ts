import { displayToStorage } from '@/utils/audioEffectScale';
import { pitchStorageToMultiplier } from '@/utils/pitchStorageMultiplier';

describe('pitchStorageToMultiplier', () => {
  it('returns 1 at neutral storage', () => {
    expect(pitchStorageToMultiplier(50)).toBeCloseTo(1, 5);
  });

  it('raises pitch above neutral', () => {
    expect(pitchStorageToMultiplier(displayToStorage(5))).toBeGreaterThan(1);
  });

  it('lowers pitch below neutral', () => {
    expect(pitchStorageToMultiplier(displayToStorage(-5))).toBeLessThan(1);
  });
});
