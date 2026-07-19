import type { AudioEffectKey, AudioEffects } from '@/types/voiceStudio';

/** Neutral slider values — used when no effect is selected. */
export const NEUTRAL_AUDIO_EFFECTS: AudioEffects = {
  pitch: 50,
  tempo: 50,
  echo: 50,
  reverb: 50,
  bass: 50,
};

export const AUDIO_EFFECT_KEYS = [
  'pitch',
  'tempo',
  'echo',
  'reverb',
  'bass',
] as const satisfies readonly AudioEffectKey[];
