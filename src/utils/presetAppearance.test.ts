import {
  createPresetId,
  getPresetAccentColor,
  getPresetAvatarInitial,
  isValidPresetName,
  normalizePresetName,
  slugifyPresetName,
} from './presetAppearance';

describe('presetAppearance', () => {
  it('validates preset names', () => {
    expect(isValidPresetName('My preset')).toBe(true);
    expect(isValidPresetName('   ')).toBe(false);
    expect(isValidPresetName('a'.repeat(41))).toBe(false);
  });

  it('normalizes and slugifies names', () => {
    expect(normalizePresetName('  Warm voice  ')).toBe('Warm voice');
    expect(slugifyPresetName('Warm Voice!')).toBe('warm-voice');
  });

  it('derives stable avatar and accent from name', () => {
    expect(getPresetAvatarInitial('alpha')).toBe('A');
    expect(getPresetAccentColor('alpha')).toBe(getPresetAccentColor('alpha'));
  });

  it('creates unique preset ids', () => {
    expect(createPresetId()).not.toBe(createPresetId());
  });
});
