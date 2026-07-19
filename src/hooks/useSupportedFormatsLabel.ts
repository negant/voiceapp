import { useMemo } from 'react';

import { env } from '@/config/env';
import { formatSupportedFormatsList } from '@/utils/audioFile';

export function useSupportedFormatsLabel(): string {
  return useMemo(
    () => formatSupportedFormatsList(env.supportedAudioFormats),
    [],
  );
}
