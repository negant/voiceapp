import type { BasicWetPresetModule } from '@/services/audio/basicEffects/wetPresetTypes';
import { connectSexyVoiceEcho } from './connectEcho';
import { connectSexyVoiceChain } from './voiceChain';
import { calculateSexyVoiceWetTailSec, resolveSexyVoiceMixGains } from './mixGains';

export const sexyPreset: BasicWetPresetModule = {
  id: 'sexy',
  calculateTailSec: calculateSexyVoiceWetTailSec,
  resolveMixGains: resolveSexyVoiceMixGains,
  connectVoiceChain: connectSexyVoiceChain,
  connectEcho: connectSexyVoiceEcho,
};
