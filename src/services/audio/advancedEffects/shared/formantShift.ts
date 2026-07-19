import { throwIfAborted } from '@/services/audio/processingErrors';
import { CooperativeYield } from '@/utils/asyncYield';

const FFT_SIZE = 2048;
const HOP_SIZE = 512;
const MIN_FORMANT_FACTOR = 0.7;
const MAX_FORMANT_FACTOR = 1.45;

function createHannWindow(size: number): Float32Array {
  const window = new Float32Array(size);

  for (let index = 0; index < size; index += 1) {
    window[index] = 0.5 * (1 - Math.cos((2 * Math.PI * index) / (size - 1)));
  }

  return window;
}

function bitReversePermute(real: Float32Array, imag: Float32Array): void {
  /* eslint-disable no-bitwise -- radix-2 FFT index permutation */
  const length = real.length;
  let j = 0;

  for (let index = 1; index < length; index += 1) {
    let bit = length >> 1;

    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }

    j ^= bit;

    if (index < j) {
      const tempReal = real[index] ?? 0;
      const tempImag = imag[index] ?? 0;
      real[index] = real[j] ?? 0;
      imag[index] = imag[j] ?? 0;
      real[j] = tempReal;
      imag[j] = tempImag;
    }
  }
  /* eslint-enable no-bitwise */
}

/** In-place radix-2 Cooley–Tukey FFT for power-of-two buffers. */
function fftInPlace(real: Float32Array, imag: Float32Array, inverse: boolean): void {
  /* eslint-disable no-bitwise -- FFT butterfly stage sizing */
  const length = real.length;
  bitReversePermute(real, imag);

  for (let size = 2; size <= length; size <<= 1) {
    const halfSize = size >> 1;
    const angle = ((inverse ? 1 : -1) * 2 * Math.PI) / size;
    const stepCos = Math.cos(angle);
    const stepSin = Math.sin(angle);

    for (let start = 0; start < length; start += size) {
      let cos = 1;
      let sin = 0;

      for (let offset = 0; offset < halfSize; offset += 1) {
        const evenIndex = start + offset;
        const oddIndex = evenIndex + halfSize;
        const oddReal = real[oddIndex] ?? 0;
        const oddImag = imag[oddIndex] ?? 0;
        const twiddleReal = oddReal * cos - oddImag * sin;
        const twiddleImag = oddReal * sin + oddImag * cos;
        const evenReal = real[evenIndex] ?? 0;
        const evenImag = imag[evenIndex] ?? 0;

        real[evenIndex] = evenReal + twiddleReal;
        imag[evenIndex] = evenImag + twiddleImag;
        real[oddIndex] = evenReal - twiddleReal;
        imag[oddIndex] = evenImag - twiddleImag;

        const nextCos = cos * stepCos - sin * stepSin;
        sin = cos * stepSin + sin * stepCos;
        cos = nextCos;
      }
    }
  }

  if (inverse) {
    for (let index = 0; index < length; index += 1) {
      real[index] = (real[index] ?? 0) / length;
      imag[index] = (imag[index] ?? 0) / length;
    }
  }
  /* eslint-enable no-bitwise */
}

function interpolateMagnitude(
  magnitudes: Float32Array,
  sourceBin: number,
): number {
  if (sourceBin <= 0) {
    return magnitudes[0] ?? 0;
  }

  const maxBin = magnitudes.length - 1;

  if (sourceBin >= maxBin) {
    return magnitudes[maxBin] ?? 0;
  }

  const lowerIndex = Math.floor(sourceBin);
  const upperIndex = lowerIndex + 1;
  const fraction = sourceBin - lowerIndex;

  return (
    (magnitudes[lowerIndex] ?? 0) * (1 - fraction) +
    (magnitudes[upperIndex] ?? 0) * fraction
  );
}

function interpolatePhase(
  phases: Float32Array,
  sourceBin: number,
): number {
  if (sourceBin <= 0) {
    return phases[0] ?? 0;
  }

  const maxBin = phases.length - 1;

  if (sourceBin >= maxBin) {
    return phases[maxBin] ?? 0;
  }

  const lowerIndex = Math.floor(sourceBin);
  const upperIndex = lowerIndex + 1;
  const fraction = sourceBin - lowerIndex;
  const lowerPhase = phases[lowerIndex] ?? 0;
  const upperPhase = phases[upperIndex] ?? 0;
  const delta = Math.atan2(
    Math.sin(upperPhase - lowerPhase),
    Math.cos(upperPhase - lowerPhase),
  );

  return lowerPhase + delta * fraction;
}

