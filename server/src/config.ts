import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Load server/.env into process.env before reading config (idempotent). */
function loadEnvFile(): void {
  try {
    const envPath = resolve(process.cwd(), '.env');
    if (!existsSync(envPath)) {
      return;
    }
    const text = readFileSync(envPath, 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      const eq = trimmed.indexOf('=');
      if (eq <= 0) {
        continue;
      }
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // optional .env
  }
}

loadEnvFile();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  return raw.toLowerCase() === 'true' || raw === '1';
}

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const config = {
  port: intEnv('PORT', 8787),
  host: process.env.HOST ?? '0.0.0.0',
  nodeEnv,
  apiToken: required('API_TOKEN', 'dev-voiceapp-api-token-change-me'),
  databaseUrl: required(
    'DATABASE_URL',
    'postgres://voiceapp:voiceapp@127.0.0.1:5432/voiceapp',
  ),
  startingFreeCredits: intEnv('STARTING_FREE_CREDITS', 10),
  freeCreditsValidityMonths: intEnv('FREE_CREDITS_VALIDITY_MONTHS', 3),
  premiumCredits: intEnv('PREMIUM_CREDITS', 100),
  premiumGratisCredits: intEnv('PREMIUM_GRATIS_CREDITS', 25),
  freeInstallsWithTestCredits: intEnv('FREE_INSTALLS_WITH_TEST_CREDITS', 30),
  creditsPerStartedMinute: intEnv('CREDITS_PER_STARTED_MINUTE', 1),
  googlePlayPackageName:
    process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim() || 'pl.ukrywane.voiceapp',
  googlePlayPremiumProductId:
    process.env.GOOGLE_PLAY_PREMIUM_PRODUCT_ID?.trim() ||
    'voiceapp_premium_monthly',
  /** Production default: require Play purchase token verification for Premium. */
  googlePlayRequirePurchaseVerify: boolEnv(
    'GOOGLE_PLAY_REQUIRE_PURCHASE_VERIFY',
    nodeEnv === 'production',
  ),
} as const;

export type AppConfig = typeof config;
