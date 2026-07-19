import { formatCreditsBalance } from './formatCreditsBalance';

describe('formatCreditsBalance', () => {
  it('formats balance with locale-specific grouping', () => {
    expect(formatCreditsBalance(1000, 'en')).toBe('1,000');
    expect(formatCreditsBalance(1000, 'pl').replace(/\s/g, '')).toBe('1000');
    expect(formatCreditsBalance(1234567, 'en')).toBe('1,234,567');
  });

  it('never shows negative values', () => {
    expect(formatCreditsBalance(-50, 'en')).toBe('0');
  });
});
