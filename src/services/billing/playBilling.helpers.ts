import {
  ANDROID_APPLICATION_ID,
  PREMIUM_SUBSCRIPTION_PRODUCT_ID,
} from '@/config/billing';

import type { GooglePlayPurchasePayload } from './playBilling';

export function buildGooglePlayPurchasePayload(params: {
  purchaseToken: string;
  productId?: string;
  packageName?: string;
  orderId?: string;
}): GooglePlayPurchasePayload {
  return {
    purchaseToken: params.purchaseToken.trim(),
    productId: (params.productId ?? PREMIUM_SUBSCRIPTION_PRODUCT_ID).trim(),
    packageName: (params.packageName ?? ANDROID_APPLICATION_ID).trim(),
    orderId: params.orderId,
  };
}

export function isPremiumProductId(productId: string): boolean {
  return productId.trim() === PREMIUM_SUBSCRIPTION_PRODUCT_ID;
}
