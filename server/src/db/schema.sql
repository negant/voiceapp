-- Voice App API schema (Postgres)
-- Shared domain knowledge: ../.aiassistant/rules/credits-backend.md

CREATE TABLE IF NOT EXISTS voiceapp_devices (
  device_id TEXT PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  free_credits INTEGER NOT NULL DEFAULT 0 CHECK (free_credits >= 0),
  free_credits_expires_at TIMESTAMPTZ,
  premium_credits_renew_at TIMESTAMPTZ,
  -- First successful register for this device_id (survives reinstall if ID is stable)
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- When the current plan became active
  plan_enabled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Last time Premium was turned off (NULL if never downgraded)
  plan_disabled_at TIMESTAMPTZ,
  app_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_voiceapp_devices_plan
  ON voiceapp_devices (plan);

CREATE INDEX IF NOT EXISTS idx_voiceapp_devices_installed_at
  ON voiceapp_devices (installed_at);

-- Audit trail: install + plan enable/disable/renew
CREATE TABLE IF NOT EXISTS voiceapp_device_plan_events (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES voiceapp_devices (device_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'installed',
      'plan_enabled',
      'plan_disabled',
      'plan_renewed'
    )
  ),
  plan TEXT NOT NULL CHECK (plan IN ('free', 'premium')),
  previous_plan TEXT CHECK (previous_plan IN ('free', 'premium')),
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voiceapp_device_plan_events_device
  ON voiceapp_device_plan_events (device_id, created_at DESC);

CREATE TABLE IF NOT EXISTS voiceapp_setup (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voiceapp_credit_ledger (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES voiceapp_devices (device_id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  delta_credits INTEGER NOT NULL DEFAULT 0,
  delta_free_credits INTEGER NOT NULL DEFAULT 0,
  balance_credits INTEGER NOT NULL,
  balance_free_credits INTEGER NOT NULL,
  client_request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT voiceapp_credit_ledger_request_unique UNIQUE (client_request_id)
);

CREATE INDEX IF NOT EXISTS idx_voiceapp_credit_ledger_device
  ON voiceapp_credit_ledger (device_id, created_at DESC);

-- Singleton stats row (exactly one row, id = 1)
CREATE TABLE IF NOT EXISTS voiceapp_stats (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  install_count INTEGER NOT NULL DEFAULT 0 CHECK (install_count >= 0),
  free_credits_grants INTEGER NOT NULL DEFAULT 0 CHECK (free_credits_grants >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO voiceapp_stats (id, install_count, free_credits_grants)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Legacy meta (kept for older DBs; new code uses voiceapp_stats)
CREATE TABLE IF NOT EXISTS voiceapp_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO voiceapp_setup (key, value) VALUES
  ('min_app_version', '0.0.1'),
  ('latest_app_version', '0.0.1'),
  ('force_update', 'false'),
  ('message_en', ''),
  ('message_pl', ''),
  ('store_url_ios', ''),
  ('store_url_android', ''),
  -- First N unique device installs may receive welcome free credits
  ('free_credits_install_cap', '30')
ON CONFLICT (key) DO NOTHING;
