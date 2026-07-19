import {
  formatDurationLimitLabel,
  resolveDurationLimitDisplay,
} from '@/utils/formatDurationLimit';

describe('resolveDurationLimitDisplay', () => {
  it('uses seconds under one minute so UI never shows 0 min', () => {
    expect(resolveDurationLimitDisplay(0)).toEqual({
      count: 0,
      unit: 'seconds',
    });
    expect(resolveDurationLimitDisplay(10)).toEqual({
      count: 10,
      unit: 'seconds',
    });
    expect(resolveDurationLimitDisplay(59)).toEqual({
      count: 59,
      unit: 'seconds',
    });
  });

  it('uses whole minutes for exact minute lengths', () => {
    expect(resolveDurationLimitDisplay(60)).toEqual({
      count: 1,
      unit: 'minutes',
    });
    expect(resolveDurationLimitDisplay(600)).toEqual({
      count: 10,
      unit: 'minutes',
    });
  });

  it('falls back to seconds for non-whole minutes', () => {
    expect(resolveDurationLimitDisplay(90)).toEqual({
      count: 90,
      unit: 'seconds',
    });
  });
});

describe('formatDurationLimitLabel', () => {
  const t = (key: string, options?: Record<string, string | number>) => {
    if (key === 'common.durationLimitSeconds') {
      return `${options?.count} s`;
    }
    if (key === 'common.durationLimitMinutes') {
      return `${options?.count} min`;
    }
    return key;
  };

  it('formats free and premium plan limits', () => {
    expect(formatDurationLimitLabel(60, 'en', t)).toBe('1 min');
    expect(formatDurationLimitLabel(600, 'en', t)).toBe('10 min');
    expect(formatDurationLimitLabel(10, 'en', t)).toBe('10 s');
  });
});
