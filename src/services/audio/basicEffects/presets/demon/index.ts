import type { BasicWetPresetModule } from '@/services/audio/basicEffects/wetPresetTypes';
import { connectDemonEcho } from './connectEcho';
import { connectDemonVoiceChain } from './voiceChain';
import { calculateDemonWetTailSec, resolveDemonMixGains } from './mixGains';

export const demonPreset: BasicWetPresetModule = {
  id: 'demon',
  calculateTailSec: calculateDemonWetTailSec,
  resolveMixGains: resolveDemonMixGains,
  connectVoiceChain: connectDemonVoiceChain,
  connectEcho: connectDemonEcho,
};
