# Production release env (app)

Copy into `.env` for store builds (`APP_ENV=production`). Never commit real secrets.

```env
APP_ENV=production
DEBUG_MODE=false
APP_DISPLAY_NAME=Voice App

BACKEND_API_BASE_URL=https://api.ukrywane.pl
BACKEND_API_TOKEN=<same as server API_TOKEN>

AI_EFFECTS_API_KEY=<wavespeed key>
AI_EFFECTS_API_BASE_URL=https://api.wavespeed.ai/api/v3
ENABLE_AI_EFFECTS=true

PRIVACY_POLICY_URL=https://ukrywane.pl/privacy

PREMIUM_PRICE_USD=4.99
PREMIUM_CREDITS=100
PREMIUM_GRATIS_CREDITS=25
STARTING_CREDITS=10
MAX_AUDIO_DURATION_FREE_SEC=60
MAX_AUDIO_DURATION_PREMIUM_SEC=600
```

After changing `.env`: `npm start -- --reset-cache`, then `npm run android:bundle:release`.
