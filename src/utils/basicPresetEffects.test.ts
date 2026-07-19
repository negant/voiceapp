import { needsWetProcessing, mapEffectsToDspParams } from '@/utils/audioEffectParams';
import { getPresetEffects } from '@/utils/voiceStudioEffects';

describe('basic preset effects', () => {
  it.each([
    ['demon', 5, 100],
    ['telephone', 46, 64],
    ['leader', 40, 90],
    ['alien', 88, 78],
  ] as const)('%s exposes wet echo/reverb slider values', (presetId, pitch, echo) => {
    const effects = getPresetEffects(presetId);
    expect(effects.pitch).toBe(pitch);
    expect(effects.echo).toBe(echo);
    expect(
      needsWetProcessing(
        mapEffectsToDspParams(effects, { voicePresetId: presetId }),
      ),
    ).toBe(true);
  });
});
