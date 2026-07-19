import { getCombinedPresetAvatarImages } from '@/utils/derivedVoicePreset';

describe('getCombinedPresetAvatarImages', () => {
  it('returns both chain avatars for combined presets', () => {
    const avatars = getCombinedPresetAvatarImages({
      id: 'preset_1',
      name: 'Robot + Narrator',
      effects: {
        pitch: 50,
        tempo: 50,
        echo: 50,
        reverb: 50,
        bass: 50,
      },
      accentColor: '#6366F1',
      effectChain: [
        { tier: 'basic', presetId: 'robot' },
        { tier: 'ai', effectId: 'narrator' },
      ],
      createdAt: 1,
      updatedAt: 1,
    });

    expect(avatars).toHaveLength(2);
    expect(avatars?.[0]).toBeTruthy();
    expect(avatars?.[1]).toBeTruthy();
  });
});
