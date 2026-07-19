import {
  AUDIO_EFFECT_DISPLAY_MAX,
  AUDIO_EFFECT_DISPLAY_MIN,
  displayToStorage,
  parseDisplayInput,
  storageToDisplay,
} from '@/utils/audioEffectScale';

describe('audioEffectScale', () => {
  it('maps neutral storage to display zero', () => {
    expect(storageToDisplay(50)).toBe(0);
    expect(displayToStorage(0)).toBe(50);
  });

  it('maps storage range to display -10..+10', () => {
    expect(storageToDisplay(0)).toBe(AUDIO_EFFECT_DISPLAY_MIN);
    expect(storageToDisplay(100)).toBe(AUDIO_EFFECT_DISPLAY_MAX);
    expect(displayToStorage(-10)).toBe(0);
    expect(displayToStorage(10)).toBe(100);
  });

  it('clamps out-of-range display values', () => {
    expect(displayToStorage(-20)).toBe(0);
    expect(displayToStorage(20)).toBe(100);
    expect(storageToDisplay(120)).toBe(AUDIO_EFFECT_DISPLAY_MAX);
  });

  it('parses numeric input strings', () => {
    expect(parseDisplayInput('3')).toBe(3);
    expect(parseDisplayInput('-4')).toBe(-4);
    expect(parseDisplayInput('2,5')).toBe(2.5);
    expect(parseDisplayInput('')).toBeNull();
    expect(parseDisplayInput('abc')).toBeNull();
  });
});
