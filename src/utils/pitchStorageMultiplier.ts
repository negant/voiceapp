import {
  AUDIO_EFFECT_STORAGE_NEUTRAL,
  storageToDisplay,
} from '@/utils/audioEffectScale';

/** Maps pitch storage (0–100, 50 neutral) to a playback multiplier. */
export function pitchStorageToMultiplier(storage: number): number {
  const display = storageToDisplay(storage);
  const detuneCents = (display / 10) * 500;
  return 2 ** (detuneCents / 1200);
}

export function isNeutralPitchStorage(storage: number): boolean {
  return storage === AUDIO_EFFECT_STORAGE_NEUTRAL;
}
