import type { BasicWetPresetModule } from '@/services/audio/basicEffects/wetPresetTypes';
import { connectKratosEcho } from './connectEcho';
import { connectKratosVoiceChain } from './voiceChain';
import { calculateKratosWetTailSec, resolveKratosMixGains } from './mixGains';

export const leaderPreset: BasicWetPresetModule = {
  id: 'leader',
  calculateTailSec: calculateKratosWetTailSec,
  resolveMixGains: resolveKratosMixGains,
  connectVoiceChain: connectKratosVoiceChain,
  connectEcho: connectKratosEcho,
};
