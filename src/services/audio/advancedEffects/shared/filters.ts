import { CooperativeYield } from '@/utils/asyncYield';
import { throwIfAborted } from '@/services/audio/processingErrors';
import { createTapeSaturationCurve } from '@/services/audio/basicEffects/shared/tapeSaturation';
import { applyNoiseReduceAsync } from '@/services/audio/advancedEffects/shared/noiseReduction';
import { applyResonantEchoAsync } from '@/services/audio/advancedEffects/shared/resonantEcho';
import { applyFormantShiftAsync as formantShiftCoreAsync } from '@/services/audio/advancedEffects/shared/formantShift';
import { pitchShiftWithSoundTouchAsync } from '@/services/audio/advancedEffects/shared/soundtouchPitchShift';
import { timeStretchWithSoundTouchAsync } from '@/services/audio/advancedEffects/shared/soundtouchTimeStretch';
import { resampleMonoAsync } from '@/utils/audioResample';

const FRAME_BATCH = 4096;

/** One-pole high-pass — removes rumble before pitch shift. */
export async function applyHighPassAsync(
  samples: Float32Array,
  sampleRate: number,
  frequencyHz: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  const output = new Float32Array(samples.length);
  const rc = 1 / (2 * Math.PI * frequencyHz);
  const dt = 1 / sampleRate;
  const alpha = rc / (rc + dt);
  let previousInput = samples[0] ?? 0;
  let previousOutput = 0;
  const cooperativeYield = new CooperativeYield();

  for (let index = 0; index < samples.length; index += FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(samples.length, index + FRAME_BATCH);

    for (let i = index; i < batchEnd; i += 1) {
      const input = samples[i] ?? 0;
      const filtered = alpha * (previousOutput + input - previousInput);
      output[i] = filtered;
      previousInput = input;
      previousOutput = filtered;
    }

    await cooperativeYield.maybeYield();
  }

  return output;
}

/** One-pole low-pass — softens harsh highs when needed. */
export async function applyLowPassAsync(
  samples: Float32Array,
  sampleRate: number,
  frequencyHz: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  const output = new Float32Array(samples.length);
  const rc = 1 / (2 * Math.PI * frequencyHz);
  const dt = 1 / sampleRate;
  const alpha = dt / (rc + dt);
  let previousOutput = samples[0] ?? 0;
  const cooperativeYield = new CooperativeYield();

  for (let index = 0; index < samples.length; index += FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(samples.length, index + FRAME_BATCH);

    for (let i = index; i < batchEnd; i += 1) {
      const input = samples[i] ?? 0;
      previousOutput = previousOutput + alpha * (input - previousOutput);
      output[i] = previousOutput;
    }

    await cooperativeYield.maybeYield();
  }

  return output;
}

/**
 * Pitch shift preserving duration — powered by SoundTouch (WSOLA).
 * Mirrors FFmpeg asetrate+atempo intent without the broken double-resample path.
 */
export async function pitchShiftPreserveDurationAsync(
  samples: Float32Array,
  factor: number,
  signal?: AbortSignal,
  sampleRate = 22_050,
): Promise<Float32Array> {
  return pitchShiftWithSoundTouchAsync(samples, sampleRate, factor, signal);
}

/** Spectral-envelope formant shift — factor > 1 lifts brightness, < 1 deepens body. */
export async function applyFormantShiftAsync(
  samples: Float32Array,
  _sampleRate: number,
  factor: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  return formantShiftCoreAsync(samples, factor, signal);
}

/** Slow down or speed up speech while keeping pitch — SoundTouch WSOLA stretch. */
export async function tempoShiftAsync(
  samples: Float32Array,
  sampleRate: number,
  factor: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  return timeStretchWithSoundTouchAsync(samples, sampleRate, factor, signal);
}

export { applyNoiseReduceAsync };
export { applyResonantEchoAsync };

