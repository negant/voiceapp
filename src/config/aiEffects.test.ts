import {
  DEFAULT_AI_EFFECTS_API_BASE_URL,
  normalizeAiEffectsApiBaseUrl,
  resolveAiEffectsApiBaseUrl,
} from './aiEffects';

describe('aiEffects config', () => {
  it('uses WaveSpeed default when env is empty', () => {
    expect(resolveAiEffectsApiBaseUrl(null)).toBe(DEFAULT_AI_EFFECTS_API_BASE_URL);
    expect(resolveAiEffectsApiBaseUrl('')).toBe(DEFAULT_AI_EFFECTS_API_BASE_URL);
    expect(resolveAiEffectsApiBaseUrl('   ')).toBe(DEFAULT_AI_EFFECTS_API_BASE_URL);
  });

  it('normalizes trailing slashes from env override', () => {
    expect(
      resolveAiEffectsApiBaseUrl('https://proxy.example/api/v3/'),
    ).toBe('https://proxy.example/api/v3');
    expect(normalizeAiEffectsApiBaseUrl('https://a.example/v3///')).toBe(
      'https://a.example/v3',
    );
  });
});
