import type { BasicWetPresetModule } from '@/services/audio/basicEffects/wetPresetTypes';
import { connectTelephoneLineNoise } from './ambience';
import { connectTelephoneEcho } from './connectEcho';
import { connectTelephoneVoiceChain } from './voiceChain';
import {
  calculateTelephoneWetTailSec,
  resolveTelephoneMixGains,
} from './mixGains';

export const telephonePreset: BasicWetPresetModule = {
  id: 'telephone',
  calculateTailSec: calculateTelephoneWetTailSec,
  resolveMixGains: resolveTelephoneMixGains,
  connectVoiceChain: connectTelephoneVoiceChain,
  connectEcho: connectTelephoneEcho,
  connectAmbience: connectTelephoneLineNoise,
};
