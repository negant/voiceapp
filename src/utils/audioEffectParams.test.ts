import { getPresetEffects } from '@/utils/voiceStudioEffects';
import {
  hasAudibleEffects,
  mapEffectsToDspParams,
} from '@/utils/audioEffectParams';

describe('audioEffectParams', () => {
  it('maps neutral storage values to identity pitch, tempo and bass', () => {
    const params = mapEffectsToDspParams({
      pitch: 50,
      tempo: 50,
      echo: 50,
      reverb: 50,
      bass: 50,
    });
    expect(params.detuneCents).toBe(0);
    expect(params.playbackRate).toBe(1);
    expect(params.bassGainDb).toBe(0);
    expect(params.echoMix).toBe(0);
    expect(params.reverbMix).toBe(0);
    expect(hasAudibleEffects(params)).toBe(false);
  });

  it('maps wet effects only when display is above zero', () => {
    const params = mapEffectsToDspParams({
      pitch: 50,
      tempo: 50,
      echo: 55,
      reverb: 50,
      bass: 50,
    });
    expect(params.echoMix).toBeGreaterThan(0);
    expect(params.reverbMix).toBe(0);
    expect(hasAudibleEffects(params)).toBe(true);
  });

  it('maps robot preset to strong synthetic wet mix and lower pitch', () => {
    const params = mapEffectsToDspParams(getPresetEffects('robot'), {
      robotVoice: true,
    });
    expect(params.echoMix).toBeCloseTo(0.95, 2);
    expect(params.reverbMix).toBeCloseTo(0.72, 2);
    expect(params.detuneCents).toBe(-320);
    expect(params.playbackRate).toBeLessThanOrEqual(0.88);
    expect(params.bassGainDb).toBeLessThanOrEqual(-5);
    expect(hasAudibleEffects(params)).toBe(true);
  });

  it('maps helium preset to very high pitch with nasal duck character', () => {
    const params = mapEffectsToDspParams(getPresetEffects('helium'), {
      heliumVoice: true,
    });
    expect(params.detuneCents).toBeGreaterThanOrEqual(540);
    expect(params.playbackRate).toBeGreaterThanOrEqual(1.14);
    expect(params.bassGainDb).toBeLessThanOrEqual(-6);
    expect(params.echoMix).toBeGreaterThanOrEqual(0.38);
    expect(params.reverbMix).toBeGreaterThanOrEqual(0.32);
    expect(hasAudibleEffects(params)).toBe(true);
  });

  it('maps oldRadio preset to vintage wet mix and slightly lower pitch', () => {
    const params = mapEffectsToDspParams(getPresetEffects('oldRadio'), {
      voicePresetId: 'oldRadio',
    });
    expect(params.detuneCents).toBeLessThanOrEqual(-120);
    expect(params.playbackRate).toBeLessThanOrEqual(0.94);
    expect(params.echoMix).toBeGreaterThanOrEqual(0.7);
    expect(params.reverbMix).toBeGreaterThanOrEqual(0.58);
    expect(hasAudibleEffects(params)).toBe(true);
  });

  it('maps demon preset to very low pitch with heavy wet tail', () => {
    const params = mapEffectsToDspParams(getPresetEffects('demon'), {
      voicePresetId: 'demon',
    });
    expect(params.detuneCents).toBeLessThanOrEqual(-440);
    expect(params.echoMix).toBeGreaterThanOrEqual(0.88);
    expect(params.reverbMix).toBeGreaterThanOrEqual(0.78);
    expect(hasAudibleEffects(params)).toBe(true);
  });

  it('maps alien preset to high shimmer with strong wet mix', () => {
    const params = mapEffectsToDspParams(getPresetEffects('alien'), {
      voicePresetId: 'alien',
    });
    expect(params.detuneCents).toBeGreaterThanOrEqual(500);
    expect(params.echoMix).toBeGreaterThanOrEqual(0.68);
    expect(params.reverbMix).toBeGreaterThanOrEqual(0.66);
    expect(hasAudibleEffects(params)).toBe(true);
  });

  it('maps turtle preset to slow playback and lower pitch', () => {
    const params = mapEffectsToDspParams(getPresetEffects('turtle'), {
      voicePresetId: 'turtle',
    });
    expect(params.playbackRate).toBeLessThanOrEqual(0.74);
    expect(params.detuneCents).toBeLessThanOrEqual(-140);
    expect(params.echoMix).toBe(0);
    expect(hasAudibleEffects(params)).toBe(true);
  });

  it('maps cheetah preset to fast playback and higher pitch', () => {
    const params = mapEffectsToDspParams(getPresetEffects('cheetah'), {
      voicePresetId: 'cheetah',
    });
    expect(params.playbackRate).toBeGreaterThanOrEqual(1.28);
    expect(params.detuneCents).toBeGreaterThanOrEqual(140);
    expect(params.echoMix).toBe(0);
    expect(hasAudibleEffects(params)).toBe(true);
  });

  it('maps extreme effects to audible DSP values', () => {
    const params = mapEffectsToDspParams({
      pitch: 100,
      tempo: 0,
      echo: 100,
      reverb: 100,
      bass: 100,
    });

    expect(params.detuneCents).toBeGreaterThan(0);
    expect(params.playbackRate).toBeLessThan(1);
    expect(params.bassGainDb).toBeGreaterThan(0);
    expect(params.echoMix).toBeGreaterThan(0);
    expect(params.reverbMix).toBeGreaterThan(0);
    expect(hasAudibleEffects(params)).toBe(true);
  });
});
