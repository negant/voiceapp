import type { AudioEffectKey } from '@/types/voiceStudio';

export type EffectSliderProps = {
  label: string;
  effectKey: AudioEffectKey;
  value: number;
  disabled?: boolean;
  onValueChange: (key: AudioEffectKey, value: number) => void;
};
