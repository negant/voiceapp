import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addMonthsUtc,
  isFreeCreditsExpired,
  resolveFreeCreditsExpiresAt,
  resolvePremiumPackTotal,
  shouldExpireFreeCredits,
  totalBalance,
} from './creditsEconomy.js';

describe('creditsEconomy', () => {
  it('adds months for free credit validity from install', () => {
    const from = new Date('2026-01-15T12:00:00.000Z');
    const next = addMonthsUtc(from, 3);
    assert.equal(next.toISOString(), '2026-04-15T12:00:00.000Z');
    assert.equal(
      resolveFreeCreditsExpiresAt(from, 3).toISOString(),
      '2026-04-15T12:00:00.000Z',
    );
  });

  it('detects expired free credits', () => {
    assert.equal(
      isFreeCreditsExpired('2020-01-01T00:00:00.000Z', new Date('2026-01-01')),
      true,
    );
    assert.equal(
      isFreeCreditsExpired('2099-01-01T00:00:00.000Z', new Date('2026-01-01')),
      false,
    );
  });

  it('does not expire free credits while plan is premium', () => {
    assert.equal(
      shouldExpireFreeCredits({
        plan: 'premium',
        freeCredits: 10,
        freeCreditsExpiresAt: '2020-01-01T00:00:00.000Z',
        now: new Date('2026-01-01'),
      }),
      false,
    );
  });

  it('expires free credits on free plan after install window', () => {
    assert.equal(
      shouldExpireFreeCredits({
        plan: 'free',
        freeCredits: 10,
        freeCreditsExpiresAt: '2020-01-01T00:00:00.000Z',
        now: new Date('2026-01-01'),
      }),
      true,
    );
    assert.equal(
      shouldExpireFreeCredits({
        plan: 'free',
        freeCredits: 10,
        freeCreditsExpiresAt: null,
        installedAt: '2020-01-01T00:00:00.000Z',
        validityMonths: 3,
        now: new Date('2026-01-01'),
      }),
      true,
    );
  });

  it('sums premium pack', () => {
    assert.equal(resolvePremiumPackTotal(100, 25), 125);
    assert.equal(totalBalance(100, 10), 110);
  });
});
