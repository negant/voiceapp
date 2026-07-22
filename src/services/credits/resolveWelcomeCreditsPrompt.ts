import type { CreditsBootstrapStatus } from '@/services/credits/types';

/**
 * Post-install welcome dialog only when the free pool actually granted credits.
 * Returning devices (`already_registered`) and exhausted pool → no prompt.
 */
export function resolveWelcomeCreditsPromptAmount(
  status: CreditsBootstrapStatus,
  grantedCredits: number,
): number | null {
  if (status !== 'granted') {
    return null;
  }

  const amount = Math.floor(grantedCredits);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount;
}
