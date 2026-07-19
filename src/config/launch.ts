/** Minimum time the launch screen stays visible so the logo animation can play. */
export const LAUNCH_MIN_DURATION_MS = 1500;

/** Fade-out duration before handing off to the main navigator. */
export const LAUNCH_FADE_OUT_MS = 350;

export function canCompleteLaunch(
  isAppReady: boolean,
  minDurationElapsed: boolean,
): boolean {
  return isAppReady && minDurationElapsed;
}
