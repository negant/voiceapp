import { resolveWelcomeCreditsPromptAmount } from '@/services/credits/resolveWelcomeCreditsPrompt';

describe('resolveWelcomeCreditsPromptAmount', () => {
  it('returns grant amount for a successful free-pool grant', () => {
    expect(resolveWelcomeCreditsPromptAmount('granted', 10)).toBe(10);
  });

  it('returns null when pool did not grant credits', () => {
    expect(resolveWelcomeCreditsPromptAmount('granted', 0)).toBeNull();
    expect(resolveWelcomeCreditsPromptAmount('pool_exhausted', 0)).toBeNull();
    expect(
      resolveWelcomeCreditsPromptAmount('already_registered', 10),
    ).toBeNull();
    expect(resolveWelcomeCreditsPromptAmount('local_fallback', 10)).toBeNull();
  });
});
