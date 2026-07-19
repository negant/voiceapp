import type { BasicWetPresetModule } from '@/services/audio/basicEffects/wetPresetTypes';
import { connectSubmarineEcho } from './connectEcho';
import { connectSubmarineVoiceChain } from './voiceChain';
import { calculateSubmarineWetTailSec, resolveSubmarineMixGains } from './mixGains';
import { connectSubmarineAmbience } from './ambience';

export const submarinePreset: BasicWetPresetModule = {
  id: 'submarine',
  calculateTailSec: calculateSubmarineWetTailSec,
  resolveMixGains: resolveSubmarineMixGains,
  connectVoiceChain: connectSubmarineVoiceChain,
  connectEcho: connectSubmarineEcho,
  connectAmbience: connectSubmarineAmbience,
};
