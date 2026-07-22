# Privacy Policy — Voice App

**Last updated:** 2026-07-22  
**Operator:** Voice App / ukrywane.pl  
**Contact:** support@ukrywane.pl  
**Public URL (host this file):** https://ukrywane.pl/privacy

## Summary

Voice App processes audio on your device for Basic and Advanced effects. Optional AI voice effects send audio to a cloud provider. We do not require a user account. We use a random device identifier for credits and abuse prevention.

## Data we process

| Data | Purpose | Stored where |
|------|---------|--------------|
| Audio you import, record, or export | Local voice effects; export to your files | On device (SQLite / app storage) |
| Audio sent for AI effects | Cloud voice conversion (WaveSpeed / configured STS provider) | Transiently with the AI provider while the request runs |
| Device ID (random UUID) | Credits balance, free grant once per device, support | On device (secure storage) and on our API (`api.ukrywane.pl`) |
| Account plan / credit ledger | Enforce free vs Premium, spend AI minutes | Our Postgres API |
| App version / platform | Setup, force-update, diagnostics | Our API (non-identifying) |
| Purchase tokens (Google Play) | Verify Premium subscription | Our API (to grant and renew Premium) |

We do **not** collect your name, email, phone number, or precise location as part of the core product.

## Permissions (Android)

- **Microphone** — only to record audio when you choose Record.
- **Read audio / media** — only to import audio you select.
- **Internet** — credits API, optional AI effects, update checks.

## Legal bases (EEA/UK)

- **Contract / requested service** — processing audio and credits you ask for.
- **Legitimate interest** — device ID for fraud prevention on free credits; security of the API.

## Third parties

- **Our API** (`api.ukrywane.pl`) — devices, credits, setup.
- **AI effects provider** (configured via `AI_EFFECTS_*`, currently WaveSpeed) — receives audio only when you run an AI effect.
- **Google Play** — billing for Premium; Google processes payment data under their terms.

## Retention

- Local audio and presets: until you delete them or clear app data.
- Device credit records: retained while needed for the service and abuse prevention.
- Purchase verification records: retained as required for billing disputes and renewals.

## Your choices

- Use Basic/Advanced without AI — audio stays on device.
- Decline microphone / media permissions — related features stay unavailable.
- Manage or cancel Premium in Google Play subscriptions.
- Contact support with your Device ID (Settings → About) for credit issues.

## Children

Voice App is not directed at children under 13 (or the minimum age in your country).

## Changes

We may update this policy. The “Last updated” date and the hosted URL will reflect the current version.

## Contact

support@ukrywane.pl
