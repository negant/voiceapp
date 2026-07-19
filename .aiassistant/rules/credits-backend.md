---
apply: always
---

# Kredyty — ekonomia + API urządzeń (`server/`)

Wspólna wiedza domenowa dla **aplikacji** i **API** w monorepo. Implementacja API: katalog [`server/`](../../server/README.md) (Node.js + Fastify + Postgres w Dockerze).

## Model produktu
| Parametr | Wartość | Źródło |
|----------|---------|--------|
| Koszt API WaveSpeed | **$0.02 / rozpoczęta minuta** | `WAVESPEED_USD_PER_STARTED_MINUTE` |
| Stawka w aplikacji | **$0.05 / min** (łatwa zmiana) | env `APP_USD_PER_STARTED_MINUTE` |
| Jednostka | **1 kredyt = 1 rozpoczęta minuta** | `CREDITS_PER_STARTED_MINUTE` |
| Free (start) | **10** `free_credits` | `STARTING_CREDITS` / `STARTING_FREE_CREDITS` |
| Free ważność | **3 miesiące** od grantu | `FREE_CREDITS_VALIDITY_MONTHS` |
| Premium | **$4.99** → **100 + 25 = 125** min | env Premium |
| Premium odnowienie | **co 1 miesiąc** (reset puli) | `PREMIUM_CREDITS_RENEWAL_MONTHS` |
| Doładowania | **brak** — tylko Premium | UI Credits |

Rozliczanie: `ceil(durationSec / 60)` × stawka.

## Anty-abuse (bez kont użytkownika)
- Brak PII — tylko **`device_id`** (UUID).
- Grant free **raz na `device_id`**; reinstall z tym samym ID → `already_registered`, bez nowych free.
- Aby ID przetrwało reinstall: docelowo Keychain (iOS) / Keystore (Android). Dziś: SQLite (`SETTING_KEYS.DEVICE_ID`) — wystarczy do sync i supportu; pełna odporność na reinstall = secure storage.
- Device ID widoczny w **Ustawienia → O aplikacji** (do zgłoszeń).

## Tabele Postgres
| Tabela | Rola |
|--------|------|
| `voiceapp_devices` | saldo, plan, daty instalacji / włączenia / wyłączenia planu |
| `voiceapp_device_plan_events` | `installed`, `plan_enabled`, `plan_disabled`, `plan_renewed` |
| `voiceapp_setup` | wersje, force update, komunikaty PL/EN |
| `voiceapp_credit_ledger` | audyt spend/grant + idempotency |
| `voiceapp_meta` | licznik puli free installs |

### `voiceapp_devices` — kluczowe pola
- `installed_at` — pierwsza rejestracja urządzenia
- `plan` — `free` \| `premium`
- `plan_enabled_at` — kiedy włączono bieżący plan
- `plan_disabled_at` — kiedy wyłączono Premium (NULL jeśli nigdy)
- `credits` / `free_credits` / `free_credits_expires_at`
- `premium_credits_renew_at` — następne odnowienie miesięczne

## Auth
Wszystkie endpointy (poza `GET /health`) wymagają:

```
Authorization: Bearer <CREDITS_API_TOKEN>
```

App: `CREDITS_API_BASE_URL` + `CREDITS_API_TOKEN` w `.env`.

## Endpointy
| Metoda | Ścieżka | Opis |
|--------|---------|------|
| `GET` | `/v1/setup` | aktualizacje / komunikaty |
| `POST` | `/v1/devices/register` | rejestracja + grant free |
| `POST` | `/v1/credits/bootstrap` | alias register (kompatybilność) |
| `GET` | `/v1/devices/:deviceId` | snapshot |
| `GET` | `/v1/devices/:deviceId/plan-events` | historia planu |
| `POST` | `/v1/credits/sync` | sync + expiry free + renew premium |
| `POST` | `/v1/credits/spend` | zużycie (najpierw free) |
| `POST` | `/v1/credits/plan` | enable/disable Premium |

## Lokalny start API
```bash
cd server && cp .env.example .env
npm install && npm run docker:up && npm run migrate && npm run dev
```

## UI planów
- Free: kredyty powitalne + ważność **3 miesiące**
- Premium: pakiet minut + **odnawianie co miesiąc**

## Bezpieczeństwo
- Nie logować `CREDITS_API_TOKEN` / kluczy WaveSpeed.
- Saldo autorytatywne po stronie API przy online; lokalne SQLite = cache / offline fallback.
