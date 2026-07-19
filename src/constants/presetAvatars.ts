import type { ImageSourcePropType } from 'react-native';

import type { VoicePresetId } from '@/types/voiceStudio';

export const PRESET_AVATAR_IMAGES: Record<VoicePresetId, ImageSourcePropType> = {
  female: require('../../assets/presets/female.png'),
  helium: require('../../assets/presets/helium.png'),
  male: require('../../assets/presets/male.png'),
  robot: require('../../assets/presets/robot.png'),
  oldRadio: require('../../assets/presets/oldRadio.png'),
  demon: require('../../assets/presets/demon.png'),
  telephone: require('../../assets/presets/telephone.png'),
  leader: require('../../assets/presets/leader.png'),
  alien: require('../../assets/presets/alien.png'),
  turtle: require('../../assets/presets/turtle.png'),
  cheetah: require('../../assets/presets/cheetah.png'),
};
