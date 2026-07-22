# Play Console — one-time setup checklist

1. Create Google Play Developer account (~USD 25).
2. Create app → package name **`pl.ukrywane.voiceapp`** (must match release AAB).
3. Host privacy policy at **https://ukrywane.pl/privacy** (copy from this folder).
4. Complete **Data safety** using [DATA_SAFETY.md](./DATA_SAFETY.md).
5. Content rating (IARC), target audience, news/COVID/ads declarations.
6. Create subscription product:
   - Product ID: **`voiceapp_premium_monthly`** (must match app `GOOGLE_PLAY_PREMIUM_PRODUCT_ID` / `src/config/billing.ts`)
   - Base plan: monthly, price aligned with `PREMIUM_PRICE_USD` (e.g. $4.99)
7. Link a Google Play **service account** for purchase verification; put JSON on the API host and set `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (see `server/.env.example`).
8. Upload AAB to **Internal testing** first (`npm run android:bundle:release`).
9. Add license testers; verify Premium purchase → credits grant.
10. Promote to Production with staged rollout.
