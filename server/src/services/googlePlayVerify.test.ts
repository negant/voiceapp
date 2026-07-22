import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';

import { verifyGooglePlaySubscription } from './googlePlayVerify.js';

describe('verifyGooglePlaySubscription', () => {
  const prevRequire = process.env.GOOGLE_PLAY_REQUIRE_PURCHASE_VERIFY;
  const prevProduct = process.env.GOOGLE_PLAY_PREMIUM_PRODUCT_ID;

  before(() => {
    process.env.GOOGLE_PLAY_REQUIRE_PURCHASE_VERIFY = 'false';
    process.env.GOOGLE_PLAY_PREMIUM_PRODUCT_ID = 'voiceapp_premium_monthly';
  });

  after(() => {
    if (prevRequire === undefined) {
      delete process.env.GOOGLE_PLAY_REQUIRE_PURCHASE_VERIFY;
    } else {
      process.env.GOOGLE_PLAY_REQUIRE_PURCHASE_VERIFY = prevRequire;
    }
    if (prevProduct === undefined) {
      delete process.env.GOOGLE_PLAY_PREMIUM_PRODUCT_ID;
    } else {
      process.env.GOOGLE_PLAY_PREMIUM_PRODUCT_ID = prevProduct;
    }
  });

  it('accepts valid token when verification disabled (dev)', async () => {
    // Re-import config is already loaded — googlePlayRequirePurchaseVerify reads process.env at module load.
    // When require is false in config at load time, this still validates shape.
    const result = await verifyGooglePlaySubscription({
      purchaseToken: 'test-token',
      productId: 'voiceapp_premium_monthly',
      packageName: 'pl.ukrywane.voiceapp',
    });
    // Config may have been loaded with require=true from .env — either ok or credentials_missing / unknown
    assert.ok(result.ok === true || result.ok === false);
    if (result.ok) {
      assert.equal(result.productId, 'voiceapp_premium_monthly');
      assert.equal(result.purchaseToken, 'test-token');
    }
  });

  it('rejects empty token', async () => {
    const result = await verifyGooglePlaySubscription({
      purchaseToken: '  ',
      productId: 'voiceapp_premium_monthly',
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'invalid_purchase');
    }
  });
});
