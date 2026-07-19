export const DEFAULT_WAVEFORM_BAR_COUNT = 48;
export const MIN_WAVEFORM_BAR_HEIGHT = 6;
export const MAX_WAVEFORM_BAR_HEIGHT = 72;

export function mixDownToMono(
  getChannelData: (channel: number) => Float32Array,
  numberOfChannels: number,
  length: number,
): Float32Array {
  if (numberOfChannels <= 1) {
    return getChannelData(0);
  }

  const mono = new Float32Array(length);
  for (let channel = 0; channel < numberOfChannels; channel += 1) {
    const data = getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      mono[index] += data[index] / numberOfChannels;
    }
  }

  return mono;
}

export function computeWaveformBars(
  channelData: Float32Array,
  barCount: number,
): number[] {
  if (barCount <= 0) {
    return [];
  }

  if (channelData.length === 0) {
    return Array.from({ length: barCount }, () => MIN_WAVEFORM_BAR_HEIGHT);
  }

  const samplesPerBar = Math.max(1, Math.floor(channelData.length / barCount));
  const peaks: number[] = [];
  let globalMax = 0;

  for (let bar = 0; bar < barCount; bar += 1) {
    const start = bar * samplesPerBar;
    const end = Math.min(channelData.length, start + samplesPerBar);
    let peak = 0;

    for (let index = start; index < end; index += 1) {
      const amplitude = Math.abs(channelData[index]);
      if (amplitude > peak) {
        peak = amplitude;
      }
    }

    peaks.push(peak);
    if (peak > globalMax) {
      globalMax = peak;
    }
  }

  if (globalMax <= 0) {
    return Array.from({ length: barCount }, () => MIN_WAVEFORM_BAR_HEIGHT);
  }

  const heightRange = MAX_WAVEFORM_BAR_HEIGHT - MIN_WAVEFORM_BAR_HEIGHT;
  return peaks.map(peak => {
    const normalized = peak / globalMax;
    return Math.round(MIN_WAVEFORM_BAR_HEIGHT + normalized * heightRange);
  });
}
