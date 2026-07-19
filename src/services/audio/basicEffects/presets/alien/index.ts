import type { BasicWetPresetModule } from '@/services/audio/basicEffects/wetPresetTypes';
import { connectAlienEcho } from './connectEcho';
import { connectAlienVoiceChain } from './voiceChain';
import { calculateAlienWetTailSec, resolveAlienMixGains } from './mixGains';

export const alienPreset: BasicWetPresetModule = {
  id: 'alien',
  calculateTailSec: calculateAlienWetTailSec,
  resolveMixGains: resolveAlienMixGains,
  connectVoiceChain: connectAlienVoiceChain,
  connectEcho: connectAlienEcho,
};
