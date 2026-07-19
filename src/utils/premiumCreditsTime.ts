import { DEFAULT_CREDITS_PER_AI_10_SEC } from '@/config/credits';
import {
  calculateAiSecondsAffordableFromCredits,
  formatAiDurationSeconds,
} from '@/utils/creditsEconomy';

/** @deprecated Use calculateAiSecondsAffordableFromCredits */
export function calculatePremiumMinutesFromCredits(
  credits: number,
  creditsPer10Sec: number = DEFAULT_CREDITS_PER_AI_10_SEC,
): number {
  return calculateAiSecondsAffordableFromCredits(credits, creditsPer10Sec) / 60;
}

/** @deprecated Use formatAiDurationSeconds */
export function formatPremiumMinutes(minutes: number, locale: string): string {
  return formatAiDurationSeconds(Math.round(minutes * 60), locale);
}

export {
  calculateAi10SecPreviewsFromCredits,
  calculateAiSecondsAffordableFromCredits,
  calculateCreditsForAiDurationSec,
  formatAiDurationSeconds,
} from '@/utils/creditsEconomy';
