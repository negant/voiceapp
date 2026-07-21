import { Image } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { WAVESPEED_REFERENCE_ANDROID_BUNDLE_PATHS } from '@/constants/waveSpeedReferences';

import { WAVESPEED_REQUEST_TIMEOUT_MS } from './waveSpeedConfig';

type BlobResponse = {
  info: () => { status: number };
  base64: () => string;
};

export class BundledAssetReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BundledAssetReadError';
  }
}

async function assertCacheHasPayload(cachePath: string): Promise<void> {
  const exists = await ReactNativeBlobUtil.fs.exists(cachePath);
  if (!exists) {
    throw new BundledAssetReadError('Bundled asset cache file missing');
  }
  const stat = await ReactNativeBlobUtil.fs.stat(cachePath);
  if (stat.size <= 32) {
    throw new BundledAssetReadError('Bundled asset file is empty');
  }
}

async function fetchHttpAssetToCache(assetUri: string, cachePath: string): Promise<void> {
  const response = (await ReactNativeBlobUtil.config({
    timeout: WAVESPEED_REQUEST_TIMEOUT_MS,
  }).fetch('GET', assetUri)) as BlobResponse;
  const status = response.info().status;
  if (status < 200 || status >= 300) {
    throw new BundledAssetReadError(`HTTP asset fetch failed (${status})`);
  }
  const base64 = response.base64();
  if (!base64 || base64.length < 32) {
    throw new BundledAssetReadError('HTTP asset fetch returned empty payload');
  }
  await ReactNativeBlobUtil.fs.writeFile(cachePath, base64, 'base64');
}

async function copyBundleAssetToCache(bundleRelativePath: string, cachePath: string): Promise<void> {
  const bundleUri = ReactNativeBlobUtil.fs.asset(bundleRelativePath);
  await ReactNativeBlobUtil.fs.cp(bundleUri, cachePath);
  await assertCacheHasPayload(cachePath);
}

/** Copy a resolved asset URI to cache — Metro HTTP (debug) or bundle-assets (Android release). */
async function copyAssetUriToCache(assetUri: string, extension: string): Promise<string> {
  const cachePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/bundled-asset-${Date.now()}.${extension}`;

  try {
    if (assetUri.startsWith('http://') || assetUri.startsWith('https://')) {
      await fetchHttpAssetToCache(assetUri, cachePath);
      return cachePath;
    }

    if (assetUri.startsWith('asset:/') || assetUri.startsWith('assets://')) {
      await ReactNativeBlobUtil.fs.cp(assetUri, cachePath);
      await assertCacheHasPayload(cachePath);
      return cachePath;
    }

    const bundlePath = WAVESPEED_REFERENCE_ANDROID_BUNDLE_PATHS[assetUri];
    if (bundlePath) {
      await copyBundleAssetToCache(bundlePath, cachePath);
      return cachePath;
    }

    throw new BundledAssetReadError(`Unsupported bundled asset URI: ${assetUri}`);
  } catch (error) {
    await ReactNativeBlobUtil.fs.unlink(cachePath).catch(() => undefined);
    if (error instanceof BundledAssetReadError) {
      throw error;
    }
    throw new BundledAssetReadError(
      `Could not copy bundled asset (uri=${assetUri}): ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/** Local file path for BlobUtil.wrap upload; caller must run cleanup(). */
export async function resolveBundledAssetFilePath(
  assetModule: number,
  extension = 'mp3',
): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const resolved = Image.resolveAssetSource(assetModule);
  if (!resolved?.uri) {
    throw new BundledAssetReadError('Could not resolve bundled asset');
  }

  const cachePath = await copyAssetUriToCache(resolved.uri, extension);
  return {
    path: cachePath,
    cleanup: () => ReactNativeBlobUtil.fs.unlink(cachePath).catch(() => undefined),
  };
}
