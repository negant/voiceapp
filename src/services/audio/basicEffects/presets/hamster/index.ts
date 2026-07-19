import type { BasicWetPresetModule } from '@/services/audio/basicEffects/wetPresetTypes';
import { connectHamsterEcho } from './connectEcho';
import { connectHamsterVoiceChain } from './voiceChain';
import { calculateHamsterWetTailSec, resolveHamsterMixGains } from './mixGains';

export const hamsterPreset: BasicWetPresetModule = {
  id: 'hamster',
  calculateTailSec: calculateHamsterWetTailSec,
  resolveMixGains: resolveHamsterMixGains,
  connectVoiceChain: connectHamsterVoiceChain,
  connectEcho: connectHamsterEcho,
};
