import { NEUTRAL_AUDIO_EFFECTS } from '@/constants/audioEffects';
import {
  getPresetEffects,
  PRESET_AUDIO_EFFECTS,
  areAudioEffectsEqual,
} from '@/utils/voiceStudioEffects';

describe('getPresetEffects', () => {
  it('returns a copy merged with neutral defaults', () => {
    const effects = getPresetEffects('male');
    expect(effects).toEqual({
      ...NEUTRAL_AUDIO_EFFECTS,
      ...PRESET_AUDIO_EFFECTS.male,
    });
    effects.pitch = 0;
    expect(PRESET_AUDIO_EFFECTS.male.pitch).toBe(28);
  });
});

describe('areAudioEffectsEqual', () => {
  it('compares all effect keys', () => {
    const base = getPresetEffects('female');
    expect(areAudioEffectsEqual(base, getPresetEffects('female'))).toBe(true);
    expect(
      areAudioEffectsEqual(base, { ...base, pitch: base.pitch + 1 }),
    ).toBe(false);
  });
});

describe('PRESET_AUDIO_EFFECTS', () => {
  it('gives robot the strongest wet mix and lower pitch than other builtins', () => {
    expect(PRESET_AUDIO_EFFECTS.robot.echo).toBe(100);
    expect(PRESET_AUDIO_EFFECTS.robot.pitch).toBeLessThan(
      PRESET_AUDIO_EFFECTS.male.pitch,
    );
    expect(PRESET_AUDIO_EFFECTS.robot.echo).toBeGreaterThan(
      PRESET_AUDIO_EFFECTS.female.echo,
    );
    expect(PRESET_AUDIO_EFFECTS.male.pitch).toBeLessThan(
      PRESET_AUDIO_EFFECTS.female.pitch,
    );
    expect(PRESET_AUDIO_EFFECTS.robot.pitch).toBeLessThan(
      PRESET_AUDIO_EFFECTS.male.pitch,
    );
    expect(PRESET_AUDIO_EFFECTS.robot.reverb).toBeGreaterThanOrEqual(50);
    expect(PRESET_AUDIO_EFFECTS.robot.bass).toBeLessThanOrEqual(
      PRESET_AUDIO_EFFECTS.male.bass,
    );
  });

  it('gives helium a very high pitch with faster tempo and light wet mix', () => {
    expect(PRESET_AUDIO_EFFECTS.helium.pitch).toBeGreaterThanOrEqual(90);
    expect(PRESET_AUDIO_EFFECTS.helium.tempo).toBeGreaterThan(60);
    expect(PRESET_AUDIO_EFFECTS.helium.pitch).toBeGreaterThan(
      PRESET_AUDIO_EFFECTS.female.pitch,
    );
    expect(PRESET_AUDIO_EFFECTS.helium.bass).toBeLessThan(
      PRESET_AUDIO_EFFECTS.female.bass,
    );
  });

  it('gives oldRadio a warm vintage wet mix with moderate pitch', () => {
    expect(PRESET_AUDIO_EFFECTS.oldRadio.echo).toBeGreaterThan(50);
    expect(PRESET_AUDIO_EFFECTS.oldRadio.reverb).toBeGreaterThan(50);
    expect(PRESET_AUDIO_EFFECTS.oldRadio.pitch).toBeLessThan(
      PRESET_AUDIO_EFFECTS.female.pitch,
    );
    expect(PRESET_AUDIO_EFFECTS.oldRadio.pitch).toBeGreaterThan(
      PRESET_AUDIO_EFFECTS.male.pitch,
    );
    expect(PRESET_AUDIO_EFFECTS.oldRadio.tempo).toBeLessThan(50);
  });

  it('gives turtle slow tempo and cheetah fast tempo', () => {
    expect(PRESET_AUDIO_EFFECTS.turtle.tempo).toBeLessThan(
      PRESET_AUDIO_EFFECTS.cheetah.tempo,
    );
    expect(PRESET_AUDIO_EFFECTS.turtle.pitch).toBeLessThan(
      PRESET_AUDIO_EFFECTS.cheetah.pitch,
    );
  });
});