/** Peaking EQ band — mirrors FFmpeg equalizer filter for a single band. */
export async function applyPeakingEqualizerAsync(
  samples: Float32Array,
  sampleRate: number,
  frequencyHz: number,
  gainDb: number,
  q = 1.4,
  signal?: AbortSignal,
): Promise<Float32Array> {
  if (Math.abs(gainDb) < 0.1) {
    return samples.slice();
  }

  const output = new Float32Array(samples.length);
  const a = Math.pow(10, gainDb / 40);
  const omega = (2 * Math.PI * frequencyHz) / sampleRate;
  const sinOmega = Math.sin(omega);
  const cosOmega = Math.cos(omega);
  const alpha = sinOmega / (2 * q);

  const b0 = 1 + alpha * a;
  const b1 = -2 * cosOmega;
  const b2 = 1 - alpha * a;
  const a0 = 1 + alpha / a;
  const a1 = -2 * cosOmega;
  const a2 = 1 - alpha / a;

  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  const cooperativeYield = new CooperativeYield();

  for (let index = 0; index < samples.length; index += FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(samples.length, index + FRAME_BATCH);

    for (let i = index; i < batchEnd; i += 1) {
      const x0 = samples[i] ?? 0;
      const y0 =
        (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      output[i] = y0;
      x2 = x1;
      x1 = x0;
      y2 = y1;
      y1 = y0;
    }

    await cooperativeYield.maybeYield();
  }

  return output;
}

/** Low shelf — mirrors Web Audio lowshelf used before basic wet voice chains. */
export async function applyLowShelfAsync(
  samples: Float32Array,
  sampleRate: number,
  frequencyHz: number,
  gainDb: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  if (Math.abs(gainDb) < 0.1) {
    return samples.slice();
  }

  const output = new Float32Array(samples.length);
  const w0 = (2 * Math.PI * frequencyHz) / sampleRate;
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const shelfSlope = 1;
  const amplitude = 10 ** (gainDb / 40);
  const alpha =
    (sinW0 / 2) *
    Math.sqrt((amplitude + 1 / amplitude) * (1 / shelfSlope - 1) + 2);
  const beta = 2 * Math.sqrt(amplitude) * alpha;
  const aPlus = amplitude + 1;
  const aMinus = amplitude - 1;

  const b0 = amplitude * (aPlus - aMinus * cosW0 + beta);
  const b1 = 2 * amplitude * (aMinus - aPlus * cosW0);
  const b2 = amplitude * (aPlus - aMinus * cosW0 - beta);
  const a0 = aPlus + aMinus * cosW0 + beta;
  const a1 = -2 * (aMinus + aPlus * cosW0);
  const a2 = aPlus + aMinus * cosW0 - beta;

  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  const cooperativeYield = new CooperativeYield();

  for (let index = 0; index < samples.length; index += FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(samples.length, index + FRAME_BATCH);

    for (let i = index; i < batchEnd; i += 1) {
      const x0 = samples[i] ?? 0;
      const y0 = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      output[i] = y0;
      x2 = x1;
      x1 = x0;
      y2 = y1;
      y1 = y0;
    }

    await cooperativeYield.maybeYield();
  }

  return output;
}

function sampleWaveshaperCurve(curve: Float32Array, input: number): number {
  const clamped = Math.max(-1, Math.min(1, input));
  const position = ((clamped + 1) * 0.5) * (curve.length - 1);
  const index = Math.floor(position);
  const fraction = position - index;
  const left = curve[index] ?? 0;
  const right = curve[Math.min(index + 1, curve.length - 1)] ?? 0;

  return left + fraction * (right - left);
}

/** Tape-style waveshaper — same curve as basic Kratos `createTapeSaturationCurve`. */
export async function applyWaveshaperAsync(
  samples: Float32Array,
  amount: number,
  inputGain = 1,
  signal?: AbortSignal,
): Promise<Float32Array> {
  if (amount <= 0) {
    return samples.slice();
  }

  const curve = createTapeSaturationCurve(amount);
  const output = new Float32Array(samples.length);
  const cooperativeYield = new CooperativeYield();

  for (let index = 0; index < samples.length; index += FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(samples.length, index + FRAME_BATCH);

    for (let i = index; i < batchEnd; i += 1) {
      const driven = (samples[i] ?? 0) * inputGain;
      output[i] = sampleWaveshaperCurve(curve, driven);
    }

    await cooperativeYield.maybeYield();
  }

  return output;
}

/** Soft tanh saturation — gravel / chest resonance without harsh digital clipping. */
export async function applySoftClipAsync(
  samples: Float32Array,
  amount: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  if (amount <= 0) {
    return samples.slice();
  }

  const output = new Float32Array(samples.length);
  const drive = 1 + amount * 4.5;
  const trim = 1 - amount * 0.12;
  const cooperativeYield = new CooperativeYield();

  for (let index = 0; index < samples.length; index += FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(samples.length, index + FRAME_BATCH);

    for (let i = index; i < batchEnd; i += 1) {
      const input = samples[i] ?? 0;
      output[i] = Math.tanh(input * drive) * trim;
    }

    await cooperativeYield.maybeYield();
  }

  return output;
}

/** Linear gain trim — keeps advanced chains from clipping after stacked EQ. */
export async function applyGainAsync(
  samples: Float32Array,
  linear: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  if (Math.abs(linear - 1) < 0.001) {
    return samples.slice();
  }

  const output = new Float32Array(samples.length);
  const cooperativeYield = new CooperativeYield();

  for (let index = 0; index < samples.length; index += FRAME_BATCH) {
    throwIfAborted(signal);
    const batchEnd = Math.min(samples.length, index + FRAME_BATCH);

    for (let i = index; i < batchEnd; i += 1) {
      output[i] = (samples[i] ?? 0) * linear;
    }

    await cooperativeYield.maybeYield();
  }

  return output;
}

/** Resample to target rate when filter chain needs a fixed processing rate. */
export { resampleMonoAsync };
