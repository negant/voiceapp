import { alienPreset } from '@/services/audio/basicEffects/presets/alien';
import { demonPreset } from '@/services/audio/basicEffects/presets/demon';
import { heliumPreset } from '@/services/audio/basicEffects/presets/helium';
import { leaderPreset } from '@/services/audio/basicEffects/presets/leader';
import { oldRadioPreset } from '@/services/audio/basicEffects/presets/oldRadio';
import { robotPreset } from '@/services/audio/basicEffects/presets/robot';
import { telephonePreset } from '@/services/audio/basicEffects/presets/telephone';
import type { BasicWetPresetModule } from '@/services/audio/basicEffects/wetPresetTypes';

export type WetPresetVoice =
  | 'robot'
  | 'helium'
  | 'oldRadio'
  | 'demon'
  | 'telephone'
  | 'leader'
  | 'alien';

export const WET_PRESET_REGISTRY: Record<
  WetPresetVoice,
  BasicWetPresetModule
> = {
  robot: robotPreset,
  helium: heliumPreset,
  oldRadio: oldRadioPreset,
  demon: demonPreset,
  telephone: telephonePreset,
  leader: leaderPreset,
  alien: alienPreset,
};
