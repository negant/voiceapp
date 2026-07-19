import {
  calculateAiMinutesAffordableFromCredits,
  calculateAiSecondsAffordableFromCredits,
  calculateCreditsForAiDurationSec,
  formatAiDurationMinutes,
  formatAiDurationSeconds,
  formatStartedMinutesAsHours,
  formatUsdPrice,
  normalizeAiBillableStartedMinutes,
  resolveEffectiveAiMaxDurationSec,
} from '@/utils/creditsEconomy';

describe('creditsEconomy', () => {
  const ratePerMinute = 1;

  it('resolves effective AI max from plan and credits', () => {
    expect(resolveEffectiveAiMaxDurationSec(10, 100)).toBe(10);
    expect(resolveEffectiveAiMaxDurationSec(600, 20)).toBe(20);
    expect(resolveEffectiveAiMaxDurationSec(600, 0)).toBe(0);
  });

  it('bills started minutes (1–60 s = 1 min)', () => {
    expect(normalizeAiBillableStartedMinutes(1)).toBe(1);
    expect(normalizeAiBillableStartedMinutes(60)).toBe(1);
    expect(normalizeAiBillableStartedMinutes(61)).toBe(2);
    expect(normalizeAiBillableStartedMinutes(120)).toBe(2);
    expect(normalizeAiBillableStartedMinutes(121)).toBe(3);
    expect(normalizeAiBillableStartedMinutes(0)).toBe(0);
  });

  it('charges one credit per started minute by default', () => {
    expect(calculateCreditsForAiDurationSec(5, ratePerMinute)).toBe(1);
    expect(calculateCreditsForAiDurationSec(60, ratePerMinute)).toBe(1);
    expect(calculateCreditsForAiDurationSec(61, ratePerMinute)).toBe(2);
    expect(calculateCreditsForAiDurationSec(180, ratePerMinute)).toBe(3);
  });

  it('converts balance to affordable AI seconds (minutes × 60)', () => {
    expect(calculateAiSecondsAffordableFromCredits(1, ratePerMinute)).toBe(60);
    expect(calculateAiSecondsAffordableFromCredits(5, ratePerMinute)).toBe(300);
    expect(calculateAiSecondsAffordableFromCredits(0, ratePerMinute)).toBe(0);
  });

  it('counts affordable started minutes', () => {
    expect(calculateAiMinutesAffordableFromCredits(200, ratePerMinute)).toBe(200);
    expect(calculateAiMinutesAffordableFromCredits(1, ratePerMinute)).toBe(1);
  });

  it('formats durations for display', () => {
    expect(formatAiDurationSeconds(100, 'en')).toBe('100');
    expect(formatAiDurationMinutes(200, 'en')).toBe('200');
    expect(formatStartedMinutesAsHours(200, 'en')).toBe('3.3');
    expect(formatStartedMinutesAsHours(60, 'en')).toBe('1');
  });

  it('formats USD prices with cents', () => {
    expect(formatUsdPrice(4.99, 'en')).toBe('4.99');
    expect(formatUsdPrice(10, 'en')).toBe('10.00');
  });
});
