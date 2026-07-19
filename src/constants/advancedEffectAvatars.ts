import type { ImageSourcePropType } from 'react-native';

import type { AdvancedEffectId } from '@/types/voiceStudio';

export const ADVANCED_EFFECT_AVATAR_IMAGES: Record<
  AdvancedEffectId,
  ImageSourcePropType
> = {
  commander: require('../../assets/presets/commander.png'),
  hall: require('../../assets/presets/hall.png'),
  warrior: require('../../assets/presets/warrior.png'),
  femaleVoice: require('../../assets/presets/femaleVoice.png'),
  maleVoice: require('../../assets/presets/maleVoice.png'),
  android: require('../../assets/presets/android.png'),
  chipmunk: require('../../assets/presets/chipmunk.png'),
};
