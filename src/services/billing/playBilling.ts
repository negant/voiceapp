import {
  ANDROID_APPLICATION_ID,
  PREMIUM_SUBSCRIPTION_PRODUCT_ID,
} from '@/config/billing';

export type GooglePlayPurchasePayload = {
  purchaseToken: string;
  productId: string;
  packageName: string;
  orderId?: string;
};

export type PremiumPurchaseResult =
  | { ok: true; purchase: GooglePlayPurchasePayload }
  | { ok: false; cancelled?: boolean; error: string };

type SubscriptionProductLike = {
  id?: string;
  productId?: string;
  subscriptionOfferDetailsAndroid?: Array<{ offerToken?: string }>;
};

function resolveProductId(product: SubscriptionProductLike): string {
  return (product.id ?? product.productId ?? '').trim();
}

function resolveOfferToken(product: SubscriptionProductLike): string | null {
  const offers = product.subscriptionOfferDetailsAndroid;
  const token = offers?.[0]?.offerToken?.trim();
  return token || null;
}

function purchaseToPayload(purchase: {
  purchaseToken?: string | null;
  productId?: string;
  id?: string;
  packageNameAndroid?: string;
  transactionId?: string;
}): GooglePlayPurchasePayload | null {
  const purchaseToken = purchase.purchaseToken?.trim();
  if (!purchaseToken) {
    return null;
  }
  const productId = (
    purchase.productId ??
    purchase.id ??
    PREMIUM_SUBSCRIPTION_PRODUCT_ID
  ).trim();
  return {
    purchaseToken,
    productId,
    packageName: purchase.packageNameAndroid ?? ANDROID_APPLICATION_ID,
    orderId: purchase.transactionId,
  };
}

/**
 * Launch Play Billing / StoreKit Premium subscription and return the purchase
 * token for server-side verification. Call finishTransaction after API grant.
 */
export async function purchasePremiumSubscription(): Promise<PremiumPurchaseResult> {
  try {
    const iap = await import('react-native-iap');
    await iap.initConnection();

    const products = (await iap.fetchProducts({
      skus: [PREMIUM_SUBSCRIPTION_PRODUCT_ID],
      type: 'subs',
    })) as SubscriptionProductLike[] | null;

    const product = (products ?? []).find(
      item => resolveProductId(item) === PREMIUM_SUBSCRIPTION_PRODUCT_ID,
    );
    if (!product) {
      await iap.endConnection().catch(() => undefined);
      return {
        ok: false,
        error: 'premium_product_unavailable',
      };
    }

    const offerToken = resolveOfferToken(product);

    const purchasePromise = new Promise<PremiumPurchaseResult>(resolve => {
      const successSub = iap.purchaseUpdatedListener(purchase => {
        successSub.remove();
        errorSub.remove();
        const payload = purchaseToPayload(purchase);
        if (!payload) {
          resolve({ ok: false, error: 'missing_purchase_token' });
          return;
        }
        resolve({ ok: true, purchase: payload });
      });
      const errorSub = iap.purchaseErrorListener(error => {
        successSub.remove();
        errorSub.remove();
        const code = String(error?.code ?? '');
        const cancelled =
          code.includes('UserCancelled') ||
          code.includes('user-cancelled') ||
          code.includes('E_USER_CANCELLED');
        resolve({
          ok: false,
          cancelled,
          error: cancelled ? 'user_cancelled' : code || 'purchase_failed',
        });
      });
    });

    await iap.requestPurchase({
      type: 'subs',
      request: {
        apple: { sku: PREMIUM_SUBSCRIPTION_PRODUCT_ID },
        google: {
          skus: [PREMIUM_SUBSCRIPTION_PRODUCT_ID],
          ...(offerToken
            ? {
                subscriptionOffers: [
                  {
                    sku: PREMIUM_SUBSCRIPTION_PRODUCT_ID,
                    offerToken,
                  },
                ],
              }
            : {}),
        },
      },
    });

    const result = await purchasePromise;
    return result;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Finalize store transaction after backend granted Premium. */
export async function finishPremiumPurchase(purchaseToken: string): Promise<void> {
  try {
    const iap = await import('react-native-iap');
    const purchases = await iap.getAvailablePurchases();
    const match = (purchases ?? []).find(
      (item: { purchaseToken?: string | null }) =>
        item.purchaseToken === purchaseToken,
    );
    if (match) {
      await iap.finishTransaction({ purchase: match, isConsumable: false });
    }
  } catch {
    // Best-effort — Play may auto-ack after server acknowledge; avoid blocking UX.
  }
}

/** Restore active Premium subscription purchase token (if any). */
export async function restorePremiumPurchase(): Promise<GooglePlayPurchasePayload | null> {
  try {
    const iap = await import('react-native-iap');
    await iap.initConnection();
    const purchases = await iap.getAvailablePurchases();
    const match = (purchases ?? []).find((item: { productId?: string; id?: string }) => {
      const id = item.productId ?? item.id;
      return id === PREMIUM_SUBSCRIPTION_PRODUCT_ID;
    });
    if (!match) {
      return null;
    }
    return purchaseToPayload(match);
  } catch {
    return null;
  }
}
