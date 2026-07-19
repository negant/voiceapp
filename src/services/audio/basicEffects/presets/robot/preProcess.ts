/** Stepped samples add a synthetic, machine-like edge before the wet robot chain. */
export function applyRobotSampleHold(
  samples: Float32Array,
  holdFrames = 6,
): Float32Array {
  const output = new Float32Array(samples.length);

  for (let index = 0; index < samples.length; index += holdFrames) {
    const value = samples[index] ?? 0;
    const end = Math.min(samples.length, index + holdFrames);
    for (let frame = index; frame < end; frame += 1) {
      output[frame] = value;
    }
  }

  return output;
}
