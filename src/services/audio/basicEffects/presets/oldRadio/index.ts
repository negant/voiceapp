import type { BasicWetPresetModule } from '@/services/audio/basicEffects/wetPresetTypes';
import { connectOldRadioEcho } from './connectEcho';
import { connectOldRadioVoiceChain } from './voiceChain';
import { calculateOldRadioWetTailSec, resolveOldRadioMixGains } from './mixGains';
import { connectOldRadioNoise } from './ambience';

export const oldRadioPreset: BasicWetPresetModule = {
  id: 'oldRadio',
  calculateTailSec: calculateOldRadioWetTailSec,
  resolveMixGains: resolveOldRadioMixGains,
  connectVoiceChain: connectOldRadioVoiceChain,
  connectEcho: connectOldRadioEcho,
  connectAmbience: connectOldRadioNoise,
};
