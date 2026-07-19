import type { RenderableAudioBuffer } from '@/services/audio/audioDecode';
import { throwIfAborted } from '@/services/audio/processingErrors';
import { CooperativeYield, COOPERATIVE_FRAME_BATCH } from '@/utils/asyncYield';

/** Copies native channel data into JS heap once — avoids per-sample bridge calls. */
export function snapshotChannelData(source: RenderableAudioBuffer): Float32Array[] {
  const channels: Float32Array[] = [];

  for (let channel = 0; channel < source.numberOfChannels; channel += 1) {
    channels.push(new Float32Array(source.getChannelData(channel)));
  }

  return channels;
}

/** Voice processing uses mono — downmixes stereo (or multi-channel) sources in one pass. */
export function mixDownToMono(source: RenderableAudioBuffer): Float32Array {
  const { length, numberOfChannels } = source;
  const channels = snapshotChannelData(source);

  if (numberOfChannels <= 1) {
    return channels[0] ?? new Float32Array(length);
  }

  const mono = new Float32Array(length);
  const invChannels = 1 / numberOfChannels;

  for (let frame = 0; frame < length; frame += 1) {
    let sum = 0;
    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      sum += channels[channel][frame];
    }
    mono[frame] = sum * invChannels;
  }

  return mono;
}

/** Downmix with periodic yields so the processing modal timer and cancel stay responsive. */
export async function mixDownToMonoAsync(
  source: RenderableAudioBuffer,
  signal?: AbortSignal,
): Promise<Float32Array> {
  const { length, numberOfChannels } = source;
  const cooperativeYield = new CooperativeYield();

  throwIfAborted(signal);
  const channels = snapshotChannelData(source);
  await cooperativeYield.maybeYield(true);

  if (numberOfChannels <= 1) {
    return channels[0] ?? new Float32Array(length);
  }

  const mono = new Float32Array(length);
  const invChannels = 1 / numberOfChannels;

  for (let frame = 0; frame < length; frame += COOPERATIVE_FRAME_BATCH) {
    throwIfAborted(signal);
    const frameEnd = Math.min(length, frame + COOPERATIVE_FRAME_BATCH);

    for (let currentFrame = frame; currentFrame < frameEnd; currentFrame += 1) {
      let sum = 0;
      for (let channel = 0; channel < numberOfChannels; channel += 1) {
        sum += channels[channel][currentFrame];
      }
      mono[currentFrame] = sum * invChannels;
    }

    await cooperativeYield.maybeYield();
  }

  return mono;
}
