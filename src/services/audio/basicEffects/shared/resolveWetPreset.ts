import type { VoicePresetId } from '@/types/voiceStudio';

import type { WetPresetVoice } from '@/services/audio/basicEffects/wetRegistry';
import type { WetChainPresetVoice } from '@/services/audio/basicEffects/shared/connectWetChain';

const WET_PRESET_IDS = new Set<WetPresetVoice>([
  'robot',
  'helium',
  'oldRadio',
  'demon',
  'telephone',
  'leader',
  'alien',
]);

export function resolveWetPresetVoice(
  voicePresetId?: VoicePresetId,
): WetChainPresetVoice {
  if (voicePresetId && WET_PRESET_IDS.has(voicePresetId as WetPresetVoice)) {
    return voicePresetId as WetPresetVoice;
  }

  return 'default';
}

export function isWetPresetVoice(
  presetVoice: WetChainPresetVoice,
): presetVoice is WetPresetVoice {
  return presetVoice !== 'default';
}
