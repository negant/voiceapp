import { connectRobotEcho } from '@/services/audio/basicEffects/presets/robot/connectEcho';
import {
  calculateRobotWetTailSec,
  resolveRobotMixGains,
} from '@/services/audio/basicEffects/presets/robot/mixGains';
import { applyRobotSampleHold } from '@/services/audio/basicEffects/presets/robot/preProcess';
import { connectRobotVoiceChain } from '@/services/audio/basicEffects/presets/robot/voiceChain';
import type { BasicWetPresetModule } from '@/services/audio/basicEffects/wetPresetTypes';

export const robotPreset: BasicWetPresetModule = {
  id: 'robot',
  calculateTailSec: calculateRobotWetTailSec,
  resolveMixGains: resolveRobotMixGains,
  connectVoiceChain: connectRobotVoiceChain,
  connectEcho: connectRobotEcho,
  preProcessSamples: applyRobotSampleHold,
};
