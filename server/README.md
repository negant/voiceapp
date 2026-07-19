# Voice App API

Backend kredytów / urządzeń / setup w monorepo (`server/`).

Wspólna wiedza domenowa: [`.aiassistant/rules/credits-backend.md`](../.aiassistant/rules/credits-backend.md) oraz [`.aiassistant/rules/domain-knowledge.md`](../.aiassistant/rules/domain-knowledge.md).

## Wymagania

- Node.js >= 22.11
- Docker (Postgres 16)

## Start lokalny

```bash
cd server
cp .env.example .env
npm install
npm run docker:up          # Postgres na :5432
npm run migrate            # schema
npm run dev                # API http://localhost:8787
```

Logi requestów na konsolę (zawsze) oraz do plików **tylko gdy `NODE_ENV=development`** (domyślnie lokalnie):

```
server/logs/api-YYYY-MM-DD.log
```

Podgląd na żywo:

```bash
npm run logs:tail
# albo
tail -f logs/api-*.log
```

Folder `logs/` jest w repo (`.gitkeep`), same pliki `*.log` są w `.gitignore`. W staging/production pliki **nie** powstają — zostaje logger Fastify na stdout.

W dev logach request/response jest pole **`deviceId`** (z body, params lub `/v1/devices/:id`), gdy da się je odczytać.

## Podgląd bazy (Postgres w Dockerze)

```bash
# interaktywny psql
npm run db:psql

# lista tabel
npm run db:tables

# ostatnie urządzenia
npm run db:devices
```

Free credits: `free_credits_expires_at` = `installed_at + 3 months`. Przy `plan=premium` expiry jest `NULL` (free zostają na stałe). Sync / register / spend wyzerowują free, gdy minął deadline i plan = free.

Przydatne zapytania w `psql`:

```sql
\dt
SELECT * FROM voiceapp_devices;
SELECT * FROM voiceapp_device_plan_events ORDER BY created_at DESC LIMIT 20;
SELECT * FROM voiceapp_credit_ledger ORDER BY created_at DESC LIMIT 20;
SELECT * FROM voiceapp_setup;
SELECT * FROM voiceapp_meta;
```

GUI (opcjonalnie): [TablePlus](https://tableplus.com/), DBeaver, pgAdmin — connection:

| Pole | Wartość |
|------|---------|
| Host | `127.0.0.1` |
| Port | `5432` |
| User | `voiceapp` |
| Password | `voiceapp` |
| Database | `voiceapp` |

(wartości z `server/.env` / docker-compose)

Health (bez tokena): `GET /health`

Pozostałe endpointy wymagają:

```
Authorization: Bearer <API_TOKEN>
```

## Tabele

| Tabela | Rola |
|--------|------|
| `voiceapp_devices` | device_id, plan, credits, free_credits, daty instalacji / planu |
| `voiceapp_device_plan_events` | historia: installed, plan_enabled, plan_disabled, plan_renewed |
| `voiceapp_setup` | aktualizacje / komunikaty / **`free_credits_install_cap`** (domyślnie **30**) |
| `voiceapp_stats` | **1 wiersz**: `install_count`, `free_credits_grants` |
| `voiceapp_credit_ledger` | audyt zużycia / grantów (idempotency `client_request_id`) |

### Free credits pool
- Limit w `voiceapp_setup.free_credits_install_cap` (domyślnie **30** pierwszych unikalnych device).
- Nowy `device_id` → `install_count++`; free tylko gdy `free_credits_grants < cap`.
- Ten sam `device_id` po reinstall → **`already_registered` / `credits_restore`**: przywraca plan + kredyty, **bez** nowych free.

### Pola planu na urządzeniu

- `installed_at` — kiedy device zarejestrowano pierwszy raz
- `plan` — `free` / `premium`
- `plan_enabled_at` — kiedy włączono bieżący plan
- `plan_disabled_at` — kiedy wyłączono Premium (downgrade)

## Endpointy

| Metoda | Ścieżka | Opis |
|--------|---------|------|
| `GET` | `/v1/setup` | min/latest version, force_update, messages |
| `POST` | `/v1/devices/register` | rejestracja + grant free (raz / device) |
| `POST` | `/v1/credits/bootstrap` | alias (kompatybilność z app stub) |
| `GET` | `/v1/devices/:deviceId` | snapshot urządzenia |
| `GET` | `/v1/devices/:deviceId/plan-events` | historia planu |
| `POST` | `/v1/credits/sync` | sync + expiry free + renew premium |
| `POST` | `/v1/credits/spend` | zużycie (najpierw free_credits) |
| `POST` | `/v1/credits/plan` | włączenie / wyłączenie Premium |

## App `.env`

```
# Fizyczny telefon (LAN) — podmień IP swojego Maca
CREDITS_API_BASE_URL=http://192.168.0.30:8787
# Emulator Android:
# CREDITS_API_BASE_URL=http://10.0.2.2:8787
# iOS Simulator:
# CREDITS_API_BASE_URL=http://localhost:8787
CREDITS_API_TOKEN=dev-voiceapp-api-token-change-me
```

**Ważne:** na fizycznym Androidzie `localhost` = telefon, nie Mac — stąd brak wpisów w `server/logs` i brak zmian w Postgres. Po zmianie `.env` zrestartuj Metro (`npm start -- --reset-cache`).

W logach API (dev) szukaj: `credits_register`, `credits_sync`, `credits_plan`, `credits_spend` (+ `deviceId`, `plan`, `balance`).
