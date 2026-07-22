import { compareSemver } from './compareSemver';

describe('compareSemver', () => {
  it('orders versions', () => {
    expect(compareSemver('1.0.0', '1.0.1')).toBeLessThan(0);
    expect(compareSemver('1.2.0', '1.0.9')).toBeGreaterThan(0);
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
  });

  it('pads missing segments', () => {
    expect(compareSemver('1.0', '1.0.0')).toBe(0);
    expect(compareSemver('1', '1.0.1')).toBeLessThan(0);
  });
});
