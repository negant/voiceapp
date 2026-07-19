import { NEUTRAL_AUDIO_EFFECTS } from '@/constants/audioEffects';
import type { AudioEffects, VoicePresetId } from '@/types/voiceStudio';

import { ALIEN_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/alien/effects';
import { CHEETAH_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/cheetah/effects';
import { DEMON_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/demon/effects';
import { FEMALE_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/female/effects';
import { HELIUM_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/helium/effects';
import { MALE_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/male/effects';
import { LEADER_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/leader/effects';
import { OLD_RADIO_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/oldRadio/effects';
import { ROBOT_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/robot/effects';
import { TELEPHONE_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/telephone/effects';
import { TURTLE_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/turtle/effects';

export const PRESET_AUDIO_EFFECTS: Record<VoicePresetId, AudioEffects> = {
  female: FEMALE_PRESET_EFFECTS,
  male: MALE_PRESET_EFFECTS,
  robot: ROBOT_PRESET_EFFECTS,
  oldRadio: OLD_RADIO_PRESET_EFFECTS,
  helium: HELIUM_PRESET_EFFECTS,
  demon: DEMON_PRESET_EFFECTS,
  telephone: TELEPHONE_PRESET_EFFECTS,
  leader: LEADER_PRESET_EFFECTS,
  alien: ALIEN_PRESET_EFFECTS,
  turtle: TURTLE_PRESET_EFFECTS,
  cheetah: CHEETAH_PRESET_EFFECTS,
};

export function getPresetEffects(presetId: VoicePresetId): AudioEffects {
  return { ...NEUTRAL_AUDIO_EFFECTS, ...PRESET_AUDIO_EFFECTS[presetId] };
}

export function areAudioEffectsEqual(
  left: AudioEffects,
  right: AudioEffects,
): boolean {
  return (
    left.pitch === right.pitch &&
    left.tempo === right.tempo &&
    left.echo === right.echo &&
    left.reverb === right.reverb &&
    left.bass === right.bass
  );
}
