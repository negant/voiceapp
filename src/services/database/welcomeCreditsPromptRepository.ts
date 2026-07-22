import { SETTING_KEYS } from '@/services/database/constants';
import { getSetting, setSetting } from '@/services/database/settingsRepository';

function parsePromptAmount(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

/** Amount to show in the post-install welcome dialog, if not yet acknowledged. */
export async function getPendingWelcomeCreditsPrompt(): Promise<number | null> {
  const raw = await getSetting(SETTING_KEYS.WELCOME_CREDITS_PROMPT);
  return parsePromptAmount(raw);
}

/** Persist grant so the dialog survives app restarts until the user taps OK. */
export async function setPendingWelcomeCreditsPrompt(
  amount: number,
): Promise<void> {
  const next = Math.floor(amount);
  if (!Number.isFinite(next) || next <= 0) {
    throw new Error('Invalid welcome credits prompt amount');
  }
  await setSetting(SETTING_KEYS.WELCOME_CREDITS_PROMPT, String(next));
}

/** Clear after the user dismisses the welcome dialog. */
export async function clearPendingWelcomeCreditsPrompt(): Promise<void> {
  await setSetting(SETTING_KEYS.WELCOME_CREDITS_PROMPT, '0');
}
