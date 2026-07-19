import { NEUTRAL_AUDIO_EFFECTS } from '@/constants/voiceStudio';
import { displayToStorage } from '@/utils/audioEffectScale';
import {
  getPresetEffects,
} from '@/utils/voiceStudioEffects';
import type { PresetSelection } from '@/types/voiceStudio';
import { resolveProcessingEffects } from '@/utils/resolveProcessingEffects';

describe('resolveProcessingEffects', () => {
  it('merges live pitch into builtin preset effects', () => {
    const selection: PresetSelection = { kind: 'builtin', id: 'male' };
    const deeperPitch = displayToStorage(-6);
    const effects = { ...NEUTRAL_AUDIO_EFFECTS, pitch: deeperPitch };

    const resolved = resolveProcessingEffects(selection, effects, null);

    expect(resolved).toEqual({
      ...getPresetEffects('male'),
      pitch: deeperPitch,
    });
  });

  it('keeps full custom preset snapshot without inline pitch tweak', () => {
    const customEffects = {
      ...NEUTRAL_AUDIO_EFFECTS,
      pitch: displayToStorage(4),
      echo: 80,
    };
    const selection: PresetSelection = { kind: 'custom', id: 'preset-1' };
    const liveEffects = { ...NEUTRAL_AUDIO_EFFECTS, pitch: displayToStorage(-8) };

    const resolved = resolveProcessingEffects(selection, liveEffects, {
      id: 'preset-1',
      name: 'My mix',
      accentColor: '#000000',
      effects: customEffects,
      createdAt: 1,
      updatedAt: 1,
    });

    expect(resolved).toEqual(customEffects);
  });
});
