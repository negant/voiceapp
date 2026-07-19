import { pitchShiftPreserveDurationAsync } from '@/services/audio/advancedEffects/shared/filters';
import { pitchShiftWithSoundTouchAsync } from '@/services/audio/advancedEffects/shared/soundtouchPitchShift';
import { ADVANCED_EFFECT_DEFINITIONS } from '@/services/audio/advancedEffects/registry';

function buildSineWave(length: number, cycles: number): Float32Array {
  const samples = new Float32Array(length);

  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = Math.sin((index / length) * Math.PI * 2 * cycles);
  }

  return samples;
}

function meanAbsoluteDifference(a: Float32Array, b: Float32Array): number {
  const length = Math.min(a.length, b.length);
  let sum = 0;

  for (let index = 0; index < length; index += 1) {
    sum += Math.abs((a[index] ?? 0) - (b[index] ?? 0));
  }

  return sum / length;
}

describe('pitchShiftWithSoundTouchAsync', () => {
  it('changes the waveform while keeping approximate duration', async () => {
    const input = buildSineWave(22_050, 8);
    const output = await pitchShiftWithSoundTouchAsync(input, 22_050, 1.5);

    expect(output.length).toBeGreaterThan(input.length * 0.9);
    expect(output.length).toBeLessThan(input.length * 1.1);
    expect(meanAbsoluteDifference(input, output)).toBeGreaterThan(0.05);
  });
});

describe('pitchShiftPreserveDurationAsync', () => {
  it('returns a copy when factor is near unity', async () => {
    const input = new Float32Array([0.1, 0.2, 0.3]);
    const output = await pitchShiftPreserveDurationAsync(input, 1, undefined, 22_050);

    expect(output).not.toBe(input);
    expect(Array.from(output)).toEqual(Array.from(input));
  });

  it('produces a clearly different signal for chipmunk-style pitch-up', async () => {
    const input = buildSineWave(8_192, 6);
    const output = await pitchShiftPreserveDurationAsync(
      input,
      1.55,
      undefined,
      22_050,
    );

    expect(meanAbsoluteDifference(input, output)).toBeGreaterThan(0.08);
  });
});

describe('ADVANCED_EFFECT_DEFINITIONS', () => {
  it('defines commander as a deep pitch-down gravel chain', () => {
    expect(ADVANCED_EFFECT_DEFINITIONS.commander.filters).toContainEqual(
      expect.objectContaining({ type: 'pitch_shift', factor: 0.8 }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.commander.filters).toContainEqual(
      expect.objectContaining({ type: 'tempo_shift', factor: 0.85 }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.commander.filters).toContainEqual(
      expect.objectContaining({ type: 'resonant_echo', mix: 0.34, grit: 0.22 }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.commander.ffmpegReference).toContain('asetrate');
  });

  it('defines hall as commander timbre with a much wetter echo tail', () => {
    expect(ADVANCED_EFFECT_DEFINITIONS.hall.filters).toContainEqual(
      expect.objectContaining({ type: 'pitch_shift', factor: 0.8 }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.hall.filters).toContainEqual(
      expect.objectContaining({
        type: 'resonant_echo',
        mix: 0.72,
        taps: expect.arrayContaining([
          expect.objectContaining({ delaySec: 1.1 }),
        ]),
      }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.hall.ffmpegReference).toContain('aecho');
  });

  it('defines chipmunk as a strong audible pitch-up preset', () => {
    expect(ADVANCED_EFFECT_DEFINITIONS.chipmunk.filters).toEqual([
      expect.objectContaining({ type: 'pitch_shift', factor: 1.55 }),
    ]);
    expect(ADVANCED_EFFECT_DEFINITIONS.chipmunk.ffmpegReference).toContain('asetrate');
  });

  it('defines warrior as a hoarse game-style gravel chain', () => {
    expect(ADVANCED_EFFECT_DEFINITIONS.warrior.filters).toContainEqual(
      expect.objectContaining({ type: 'pitch_shift', factor: 0.76 }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.warrior.filters).toContainEqual(
      expect.objectContaining({ type: 'resonant_echo', grit: 0.32 }),
    );
  });

  it('defines femaleVoice and maleVoice as SoundTouch + formant-shift presets', () => {
    expect(ADVANCED_EFFECT_DEFINITIONS.femaleVoice.filters).toContainEqual(
      expect.objectContaining({ type: 'pitch_shift', factor: 1.14 }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.femaleVoice.filters).toContainEqual(
      expect.objectContaining({ type: 'formant_shift', factor: 1.12 }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.maleVoice.filters).toContainEqual(
      expect.objectContaining({ type: 'pitch_shift', factor: 0.86 }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.maleVoice.filters).toContainEqual(
      expect.objectContaining({ type: 'formant_shift', factor: 0.87 }),
    );
  });

  it('defines android as a dry synthetic TTS assistant chain', () => {
    expect(ADVANCED_EFFECT_DEFINITIONS.android.filters).toContainEqual(
      expect.objectContaining({ type: 'formant_shift', factor: 1.1 }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.android.filters).toContainEqual(
      expect.objectContaining({ type: 'equalizer', frequencyHz: 2_450, gainDb: 9 }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.android.filters).toContainEqual(
      expect.objectContaining({ type: 'resonant_echo', mix: 0.1 }),
    );
    expect(ADVANCED_EFFECT_DEFINITIONS.android.ffmpegReference).toContain('formant');
  });
});
