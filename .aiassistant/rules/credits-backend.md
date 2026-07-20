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
| Free ważność | **3 miesiące od `installed_at`** | `FREE_CREDITS_VALIDITY_MONTHS` |
| Free + Premium | free credits **bezterminowe** (nie wygasają) | `plan=premium` → `free_credits_expires_at=NULL` |
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
| `voiceapp_setup` | wersje, force update, komunikaty, **`free_credits_install_cap`** (domyślnie 30) |
| `voiceapp_stats` | singleton: `install_count`, `free_credits_grants` |
| `voiceapp_credit_ledger` | audyt spend/grant + idempotency |

### `voiceapp_devices` — kluczowe pola
- `installed_at` — pierwsza rejestracja urządzenia
- `plan` — `free` \| `premium`
- `plan_enabled_at` — kiedy włączono bieżący plan
- `plan_disabled_at` — kiedy wyłączono Premium (NULL jeśli nigdy)
- `credits` / `free_credits` / `free_credits_expires_at`
- `premium_credits_renew_at` — następne odnowienie miesięczne

## App ↔ API sync
| Moment | Endpoint |
|--------|----------|
| Start aplikacji | `POST /v1/devices/register` + `POST /v1/credits/sync` |
| Włączenie / wyłączenie Premium (IAP / switch) | `POST /v1/credits/plan` |
| Zużycie AI | `POST /v1/credits/spend` |
| Brak API / offline | lokalne SQLite (fallback) |

Saldo z odpowiedzi API nadpisuje lokalny cache.

```
Authorization: Bearer <CREDITS_API_TOKEN>
```

App: `CREDITS_API_BASE_URL` + `CREDITS_API_TOKEN` w `.env`.

**Production:** `CREDITS_API_BASE_URL=https://api.ukrywane.pl` (VPS `91.228.196.27`, Caddy HTTPS).

**Dev na fizycznym telefonie:** `localhost` nie działa — użyj IP Maca w LAN (np. `http://192.168.x.x:8787`). Emulator Android: `http://10.0.2.2:8787`. Po zmianie `.env` zrestartuj Metro.

Logi syncu (dev): `credits_register`, `credits_sync`, `credits_plan`, `credits_spend` w `server/logs/api-*.log`.

## Endpointy
| Metoda | Ścieżka | Opis |
|--------|---------|------|
| `GET` | `/v1/setup` | aktualizacje + cap free + stats |
| `GET` | `/v1/stats` | install_count / free grants |
| `POST` | `/v1/devices/register` | rejestracja + grant free **lub restore** planu/kredytów |
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

### Logi (tylko development)
- Pliki `server/logs/api-YYYY-MM-DD.log` powstają **wyłącznie** gdy `NODE_ENV=development` (domyślnie lokalnie).
- W wpisach request/response pojawia się **`deviceId`**, gdy jest w body, params lub ścieżce `/v1/devices/:id`.
- Staging/production: brak zapisu do `logs/` — tylko stdout (Fastify logger).
- Podgląd: `npm run logs:tail` (z katalogu `server/`). Zawartość `logs/*.log` w `.gitignore`.

### Podgląd bazy
- `npm run db:psql` / `db:tables` / `db:devices`
- GUI: `127.0.0.1:5432`, user/hasło/db `voiceapp` (patrz `server/README.md`)

## UI planów
- Free: kredyty powitalne + ważność **3 miesiące**
- Premium: pakiet minut + **odnawianie co miesiąc**

## Bezpieczeństwo
- Nie logować `CREDITS_API_TOKEN` / kluczy WaveSpeed.
- Saldo autorytatywne po stronie API przy online; lokalne SQLite = cache / offline fallback.
