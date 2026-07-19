import ReactNativeBlobUtil from 'react-native-blob-util';

import { writeBinaryFile } from '@/utils/binaryFile';

jest.mock('react-native-blob-util', () => ({
  fs: {
    writeFile: jest.fn(() => Promise.resolve()),
    appendFile: jest.fn(() => Promise.resolve()),
  },
}));

describe('writeBinaryFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('writes empty files as an empty ascii payload', async () => {
    await writeBinaryFile('/tmp/out.wav', new Uint8Array());

    expect(ReactNativeBlobUtil.fs.writeFile).toHaveBeenCalledWith(
      '/tmp/out.wav',
      [],
      'ascii',
    );
    expect(ReactNativeBlobUtil.fs.appendFile).not.toHaveBeenCalled();
  });

  it('writes small payloads in a single chunk', async () => {
    const bytes = new Uint8Array([1, 2, 3]);

    await writeBinaryFile('/tmp/out.wav', bytes);

    expect(ReactNativeBlobUtil.fs.writeFile).toHaveBeenCalledWith(
      '/tmp/out.wav',
      [1, 2, 3],
      'ascii',
    );
    expect(ReactNativeBlobUtil.fs.appendFile).not.toHaveBeenCalled();
  });

  it('appends large payloads in chunks', async () => {
    const bytes = new Uint8Array(300_000);
    bytes[0] = 7;
    bytes[299_999] = 9;

    await writeBinaryFile('/tmp/out.wav', bytes);

    expect(ReactNativeBlobUtil.fs.writeFile).toHaveBeenCalledTimes(1);
    expect(ReactNativeBlobUtil.fs.appendFile).toHaveBeenCalledTimes(1);
    expect(ReactNativeBlobUtil.fs.writeFile).toHaveBeenCalledWith(
      '/tmp/out.wav',
      expect.any(Array),
      'ascii',
    );
  });
});
