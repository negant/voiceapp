import {
  ANDROID_APPLICATION_ID,
  PREMIUM_SUBSCRIPTION_PRODUCT_ID,
} from '@/config/billing';

import { buildGooglePlayPurchasePayload, isPremiumProductId } from './playBilling.helpers';

describe('playBilling.helpers', () => {
  it('builds purchase payload with defaults', () => {
    expect(
      buildGooglePlayPurchasePayload({ purchaseToken: ' tok ' }),
    ).toEqual({
      purchaseToken: 'tok',
      productId: PREMIUM_SUBSCRIPTION_PRODUCT_ID,
      packageName: ANDROID_APPLICATION_ID,
      orderId: undefined,
    });
  });

  it('recognizes premium product id', () => {
    expect(isPremiumProductId(PREMIUM_SUBSCRIPTION_PRODUCT_ID)).toBe(true);
    expect(isPremiumProductId('other')).toBe(false);
  });
});
