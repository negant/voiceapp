/** Soft tube-style saturation for vintage AM speaker overload. */
export function createTapeSaturationCurve(amount = 0.26): Float32Array {
  const samples = 256;
  const curve = new Float32Array(samples);
  const drive = 1 + amount * 4.5;

  for (let index = 0; index < samples; index += 1) {
    const x = (index * 2) / samples - 1;
    curve[index] = Math.tanh(x * drive) * (1 - amount * 0.12);
  }

  return curve;
}
