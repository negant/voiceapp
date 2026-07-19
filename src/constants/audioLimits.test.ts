import {
  AI_FREE_MAX_AUDIO_DURATION_SEC,
  DEFAULT_MAX_AUDIO_DURATION_FREE_SEC,
  DEFAULT_MAX_AUDIO_DURATION_PREMIUM_SEC,
  FREE_MAX_DURATION_MINUTES,
  IMPORT_SAFETY_MAX_SIZE_MB,
  LOCAL_MAX_AUDIO_DURATION_SEC,
  resolveAiMaxDurationSec,
  resolveImportMaxSizeMb,
  resolveMaxDurationSecForTier,
  resolvePlanMaxDurationSec,
} from './audioLimits';

describe('audioLimits', () => {
  it('defines plan duration caps from env defaults', () => {
    expect(DEFAULT_MAX_AUDIO_DURATION_FREE_SEC).toBe(60);
    expect(DEFAULT_MAX_AUDIO_DURATION_PREMIUM_SEC).toBe(600);
    expect(LOCAL_MAX_AUDIO_DURATION_SEC).toBe(600);
    expect(AI_FREE_MAX_AUDIO_DURATION_SEC).toBe(60);
    expect(FREE_MAX_DURATION_MINUTES).toBe(1);
    expect(resolveMaxDurationSecForTier('basic', 'free')).toBe(60);
    expect(resolveMaxDurationSecForTier('advanced', 'premium')).toBe(600);
    expect(resolveMaxDurationSecForTier('ai', 'free')).toBe(60);
    expect(resolveMaxDurationSecForTier('ai', 'premium')).toBe(600);
  });

  it('resolves plan duration by account plan from env', () => {
    expect(resolvePlanMaxDurationSec('free')).toBe(60);
    expect(resolvePlanMaxDurationSec('premium')).toBe(600);
    expect(resolveAiMaxDurationSec('free')).toBe(60);
    expect(resolveAiMaxDurationSec('premium')).toBe(600);
  });

  it('caps import size at the safety ceiling', () => {
    expect(IMPORT_SAFETY_MAX_SIZE_MB).toBe(500);
    expect(resolveImportMaxSizeMb(50)).toBe(50);
    expect(resolveImportMaxSizeMb(800)).toBe(500);
    expect(resolveImportMaxSizeMb(0)).toBe(500);
  });
});
