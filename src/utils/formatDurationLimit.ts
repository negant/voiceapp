import { formatAiDurationSeconds } from '@/utils/creditsEconomy';

export type DurationLimitUnit = 'seconds' | 'minutes';

/**
 * Pick seconds vs minutes for UI limits.
 * Under 1 whole minute → seconds, so we never show "0 min".
 */
export function resolveDurationLimitDisplay(durationSec: number): {
  count: number;
  unit: DurationLimitUnit;
} {
  const sec = Math.max(0, Math.floor(durationSec));
  const minutes = Math.floor(sec / 60);

  if (minutes < 1) {
    return { count: sec, unit: 'seconds' };
  }

  if (sec % 60 === 0) {
    return { count: minutes, unit: 'minutes' };
  }

  return { count: sec, unit: 'seconds' };
}

type TranslateFn = (
  key: string,
  options?: Record<string, string | number>,
) => string;

/** Localized "60 s" / "10 min" style label for plan and clip limits. */
export function formatDurationLimitLabel(
  durationSec: number,
  locale: string,
  t: TranslateFn,
): string {
  const { count, unit } = resolveDurationLimitDisplay(durationSec);
  const formatted = formatAiDurationSeconds(count, locale);

  return unit === 'seconds'
    ? t('common.durationLimitSeconds', { count: formatted })
    : t('common.durationLimitMinutes', { count: formatted });
}
