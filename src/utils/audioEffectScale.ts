/** Stored effect values use 0–100 with 50 as neutral. UI shows -10…+10. */
export const AUDIO_EFFECT_DISPLAY_MIN = -10;
export const AUDIO_EFFECT_DISPLAY_MAX = 10;
export const AUDIO_EFFECT_STORAGE_NEUTRAL = 50;
export const AUDIO_EFFECT_STORAGE_STEP = 5;

export function storageToDisplay(storage: number): number {
  const display = Math.round(
    (storage - AUDIO_EFFECT_STORAGE_NEUTRAL) / AUDIO_EFFECT_STORAGE_STEP,
  );
  return Math.max(
    AUDIO_EFFECT_DISPLAY_MIN,
    Math.min(AUDIO_EFFECT_DISPLAY_MAX, display),
  );
}

export function displayToStorage(display: number): number {
  const clamped = Math.max(
    AUDIO_EFFECT_DISPLAY_MIN,
    Math.min(AUDIO_EFFECT_DISPLAY_MAX, Math.round(display)),
  );
  return AUDIO_EFFECT_STORAGE_NEUTRAL + clamped * AUDIO_EFFECT_STORAGE_STEP;
}

export function parseDisplayInput(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (normalized === '' || normalized === '-' || normalized === '+') {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
