import { DEFAULT_CREDITS_PER_AI_10_SEC } from '@/config/credits';
import { SETTING_KEYS } from '@/services/database/constants';
import { getSetting, setSetting } from '@/services/database/settingsRepository';

export type CreditsEconomyConfig = {
  creditsPerAi10Sec: number;
};

function parsePositiveInt(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function getCreditsPerAi10Sec(): Promise<number> {
  const raw = await getSetting(SETTING_KEYS.CREDITS_PER_AI_10_SEC);
  return parsePositiveInt(raw) ?? DEFAULT_CREDITS_PER_AI_10_SEC;
}

export async function ensureInitialCreditsEconomy(): Promise<CreditsEconomyConfig> {
  const raw = await getSetting(SETTING_KEYS.CREDITS_PER_AI_10_SEC);
  const parsed = parsePositiveInt(raw);

  if (parsed !== null) {
    return { creditsPerAi10Sec: parsed };
  }

  await setSetting(
    SETTING_KEYS.CREDITS_PER_AI_10_SEC,
    String(DEFAULT_CREDITS_PER_AI_10_SEC),
  );

  return { creditsPerAi10Sec: DEFAULT_CREDITS_PER_AI_10_SEC };
}

/** Reserved for future remote config / API sync. */
export async function setCreditsPerAi10Sec(creditsPer10Sec: number): Promise<void> {
  if (!Number.isFinite(creditsPer10Sec) || creditsPer10Sec <= 0) {
    throw new Error('Invalid credits per 10 s rate');
  }

  await setSetting(
    SETTING_KEYS.CREDITS_PER_AI_10_SEC,
    String(Math.floor(creditsPer10Sec)),
  );
}

export async function getCreditsEconomyConfig(): Promise<CreditsEconomyConfig> {
  return ensureInitialCreditsEconomy();
}
