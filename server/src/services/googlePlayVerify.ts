import { google } from 'googleapis';
import { readFileSync, existsSync } from 'node:fs';

import { config } from '../config.js';

export type GooglePlayPurchaseInput = {
  purchaseToken: string;
  productId: string;
  packageName?: string;
  orderId?: string;
};

export type GooglePlayVerifyResult =
  | {
      ok: true;
      packageName: string;
      productId: string;
      purchaseToken: string;
      orderId?: string;
      expiryTimeMillis?: string;
    }
  | { ok: false; error: string };

function loadServiceAccount(): object | null {
  const jsonInline = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonInline) {
    try {
      return JSON.parse(jsonInline) as object;
    } catch {
      return null;
    }
  }
  const path = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PATH?.trim();
  if (path && existsSync(path)) {
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as object;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Verify a Play Billing subscription purchase with Google Play Developer API.
 * When verification is disabled (dev), accepts well-formed tokens without calling Google.
 */
export async function verifyGooglePlaySubscription(
  input: GooglePlayPurchaseInput,
): Promise<GooglePlayVerifyResult> {
  const packageName = (
    input.packageName?.trim() ||
    config.googlePlayPackageName
  ).trim();
  const productId = input.productId.trim();
  const purchaseToken = input.purchaseToken.trim();

  if (!purchaseToken || !productId) {
    return { ok: false, error: 'invalid_purchase' };
  }

  if (productId !== config.googlePlayPremiumProductId) {
    return { ok: false, error: 'unknown_product' };
  }

  if (!config.googlePlayRequirePurchaseVerify) {
    return {
      ok: true,
      packageName,
      productId,
      purchaseToken,
      orderId: input.orderId,
    };
  }

  const credentials = loadServiceAccount();
  if (!credentials) {
    return { ok: false, error: 'play_credentials_missing' };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    const androidpublisher = google.androidpublisher({ version: 'v3', auth });
    const response = await androidpublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });

    const data = response.data;
    // paymentState 1 = received; 2 = free trial; expiry in the future = active
    const expiry = data.expiryTimeMillis
      ? Number.parseInt(data.expiryTimeMillis, 10)
      : NaN;
    const active =
      !Number.isFinite(expiry) || expiry > Date.now() || data.paymentState === 1;

    if (!active && data.cancelReason != null && !data.expiryTimeMillis) {
      return { ok: false, error: 'subscription_inactive' };
    }

    return {
      ok: true,
      packageName,
      productId,
      purchaseToken,
      orderId: data.orderId ?? input.orderId,
      expiryTimeMillis: data.expiryTimeMillis ?? undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `play_verify_failed:${message}` };
  }
}
