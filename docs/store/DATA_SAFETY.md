# Google Play — Data safety (Voice App)

Fill Play Console → App content → Data safety using this sheet. Package: `pl.ukrywane.voiceapp`.

## Does your app collect or share user data?

**Yes.**

## Data collected

| Category | Type | Collected | Shared | Purpose | Ephemeral? | Required? |
|----------|------|-----------|--------|---------|------------|-----------|
| Audio files | Audio / voice recordings | Yes (user-initiated) | Yes — only when user runs **AI** effect (to AI provider) | App functionality | Shared audio: ephemeral at provider; local files persist until user deletes | Optional (app works without AI / mic) |
| Device or other IDs | Device ID (app-generated UUID) | Yes | Yes — to our API `api.ukrywane.pl` | App functionality, fraud prevention, account management (credits) | No | Yes for credits sync |
| App activity | App interactions (plan, spend events) | Yes (on our servers) | No (only our backend) | App functionality | No | Yes for Premium / credits |
| Purchase history | Purchase token / order refs via Play | Yes (via Play Billing verify) | With Google as payment processor; stored on our API for entitlement | App functionality | No | Required for Premium |

## Data not collected

- Name, email, phone, address
- Precise or approximate location
- Photos / video (except user-picked audio files)
- Contacts, calendar, SMS
- Advertising ID / analytics SDKs (none by default)
- Crash / performance telemetry SDKs (none by default)

## Security practices

- [x] Data is encrypted in transit (HTTPS to API and AI provider)
- [ ] Users can request deletion — support via Device ID / email (manual process)
- [x] Committed to Play Families Policy if applicable: **No** (not primarily for children)

## Privacy policy URL

`https://ukrywane.pl/privacy` (host [`privacy-policy.en.md`](./privacy-policy.en.md) / [`privacy-policy.pl.md`](./privacy-policy.pl.md) or [`privacy-policy.html`](./privacy-policy.html))

## Independent security review

No.

## Ads

No ads.

## Permissions declarations (Console)

- `RECORD_AUDIO` — record voice for processing
- `READ_MEDIA_AUDIO` / legacy storage — import user-selected audio
- `INTERNET` — API, AI, updates
- `com.android.vending.BILLING` — Premium subscription (merged by Play Billing library)
