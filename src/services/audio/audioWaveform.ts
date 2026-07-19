import { decodeAudioFile } from '@/services/audio/audioDecode';
import { logger } from '@/utils/logger';
import {
  computeWaveformBars,
  DEFAULT_WAVEFORM_BAR_COUNT,
  mixDownToMono,
} from '@/utils/waveformPreview';

const LOG_SCOPE = 'AudioWaveform';
const waveformCache = new Map<string, number[]>();

export async function getAudioWaveformPreview(
  uri: string,
  barCount = DEFAULT_WAVEFORM_BAR_COUNT,
): Promise<number[]> {
  const cacheKey = `${uri}:${barCount}`;
  const cached = waveformCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const buffer = await decodeAudioFile(uri);
  const mono = mixDownToMono(
    channel => buffer.getChannelData(channel),
    buffer.numberOfChannels,
    buffer.length,
  );
  const bars = computeWaveformBars(mono, barCount);
  waveformCache.set(cacheKey, bars);
  logger.debug(LOG_SCOPE, 'generated preview', {
    uri,
    barCount,
    durationSec: buffer.duration,
  });
  return bars;
}

export function clearAudioWaveformCache(): void {
  waveformCache.clear();
}
