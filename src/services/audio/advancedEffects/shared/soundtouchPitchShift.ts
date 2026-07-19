import { SoundTouch } from '@soundtouchjs/core';

import { throwIfAborted } from '@/services/audio/processingErrors';
import { CooperativeYield } from '@/utils/asyncYield';

const CHUNK_FRAMES = 4096;
const FLUSH_PASSES = 8;

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

function drainOutputBuffer(
  soundTouch: SoundTouch,
  chunks: Float32Array[],
): void {
  const { outputBuffer } = soundTouch;

  while (outputBuffer.frameCount > 0) {
    const framesAvailable = outputBuffer.frameCount;
    const extractStereo = new Float32Array(framesAvailable * 2);
    outputBuffer.extract(extractStereo, 0, framesAvailable);
    outputBuffer.receive(framesAvailable);
    chunks.push(stereoInterleavedToMono(extractStereo, framesAvailable));
  }
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

function trimToLength(samples: Float32Array, targetLength: number): Float32Array {
  if (samples.length === targetLength) {
    return samples;
  }

  if (samples.length > targetLength) {
    return samples.slice(0, targetLength);
  }

  const padded = new Float32Array(targetLength);
  padded.set(samples);
  return padded;
}

/**
 * Offline pitch shift with duration preserved — SoundTouch WSOLA pipeline.
 * Replaces the broken double-resample FFmpeg asetrate+atempo emulation.
 */
export async function pitchShiftWithSoundTouchAsync(
  samples: Float32Array,
  sampleRate: number,
  pitchFactor: number,
  signal?: AbortSignal,
): Promise<Float32Array> {
  const clampedPitch = Math.max(0.5, Math.min(2, pitchFactor));

  if (Math.abs(clampedPitch - 1) < 0.01) {
    return samples.slice();
  }

  const soundTouch = new SoundTouch({
    sampleRate,
    sampleBufferType: 'fifo',
  });
  soundTouch.pitch = clampedPitch;

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

    soundTouch.inputBuffer.putSamples(chunkStereo, 0, framesToFeed);
    soundTouch.process();
    drainOutputBuffer(soundTouch, outputChunks);

    inputFrameOffset += framesToFeed;
    await cooperativeYield.maybeYield();
  }

  const flushStereo = new Float32Array(CHUNK_FRAMES * 2);

  for (let pass = 0; pass < FLUSH_PASSES; pass += 1) {
    throwIfAborted(signal);
    soundTouch.inputBuffer.putSamples(flushStereo, 0, CHUNK_FRAMES);
    soundTouch.process();
    drainOutputBuffer(soundTouch, outputChunks);
    await cooperativeYield.maybeYield();
  }

  return trimToLength(concatChunks(outputChunks), samples.length);
}
