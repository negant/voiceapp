import {
  calculateWetRenderDurationSec,
  calculateWetSourcePlaybackSec,
  calculateWetTailSec,
} from '@/services/audio/audioDsp';
import {
  combinedPlaybackRate,
  mapEffectsToDspParams,
} from '@/utils/audioEffectParams';
import { getPresetEffects } from '@/utils/voiceStudioEffects';

describe('wet offline render duration', () => {
  it('uses detune + tempo for robot source playback length', () => {
    const params = mapEffectsToDspParams(getPresetEffects('robot'), {
      robotVoice: true,
    });

    expect(combinedPlaybackRate(params)).toBeLessThan(params.playbackRate);

    const sourceDurationSec = 7;
    const playbackSec = calculateWetSourcePlaybackSec(sourceDurationSec, params);

    expect(playbackSec).toBeGreaterThan(sourceDurationSec);
    expect(playbackSec).toBeCloseTo(
      sourceDurationSec / combinedPlaybackRate(params),
      5,
    );
  });

  it('reserves a long feedback tail for robot', () => {
    const params = mapEffectsToDspParams(getPresetEffects('robot'), {
      robotVoice: true,
    });

    expect(calculateWetTailSec(params, 'robot')).toBeGreaterThan(1.0);
  });

  it('keeps full render length for a short robot clip', () => {
    const params = mapEffectsToDspParams(getPresetEffects('robot'), {
      robotVoice: true,
    });
    const sourceDurationSec = 7;

    const renderDurationSec = calculateWetRenderDurationSec(
      sourceDurationSec,
      params,
      'robot',
    );
    const playbackSec = calculateWetSourcePlaybackSec(sourceDurationSec, params);
    const tailSec = calculateWetTailSec(params, 'robot');

    expect(renderDurationSec).toBeCloseTo(playbackSec + tailSec, 5);
    expect(renderDurationSec).toBeGreaterThan(sourceDurationSec + 1);
  });

  it('reserves echo tail for oldRadio with stronger feedback', () => {
    const params = mapEffectsToDspParams(getPresetEffects('oldRadio'), {
      oldRadioVoice: true,
    });

    expect(calculateWetTailSec(params, 'oldRadio')).toBeGreaterThan(0.55);
    expect(params.echoMix).toBeGreaterThanOrEqual(0.7);
  });

  it('reserves short bright tail for helium nasal mix', () => {
    const params = mapEffectsToDspParams(getPresetEffects('helium'), {
      heliumVoice: true,
    });

    const heliumTail = calculateWetTailSec(params, 'helium');
    const oldRadioParams = mapEffectsToDspParams(getPresetEffects('oldRadio'), {
      oldRadioVoice: true,
    });

    expect(heliumTail).toBeLessThan(
      calculateWetTailSec(oldRadioParams, 'oldRadio'),
    );
    expect(params.detuneCents).toBeGreaterThanOrEqual(540);
  });
});
