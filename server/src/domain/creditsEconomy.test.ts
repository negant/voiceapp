import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addMonthsUtc,
  isFreeCreditsExpired,
  resolvePremiumPackTotal,
  totalBalance,
} from './creditsEconomy.js';

describe('creditsEconomy', () => {
  it('adds months for free credit validity', () => {
    const from = new Date('2026-01-15T12:00:00.000Z');
    const next = addMonthsUtc(from, 3);
    assert.equal(next.toISOString(), '2026-04-15T12:00:00.000Z');
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

  it('sums premium pack', () => {
    assert.equal(resolvePremiumPackTotal(100, 25), 125);
    assert.equal(totalBalance(100, 10), 110);
  });
});