function shiftFormantFrame(
  frame: Float32Array,
  window: Float32Array,
  factor: number,
  scratchReal: Float32Array,
  scratchImag: Float32Array,
): Float32Array {
  for (let index = 0; index < FFT_SIZE; index += 1) {
    scratchReal[index] = (frame[index] ?? 0) * (window[index] ?? 0);
    scratchImag[index] = 0;
  }

  fftInPlace(scratchReal, scratchImag, false);

  const halfBins = FFT_SIZE / 2;
  const magnitudes = new Float32Array(halfBins);
  const phases = new Float32Array(halfBins);

  for (let bin = 0; bin < halfBins; bin += 1) {
    const real = scratchReal[bin] ?? 0;
    const imag = scratchImag[bin] ?? 0;
    magnitudes[bin] = Math.hypot(real, imag);
    phases[bin] = Math.atan2(imag, real);
  }

  for (let bin = 0; bin < halfBins; bin += 1) {
    const sourceBin = bin / factor;
    const magnitude = interpolateMagnitude(magnitudes, sourceBin);
    const phase = interpolatePhase(phases, sourceBin);
    scratchReal[bin] = magnitude * Math.cos(phase);
    scratchImag[bin] = magnitude * Math.sin(phase);
  }

  for (let bin = halfBins; bin < FFT_SIZE; bin += 1) {
    const mirror = FFT_SIZE - bin;
    scratchReal[bin] = scratchReal[mirror] ?? 0;
    scratchImag[bin] = -(scratchImag[mirror] ?? 0);
  }

  fftInPlace(scratchReal, scratchImag, true);

  const output = new Float32Array(FFT_SIZE);

  for (let index = 0; index < FFT_SIZE; index += 1) {
    output[index] = (scratchReal[index] ?? 0) * (window[index] ?? 0);
  }

  return output;
}

/**
 * STFT spectral-envelope shift — stretches magnitude along frequency without
 * changing duration. factor > 1 brightens / lifts formants; < 1 darkens them.
 */
export async function applyFormantShiftAsync(
  samples: Float32Array,
  factor: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  const clampedFactor = Math.max(
    MIN_FORMANT_FACTOR,
    Math.min(MAX_FORMANT_FACTOR, factor),
  );

  if (Math.abs(clampedFactor - 1) < 0.01) {
    return samples.slice();
  }

  const window = createHannWindow(FFT_SIZE);
  const output = new Float32Array(samples.length);
  const windowSum = new Float32Array(samples.length);
  const scratchReal = new Float32Array(FFT_SIZE);
  const scratchImag = new Float32Array(FFT_SIZE);
  const frame = new Float32Array(FFT_SIZE);
  const cooperativeYield = new CooperativeYield();

  for (let start = 0; start < samples.length; start += HOP_SIZE) {
    throwIfAborted(signal);
    frame.fill(0);

    for (let index = 0; index < FFT_SIZE; index += 1) {
      const sampleIndex = start + index;

      if (sampleIndex < samples.length) {
        frame[index] = samples[sampleIndex] ?? 0;
      }
    }

    const shiftedFrame = shiftFormantFrame(
      frame,
      window,
      clampedFactor,
      scratchReal,
      scratchImag,
    );

    for (let index = 0; index < FFT_SIZE; index += 1) {
      const outputIndex = start + index;

      if (outputIndex >= samples.length) {
        break;
      }

      const windowValue = window[index] ?? 0;
      output[outputIndex] =
        (output[outputIndex] ?? 0) + (shiftedFrame[index] ?? 0);
      windowSum[outputIndex] =
        (windowSum[outputIndex] ?? 0) + windowValue * windowValue;
    }

    await cooperativeYield.maybeYield();
  }

  for (let index = 0; index < samples.length; index += 1) {
    const normalization = windowSum[index] ?? 0;

    if (normalization > 1e-8) {
      output[index] = (output[index] ?? 0) / normalization;
    }
  }

  return output;
}
