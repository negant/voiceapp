import { FifoSampleBuffer, Stretch } from '@soundtouchjs/core';

import { throwIfAborted } from '@/services/audio/processingErrors';
import { CooperativeYield } from '@/utils/asyncYield';

const CHUNK_FRAMES = 4096;
const FLUSH_PASSES = 10;

function monoToStereoInterleaved(mono: Float32Array): Float32Array {
  const stereo = new Float32Array(mono.length * 2);

  for (let index = 0; index < mono.length; index += 1) {
    const sample = mono[index] ?? 0;
    const stereoIndex = index * 2;
    stereo[stereoIndex] = sample;
    stereo[stereoIndex + 1] = sample;
  }

  return stereo;
}

function stereoInterleavedToMono(
  stereo: Float32Array,
  frameCount: number,
): Float32Array {
  const mono = new Float32Array(frameCount);

  for (let index = 0; index < frameCount; index += 1) {
    const stereoIndex = index * 2;
    mono[index] =
      ((stereo[stereoIndex] ?? 0) + (stereo[stereoIndex + 1] ?? 0)) * 0.5;
  }

  return mono;
}

function concatChunks(chunks: Float32Array[]): Float32Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return merged;
}

function drainStretchOutput(
  outputBuffer: FifoSampleBuffer,
  chunks: Float32Array[],
): void {
  while (outputBuffer.frameCount > 0) {
    const framesAvailable = outputBuffer.frameCount;
    const extractStereo = new Float32Array(framesAvailable * 2);
    outputBuffer.extract(extractStereo, 0, framesAvailable);
    outputBuffer.receive(framesAvailable);
    chunks.push(stereoInterleavedToMono(extractStereo, framesAvailable));
  }
}

/**
 * Time-stretch without pitch change — tempo < 1 slows speech and lengthens audio.
 */
export async function timeStretchWithSoundTouchAsync(
  samples: Float32Array,
  sampleRate: number,
  tempoFactor: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  const clampedTempo = Math.max(0.5, Math.min(2, tempoFactor));

  if (Math.abs(clampedTempo - 1) < 0.01) {
    return samples.slice();
  }

  const stretch = new Stretch({
    createBuffers: false,
    sampleBufferFactory: () => new FifoSampleBuffer(),
  });
  const inputBuffer = new FifoSampleBuffer();
  const outputBuffer = new FifoSampleBuffer();

  stretch.inputBuffer = inputBuffer;
  stretch.outputBuffer = outputBuffer;
  stretch.setParameters(sampleRate, 0, 0, 0);
  stretch.tempo = clampedTempo;

  const inputStereo = monoToStereoInterleaved(samples);
  const outputChunks: Float32Array[] = [];
  const cooperativeYield = new CooperativeYield();
  let inputFrameOffset = 0;

  while (inputFrameOffset < samples.length) {
    throwIfAborted(signal);
    const framesToFeed = Math.min(
      CHUNK_FRAMES,
      samples.length - inputFrameOffset,
    );
    const chunkStereo = inputStereo.subarray(
      inputFrameOffset * 2,
      (inputFrameOffset + framesToFeed) * 2,
    );

    inputBuffer.putSamples(chunkStereo, 0, framesToFeed);
    stretch.process();
    drainStretchOutput(outputBuffer, outputChunks);

    inputFrameOffset += framesToFeed;
    await cooperativeYield.maybeYield();
  }

  const flushStereo = new Float32Array(CHUNK_FRAMES * 2);

  for (let pass = 0; pass < FLUSH_PASSES; pass += 1) {
    throwIfAborted(signal);
    inputBuffer.putSamples(flushStereo, 0, CHUNK_FRAMES);
    stretch.process();
    drainStretchOutput(outputBuffer, outputChunks);
    await cooperativeYield.maybeYield();
  }

  return concatChunks(outputChunks);
}
