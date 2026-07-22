# Deploy API na VPS (Debian)

Domena: **https://api.ukrywane.pl** → A → IP VPS.

## Wymagania

- Debian 12/13, SSH root lub sudo
- Min. **2 GB RAM**, porty **22**, **80**, **443** (8787 tylko localhost)
- Repo na GitHubie (public) lub kopia `server/` przez scp/rsync

## 1. Podstawy serwera

```bash
apt update && apt upgrade -y
apt install -y curl git ufw

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## 2. Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
docker --version
```

## 3. Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v   # >= 22.11
```

## 4. Kod

**Git (całe repo):**

```bash
mkdir -p /opt/voice-app
cd /opt/voice-app
git clone https://github.com/TWOJ_USER/voice-app.git .
cd server
```

**Albo tylko `server/` z Maca:**

```bash
# na Macu, w katalogu voice-app:
rsync -avz --exclude node_modules --exclude logs server/ root@91.228.196.27:/opt/voice-app/server/
```

## 5. `.env` produkcyjny

```bash
cd /opt/voice-app/server
cp .env.example .env
nano .env
```

Ustaw (przykład):

```env
PORT=8787
HOST=127.0.0.1
NODE_ENV=production

API_TOKEN=<silny-token-taki-sam-jak-BACKEND_API_TOKEN-w-app>

POSTGRES_USER=voiceapp
POSTGRES_PASSWORD=<silne-haslo>
POSTGRES_DB=voiceapp
POSTGRES_PORT=5432
DATABASE_URL=postgres://voiceapp:<silne-haslo>@127.0.0.1:5432/voiceapp
```

Token wygeneruj na Macu: `openssl rand -hex 32`

## 6. Postgres + build API

```bash
cd /opt/voice-app/server
npm install
docker compose up -d --force-recreate
docker port voiceapp-postgres 5432
npm run migrate
npm run build
npm test
node dist/index.js &
curl -s http://127.0.0.1:8787/health
kill %1
```

Oczekiwane: `{"ok":true,"service":"voiceapp-api"}`.

## 7. systemd (API zawsze włączone)

```bash
cp /opt/voice-app/server/deploy/voiceapp-api.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable voiceapp-api
systemctl start voiceapp-api
systemctl status voiceapp-api
journalctl -u voiceapp-api -f
```

## 8. Caddy (HTTPS)

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

```bash
cp /opt/voice-app/server/deploy/Caddyfile.example /etc/caddy/Caddyfile
# lub dopisz blok api.ukrywane.pl do istniejącego pliku
systemctl reload caddy
```

Test z Maca:

```bash
curl https://api.ukrywane.pl/health
curl -H "Authorization: Bearer TWOJ_TOKEN" https://api.ukrywane.pl/v1/setup
```

## 9. App mobilna

W `.env` (już ustawione):

```env
BACKEND_API_BASE_URL=https://api.ukrywane.pl
BACKEND_API_TOKEN=<ten sam co API_TOKEN>
```

Metro: `npm start -- --reset-cache`

## Aktualizacja wersji

```bash
cd /opt/voice-app && git pull
cd server && npm install && npm run build && systemctl restart voiceapp-api
```

## Backup Postgres

```bash
mkdir -p /root/backups
docker compose exec -T postgres \
  pg_dump -U voiceapp voiceapp > /root/backups/voiceapp-$(date +%F).sql
```
