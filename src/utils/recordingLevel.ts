type AudioBufferLike = {
  numberOfChannels: number;
  getChannelData: (channel: number) => Float32Array;
};

/** Maps microphone PCM RMS to a 0–1 level suitable for UI pulse animation. */
export function computeRecordingLevel(
  buffer: AudioBufferLike,
  channel = 0,
): number {
  const safeChannel = Math.min(
    Math.max(channel, 0),
    Math.max(buffer.numberOfChannels - 1, 0),
  );
  const data = buffer.getChannelData(safeChannel);
  if (data.length === 0) {
    return 0;
  }

  let sumSquares = 0;
  for (let index = 0; index < data.length; index += 1) {
    const sample = data[index];
    sumSquares += sample * sample;
  }

  const rms = Math.sqrt(sumSquares / data.length);
  return Math.min(1, rms / 0.22);
}
