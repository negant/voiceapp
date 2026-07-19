import type { FfmpegFilterStep } from '@/services/audio/advancedEffects/types';
import {
  isNeutralPitchStorage,
  pitchStorageToMultiplier,
} from '@/utils/pitchStorageMultiplier';

/** Applies user pitch tweak on top of built-in advanced pitch_shift steps. */
export function applyPitchOverrideToFilters(
  filters: FfmpegFilterStep[],
  pitchStorage?: number,
): FfmpegFilterStep[] {
  if (pitchStorage === undefined || isNeutralPitchStorage(pitchStorage)) {
    return filters;
  }

  const multiplier = pitchStorageToMultiplier(pitchStorage);

  return filters.map(step =>
    step.type === 'pitch_shift'
      ? { ...step, factor: step.factor * multiplier }
      : step,
  );
}
