import ReactNativeBlobUtil from 'react-native-blob-util';

/** Chunk size for native binary writes — avoids huge bridge arrays. */
const WRITE_CHUNK_BYTES = 256 * 1024;

function toAsciiPayload(bytes: Uint8Array): number[] {
  return Array.from(bytes);
}

export async function writeBinaryFile(
  path: string,
  bytes: Uint8Array,
): Promise<void> {
  if (bytes.length === 0) {
    await ReactNativeBlobUtil.fs.writeFile(path, [], 'ascii');
    return;
  }

  const firstChunkEnd = Math.min(WRITE_CHUNK_BYTES, bytes.length);
  await ReactNativeBlobUtil.fs.writeFile(
    path,
    toAsciiPayload(bytes.subarray(0, firstChunkEnd)),
    'ascii',
  );

  for (
    let offset = firstChunkEnd;
    offset < bytes.length;
    offset += WRITE_CHUNK_BYTES
  ) {
    const end = Math.min(offset + WRITE_CHUNK_BYTES, bytes.length);
    await ReactNativeBlobUtil.fs.appendFile(
      path,
      toAsciiPayload(bytes.subarray(offset, end)),
      'ascii',
    );
  }
}
