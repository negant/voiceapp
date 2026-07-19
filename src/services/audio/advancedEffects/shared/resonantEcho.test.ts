import { applyResonantEchoAsync } from '@/services/audio/advancedEffects/shared/resonantEcho';

function buildImpulse(length: number): Float32Array {
  const samples = new Float32Array(length);
  samples[0] = 1;
  return samples;
}

describe('applyResonantEchoAsync', () => {
  it('extends output with delayed energy', async () => {
    const input = buildImpulse(512);
    const output = await applyResonantEchoAsync(input, 22_050, { mix: 0.35 });

    expect(output.length).toBeGreaterThan(input.length);
    expect(output[Math.floor(0.228 * 22_050)]).not.toBe(0);
  });

  it('returns a copy when mix is zero', async () => {
    const input = buildImpulse(128);
    const output = await applyResonantEchoAsync(input, 22_050, { mix: 0 });

    expect(Array.from(output)).toEqual(Array.from(input));
  });
});
