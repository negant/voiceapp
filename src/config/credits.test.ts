import { resolvePremiumIncludedStartedMinutes } from '@/config/credits';

describe('premium economy', () => {
  it('sums paid Premium credits and gratis', () => {
    expect(resolvePremiumIncludedStartedMinutes(100, 25)).toBe(125);
    expect(resolvePremiumIncludedStartedMinutes(100, 0)).toBe(100);
  });

  it('ignores non-positive values', () => {
    expect(resolvePremiumIncludedStartedMinutes(0, 25)).toBe(25);
    expect(resolvePremiumIncludedStartedMinutes(-1, -5)).toBe(0);
  });
});
