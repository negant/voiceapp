import {
  getAdvancedEffectAccess,
  getAiEffectAccess,
  getBasicEffectAccess,
} from '@/constants/effectAccessTiers';

describe('effectAccessTiers', () => {
  it('marks basic presets as free by default', () => {
    expect(getBasicEffectAccess('robot')).toBe('free');
  });

  it('marks advanced effects as free by default', () => {
    expect(getAdvancedEffectAccess('chipmunk')).toBe('free');
  });

  it('marks ai effects as premium by default', () => {
    expect(getAiEffectAccess('narrator')).toBe('premium');
  });
});
