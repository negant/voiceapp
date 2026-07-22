import { DEFAULT_STARTING_CREDITS } from '@/config/credits';
import { SETTING_KEYS } from '@/services/database/constants';
import { getSetting, setSetting } from '@/services/database/settingsRepository';

/**
 * Marks that local SQLite was initialized without a free-pool grant.
 * Welcome credits come only from the credits API (`bootstrapStatus=granted`).
 */
export const CREDITS_SEED_VERSION_API_ONLY = 'api-welcome-only';

/** @deprecated Legacy seed marker — treated as already initialized. */
export const CREDITS_SEED_VERSION_FREE_WELCOME = 'free-welcome-10';

export type EnsureInitialCreditsBalanceResult = {
  balance: number;
  /** Always 0 locally — free grants are API-authoritative only. */
  newlyGrantedCredits: number;
};

/** Expected free-pool grant size when the backend approves an install. */
export function resolveWelcomeCredits(): number {
  return DEFAULT_STARTING_CREDITS;
}

export function parseCreditsBalance(
  value: string | null | undefined,
): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export async function getCreditsBalance(): Promise<number> {
  const raw = await getSetting(SETTING_KEYS.CREDITS_BALANCE);
  return parseCreditsBalance(raw) ?? 0;
}

/**
 * Ensures a persisted balance exists. Does **not** grant free welcome credits —
 * that happens only via backend register when the install pool has slots.
 */
export async function ensureInitialCreditsBalance(): Promise<EnsureInitialCreditsBalanceResult> {
  const [seedVersion, raw] = await Promise.all([
    getSetting(SETTING_KEYS.CREDITS_SEED_VERSION),
    getSetting(SETTING_KEYS.CREDITS_BALANCE),
  ]);
  const parsed = parseCreditsBalance(raw);
  const isInitialized =
    seedVersion === CREDITS_SEED_VERSION_API_ONLY ||
    seedVersion === CREDITS_SEED_VERSION_FREE_WELCOME;

  if (!isInitialized) {
    const balance = parsed ?? 0;
    await setSetting(SETTING_KEYS.CREDITS_BALANCE, String(balance));
    await setSetting(
      SETTING_KEYS.CREDITS_SEED_VERSION,
      CREDITS_SEED_VERSION_API_ONLY,
    );
    return { balance, newlyGrantedCredits: 0 };
  }

  if (parsed !== null) {
    return { balance: parsed, newlyGrantedCredits: 0 };
  }

  await setSetting(SETTING_KEYS.CREDITS_BALANCE, '0');
  return { balance: 0, newlyGrantedCredits: 0 };
}

export async function setCreditsBalance(balance: number): Promise<void> {
  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error('Invalid credits balance');
  }

  await setSetting(SETTING_KEYS.CREDITS_BALANCE, String(Math.floor(balance)));
}
