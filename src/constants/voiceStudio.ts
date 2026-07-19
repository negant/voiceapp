import type { AudioEffects, VoicePreset, VoicePresetId } from '@/types/voiceStudio';
import { getPresetEffects } from '@/utils/voiceStudioEffects';

export { AUDIO_EFFECT_KEYS, NEUTRAL_AUDIO_EFFECTS } from '@/constants/audioEffects';

/** Default built-in preset for custom-preset DSP fallback (not auto-selected in UI). */
export const DEFAULT_VOICE_PRESET_ID: VoicePresetId = 'female';

/** Baseline effects for the default preset (custom-preset DSP fallback). */
export const DEFAULT_AUDIO_EFFECTS: AudioEffects = getPresetEffects(
  DEFAULT_VOICE_PRESET_ID,
);

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'female',
    labelKey: 'voiceStudio.presets.female',
    descriptionKey: 'voiceStudio.presets.femaleDescription',
    accentColor: '#F59E0B',
    avatarInitial: 'F',
    avatarImageKey: 'female',
  },
  {
    id: 'male',
    labelKey: 'voiceStudio.presets.male',
    descriptionKey: 'voiceStudio.presets.maleDescription',
    accentColor: '#0EA5E9',
    avatarInitial: 'M',
    avatarImageKey: 'male',
  },
  {
    id: 'helium',
    labelKey: 'voiceStudio.presets.helium',
    descriptionKey: 'voiceStudio.presets.heliumDescription',
    accentColor: '#38BDF8',
    avatarInitial: 'H',
    avatarImageKey: 'helium',
  },
  {
    id: 'robot',
    labelKey: 'voiceStudio.presets.robot',
    descriptionKey: 'voiceStudio.presets.robotDescription',
    accentColor: '#10B981',
    avatarInitial: 'R',
    avatarImageKey: 'robot',
  },
  {
    id: 'oldRadio',
    labelKey: 'voiceStudio.presets.oldRadio',
    descriptionKey: 'voiceStudio.presets.oldRadioDescription',
    accentColor: '#D97706',
    avatarInitial: 'O',
    avatarImageKey: 'oldRadio',
  },
  {
    id: 'demon',
    labelKey: 'voiceStudio.presets.demon',
    descriptionKey: 'voiceStudio.presets.demonDescription',
    accentColor: '#7F1D1D',
    avatarInitial: 'D',
    avatarImageKey: 'demon',
  },
  {
    id: 'telephone',
    labelKey: 'voiceStudio.presets.telephone',
    descriptionKey: 'voiceStudio.presets.telephoneDescription',
    accentColor: '#92400E',
    avatarInitial: 'T',
    avatarImageKey: 'telephone',
  },
  {
    id: 'leader',
    labelKey: 'voiceStudio.presets.leader',
    descriptionKey: 'voiceStudio.presets.leaderDescription',
    accentColor: '#B91C1C',
    avatarInitial: 'L',
    avatarImageKey: 'leader',
  },
  {
    id: 'alien',
    labelKey: 'voiceStudio.presets.alien',
    descriptionKey: 'voiceStudio.presets.alienDescription',
    accentColor: '#059669',
    avatarInitial: 'A',
    avatarImageKey: 'alien',
  },
  {
    id: 'turtle',
    labelKey: 'voiceStudio.presets.turtle',
    descriptionKey: 'voiceStudio.presets.turtleDescription',
    accentColor: '#16A34A',
    avatarInitial: 'T',
    avatarImageKey: 'turtle',
  },
  {
    id: 'cheetah',
    labelKey: 'voiceStudio.presets.cheetah',
    descriptionKey: 'voiceStudio.presets.cheetahDescription',
    accentColor: '#EA580C',
    avatarInitial: 'C',
    avatarImageKey: 'cheetah',
  },
];
