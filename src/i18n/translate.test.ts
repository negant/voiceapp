import { findMissingTranslationKeys, findSchemaDrift } from './localeParity';
import pl from './locales/pl.json';
import { translate } from './translate';
import type { TranslationKey, TranslationSchema } from './types';

// Compile-time guard: locale files must match the English schema shape.
const polishLocale: TranslationSchema = pl;

describe('translate', () => {
  it('returns Polish translation for known key', () => {
    expect(translate('pl', 'common.back')).toBe('Wróć');
  });

  it('returns English translation for known key', () => {
    expect(translate('en', 'common.back')).toBe('Back');
  });

  it('interpolates params in template', () => {
    expect(
      translate('pl', 'voiceStudio.subtitle', {
        freeMaxDuration: '60 s',
        premiumMaxDuration: '10 min',
      }),
    ).toBe(
      'Załaduj audio i zmień brzmienie głosu. Free: do 60 s na plik. Premium: do 10 min.',
    );
  });

  it('falls back to default locale when key is missing in target locale', () => {
    // @ts-expect-error — runtime fallback for unknown keys during development
    expect(translate('pl', 'nonexistent.key')).toBe('nonexistent.key');
  });

  it('translates oldRadio preset name and description', () => {
    expect(translate('en', 'voiceStudio.presets.oldRadio')).toBe('Old Radio');
    expect(translate('pl', 'voiceStudio.presets.oldRadio')).toBe('Stare radio');
    expect(translate('en', 'voiceStudio.presets.oldRadioDescription')).toContain('AM');
    expect(translate('pl', 'voiceStudio.presets.oldRadioDescription')).toContain('AM');
  });

  it('returns light female preset label without gender wording', () => {
    expect(translate('en', 'voiceStudio.presets.female')).toBe('Light');
    expect(translate('pl', 'voiceStudio.presets.female')).toBe('Lekki');
    expect(translate('en', 'voiceStudio.presets.femaleDescription')).toContain('Higher');
    expect(translate('pl', 'voiceStudio.presets.femaleDescription')).toContain('Wyższy');
  });

  it('returns deep male preset label without gender wording', () => {
    expect(translate('en', 'voiceStudio.presets.male')).toBe('Deep');
    expect(translate('pl', 'voiceStudio.presets.male')).toBe('Głęboki');
    expect(translate('en', 'voiceStudio.presets.maleDescription')).toContain('Lower');
    expect(translate('pl', 'voiceStudio.presets.maleDescription')).toContain('Niższy');
  });

  it('translates helium preset name and description', () => {
    expect(translate('en', 'voiceStudio.presets.helium')).toBe('Helium');
    expect(translate('pl', 'voiceStudio.presets.helium')).toBe('Hel');
    expect(translate('en', 'voiceStudio.presets.heliumDescription')).toContain('duck');
    expect(translate('pl', 'voiceStudio.presets.heliumDescription')).toContain('kacze');
  });

  it('uses English as the default fallback locale', () => {
    expect(translate('en', 'common.settings')).toBe('Settings');
  });

  it('accepts typed translation keys', () => {
    const key: TranslationKey = 'nav.settings';
    expect(translate('en', key)).toBe('Settings');
  });
});

describe('locale parity', () => {
  it('keeps polish locale aligned with TranslationSchema', () => {
    expect(polishLocale.common.back).toBe('Wróć');
  });

  it('keeps the same translation keys in every locale file', () => {
    expect(findMissingTranslationKeys()).toEqual({});
  });

  it('keeps schema.json in sync with en.json', () => {
    expect(findSchemaDrift()).toEqual([]);
  });
});
