import { FREE_INSTALLS_WITH_TEST_CREDITS } from '@/config/credits';
import { env } from '@/config/env';

import {
  buildRemainingPoolSlots,
  isFreeTestPoolExhausted,
  mapCreditsBootstrapResponse,
  resolveLocalBootstrapFallback,
  resolvePoolExhaustedBootstrap,
} from './creditsBootstrap';

describe('creditsBootstrap', () => {
  it('detects exhausted install pool', () => {
    expect(isFreeTestPoolExhausted(29)).toBe(false);
    expect(isFreeTestPoolExhausted(30)).toBe(true);
    expect(isFreeTestPoolExhausted(31)).toBe(true);
  });

  it('computes remaining pool slots', () => {
    expect(buildRemainingPoolSlots(0)).toBe(FREE_INSTALLS_WITH_TEST_CREDITS);
    expect(buildRemainingPoolSlots(10)).toBe(
      FREE_INSTALLS_WITH_TEST_CREDITS - 10,
    );
    expect(buildRemainingPoolSlots(FREE_INSTALLS_WITH_TEST_CREDITS)).toBe(0);
  });

  it('maps API grant response', () => {
    const result = mapCreditsBootstrapResponse({
      bootstrapStatus: 'granted',
      grantedCredits: env.startingCredits,
      balance: env.startingCredits,
      accountPlan: 'free',
      creditsPerAi10Sec: 114,
      pool: {
        installCap: 30,
        installsGranted: 1,
        remainingSlots: 29,
      },
    });

    expect(result.status).toBe('granted');
    expect(result.balance).toBe(env.startingCredits);
    expect(result.pool?.remainingSlots).toBe(29);
  });

  it('local fallback does not grant free credits without API', () => {
    const result = resolveLocalBootstrapFallback();

    expect(result.status).toBe('local_fallback');
    expect(result.balance).toBe(0);
    expect(result.grantedCredits).toBe(0);
    expect(result.pool?.remainingSlots).toBe(FREE_INSTALLS_WITH_TEST_CREDITS);
  });

  it('pool exhausted bootstrap has zero balance', () => {
    const result = resolvePoolExhaustedBootstrap();

    expect(result.status).toBe('pool_exhausted');
    expect(result.balance).toBe(0);
    expect(result.grantedCredits).toBe(0);
    expect(isFreeTestPoolExhausted(result.pool!.installsGranted)).toBe(true);
  });
});
