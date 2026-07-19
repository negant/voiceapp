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
| `voiceapp_setup` | aktualizacje / komunikaty dla appki |
| `voiceapp_credit_ledger` | audyt zużycia / grantów (idempotency `client_request_id`) |
| `voiceapp_meta` | licznik puli free installs |

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
CREDITS_API_BASE_URL=http://localhost:8787
CREDITS_API_TOKEN=dev-voiceapp-api-token-change-me
```

Na Android emulatorze: `http://10.0.2.2:8787`. Na urządzeniu fizycznym: IP komputera w LAN.
