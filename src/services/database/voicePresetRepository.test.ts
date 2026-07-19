import { buildVoicePresetInsert, mapVoicePresetRow } from './voicePresetRepository';

describe('voicePresetRepository helpers', () => {
  it('maps database rows to saved presets', () => {
    const preset = mapVoicePresetRow({
      id: 'preset_1',
      name: 'My voice',
      pitch: 40,
      tempo: 55,
      echo: 20,
      reverb: 30,
      bass: 60,
      accent_color: '#6366F1',
      source_tier: 'basic',
      source_id: 'male',
      avatar_image_key: 'male',
      chain_step1_tier: null,
      chain_step1_id: null,
      chain_step2_tier: null,
      chain_step2_id: null,
      created_at: 100,
      updated_at: 100,
    });

    expect(preset.name).toBe('My voice');
    expect(preset.effects.bass).toBe(60);
    expect(preset.source).toEqual({ tier: 'basic', presetId: 'male' });
  });

  it('maps combined effect chains from database rows', () => {
    const preset = mapVoicePresetRow({
      id: 'preset_2',
      name: 'Robot + Narrator',
      pitch: 50,
      tempo: 50,
      echo: 50,
      reverb: 50,
      bass: 50,
      accent_color: '#6366F1',
      source_tier: null,
      source_id: null,
      avatar_image_key: 'robot',
      chain_step1_tier: 'basic',
      chain_step1_id: 'robot',
      chain_step2_tier: 'ai',
      chain_step2_id: 'narrator',
      created_at: 100,
      updated_at: 100,
    });

    expect(preset.effectChain).toEqual([
      { tier: 'basic', presetId: 'robot' },
      { tier: 'ai', effectId: 'narrator' },
    ]);
  });

  it('builds insert payload with validated name and effects', () => {
    const preset = buildVoicePresetInsert('Studio', {
      pitch: 50,
      tempo: 50,
      echo: 20,
      reverb: 45,
      bass: 50,
    });

    expect(preset.name).toBe('Studio');
    expect(preset.id).toContain('preset_');
  });

  it('rejects invalid preset names', () => {
    expect(() =>
      buildVoicePresetInsert('   ', {
        pitch: 50,
        tempo: 50,
        echo: 20,
        reverb: 45,
        bass: 50,
      }),
    ).toThrow('Invalid preset name');
  });
});
