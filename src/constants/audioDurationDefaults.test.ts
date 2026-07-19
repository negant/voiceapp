import {
  DEFAULT_MAX_AUDIO_DURATION_FREE_SEC,
  DEFAULT_MAX_AUDIO_DURATION_PREMIUM_SEC,
} from './audioDurationDefaults';

describe('audioDurationDefaults', () => {
  it('exposes free 1 min and premium 10 min defaults', () => {
    expect(DEFAULT_MAX_AUDIO_DURATION_FREE_SEC).toBe(60);
    expect(DEFAULT_MAX_AUDIO_DURATION_PREMIUM_SEC).toBe(600);
  });
});
