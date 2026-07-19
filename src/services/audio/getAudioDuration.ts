import ReactNativeBlobUtil from 'react-native-blob-util';

import {
  decodeBase64Chunk,
  parseAudioDurationFromHeader,
} from '@/services/audio/audioMetadata';
import { normalizePathForBlobUtil } from '@/services/audio/audioStorage';

export async function getAudioDurationSec(
  uri: string,
  extension: string,
): Promise<number | null> {
  const path = normalizePathForBlobUtil(uri);
  const base64 = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
  const bytes = decodeBase64Chunk(base64);
  const duration = parseAudioDurationFromHeader(bytes, extension);
  return duration === null ? null : Math.round(duration);
}
