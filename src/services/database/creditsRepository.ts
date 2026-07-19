import { DEFAULT_STARTING_CREDITS } from '@/config/credits';
import { SETTING_KEYS } from '@/services/database/constants';
import { getSetting, setSetting } from '@/services/database/settingsRepository';

/** Free-plan welcome grant (10 credits). Bumped when changing welcome size. */
export const CREDITS_SEED_VERSION_FREE_WELCOME = 'free-welcome-10';

/** Previous welcome sizes — reset to current grant when still untouched. */
const LEGACY_FULL_WELCOME_BALANCES = new Set([250, 1000]);

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
  return parseCreditsBalance(raw) ?? resolveWelcomeCredits();
}

export async function ensureInitialCreditsBalance(): Promise<number> {
  const [seedVersion, raw] = await Promise.all([
    getSetting(SETTING_KEYS.CREDITS_SEED_VERSION),
    getSetting(SETTING_KEYS.CREDITS_BALANCE),
  ]);
  const parsed = parseCreditsBalance(raw);
  const welcomeGrant = resolveWelcomeCredits();

  if (seedVersion !== CREDITS_SEED_VERSION_FREE_WELCOME) {
    const shouldApplyWelcome =
      parsed === null ||
      parsed === 0 ||
      LEGACY_FULL_WELCOME_BALANCES.has(parsed);

    if (shouldApplyWelcome) {
      await setSetting(SETTING_KEYS.CREDITS_BALANCE, String(welcomeGrant));
      await setSetting(
        SETTING_KEYS.CREDITS_SEED_VERSION,
        CREDITS_SEED_VERSION_FREE_WELCOME,
      );
      return welcomeGrant;
    }

    await setSetting(
      SETTING_KEYS.CREDITS_SEED_VERSION,
      CREDITS_SEED_VERSION_FREE_WELCOME,
    );
    return parsed;
  }

  if (parsed !== null) {
    return parsed;
  }

  await setSetting(SETTING_KEYS.CREDITS_BALANCE, String(welcomeGrant));
  return welcomeGrant;
}

export async function setCreditsBalance(balance: number): Promise<void> {
  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error('Invalid credits balance');
  }

  await setSetting(SETTING_KEYS.CREDITS_BALANCE, String(Math.floor(balance)));
}
