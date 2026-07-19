import { mapEffectsToDspParams, needsWetProcessing } from '@/utils/audioEffectParams';
import { getPresetEffects } from '@/utils/voiceStudioEffects';
import {
  applyDryVoiceEffects,
  combinedPlaybackRate,
} from '@/utils/audioDspFastPath';

describe('needsWetProcessing', () => {
  it('is false for female and male presets', () => {
    expect(needsWetProcessing(mapEffectsToDspParams(getPresetEffects('female')))).toBe(
      false,
    );
    expect(needsWetProcessing(mapEffectsToDspParams(getPresetEffects('male')))).toBe(
      false,
    );
  });

  it('is true for robot, helium and oldRadio presets', () => {
    expect(needsWetProcessing(mapEffectsToDspParams(getPresetEffects('robot')))).toBe(
      true,
    );
    expect(
      needsWetProcessing(
        mapEffectsToDspParams(getPresetEffects('helium'), {
          voicePresetId: 'helium',
        }),
      ),
    ).toBe(true);
    expect(
      needsWetProcessing(
        mapEffectsToDspParams(getPresetEffects('oldRadio'), {
          voicePresetId: 'oldRadio',
        }),
      ),
    ).toBe(true);
  });

  it('is true for demon, telephone, leader and alien presets', () => {
    expect(
      needsWetProcessing(
        mapEffectsToDspParams(getPresetEffects('demon'), {
          voicePresetId: 'demon',
        }),
      ),
    ).toBe(true);
    expect(
      needsWetProcessing(
        mapEffectsToDspParams(getPresetEffects('telephone'), {
          voicePresetId: 'telephone',
        }),
      ),
    ).toBe(true);
    expect(
      needsWetProcessing(
        mapEffectsToDspParams(getPresetEffects('leader'), {
          voicePresetId: 'leader',
        }),
      ),
    ).toBe(true);
    expect(
      needsWetProcessing(
        mapEffectsToDspParams(getPresetEffects('alien'), {
          voicePresetId: 'alien',
        }),
      ),
    ).toBe(true);
  });
});

describe('applyDryVoiceEffects', () => {
  it('changes output length when pitch/tempo are not neutral', () => {
    const input = new Float32Array(8_000).fill(0.1);
    const params = mapEffectsToDspParams(getPresetEffects('female'));
    const output = applyDryVoiceEffects(input, 22_050, params);

    expect(combinedPlaybackRate(params)).toBeGreaterThan(1);
    expect(output.length).toBeLessThan(input.length);
  });
});
