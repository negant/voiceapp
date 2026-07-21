import { Image } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import {
  resolveBundledAssetFilePath,
  BundledAssetReadError,
} from '@/services/audio/aiEffects/waveSpeed/resolveBundledAssetFile';

jest.mock('react-native', () => ({
  Image: {
    resolveAssetSource: jest.fn(),
  },
}));

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    config: jest.fn(() => ({
      fetch: jest.fn(),
    })),
    fs: {
      dirs: { CacheDir: '/tmp/cache' },
      asset: jest.fn((path: string) => `bundle-assets://${path}`),
      exists: jest.fn(async () => true),
      stat: jest.fn(async () => ({ size: 4096 })),
      cp: jest.fn(async () => undefined),
      writeFile: jest.fn(async () => undefined),
      unlink: jest.fn(async () => undefined),
    },
  },
}));

const resolveAssetSource = Image.resolveAssetSource as jest.Mock;
const blobUtil = ReactNativeBlobUtil as jest.Mocked<typeof ReactNativeBlobUtil>;

describe('resolveBundledAssetFilePath', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (blobUtil.fs.stat as jest.Mock).mockResolvedValue({ size: 4096 });
  });

  it('copies Metro HTTP asset URIs in debug', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      info: () => ({ status: 200 }),
      base64: () => globalThis.btoa('reference-audio-bytes-long'),
    });
    blobUtil.config.mockReturnValue({ fetch: fetchMock } as never);
    resolveAssetSource.mockReturnValue({
      uri: 'http://localhost:8088/assets/references/narratorFemale.mp3',
    });

    const resolved = await resolveBundledAssetFilePath(1);

    expect(fetchMock).toHaveBeenCalled();
    expect(resolved.path).toContain('/tmp/cache/bundled-asset-');
    await resolved.cleanup();
  });

  it('copies asset:/ URIs to cache', async () => {
    resolveAssetSource.mockReturnValue({ uri: 'asset:/narratorFemale.mp3' });

    const resolved = await resolveBundledAssetFilePath(2);

    expect(blobUtil.fs.cp).toHaveBeenCalledWith(
      'asset:/narratorFemale.mp3',
      expect.stringContaining('/tmp/cache/bundled-asset-'),
    );
    await resolved.cleanup();
  });

  it('maps Android release resource names to bundle-assets paths', async () => {
    resolveAssetSource.mockReturnValue({ uri: 'assets_references_narratorfemale' });

    const resolved = await resolveBundledAssetFilePath(3);

    expect(blobUtil.fs.asset).toHaveBeenCalledWith('narratorFemale.mp3');
    expect(blobUtil.fs.cp).toHaveBeenCalledWith(
      'bundle-assets://narratorFemale.mp3',
      expect.stringContaining('/tmp/cache/bundled-asset-'),
    );
    await resolved.cleanup();
  });

  it('throws when asset cannot be resolved', async () => {
    resolveAssetSource.mockReturnValue(null);

    await expect(resolveBundledAssetFilePath(4)).rejects.toBeInstanceOf(BundledAssetReadError);
  });

  it('throws for unknown bundled asset URIs', async () => {
    resolveAssetSource.mockReturnValue({ uri: 'assets_unknown_file' });

    await expect(resolveBundledAssetFilePath(5)).rejects.toBeInstanceOf(BundledAssetReadError);
  });
});
