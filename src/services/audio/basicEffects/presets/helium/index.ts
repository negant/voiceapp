import type { BasicWetPresetModule } from '@/services/audio/basicEffects/wetPresetTypes';
import { connectHeliumEcho } from './connectEcho';
import { connectHeliumVoiceChain } from './voiceChain';
import { calculateHeliumWetTailSec, resolveHeliumMixGains } from './mixGains';

export const heliumPreset: BasicWetPresetModule = {
  id: 'helium',
  calculateTailSec: calculateHeliumWetTailSec,
  resolveMixGains: resolveHeliumMixGains,
  connectVoiceChain: connectHeliumVoiceChain,
  connectEcho: connectHeliumEcho,
};
