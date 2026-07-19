import ReactNativeBlobUtil from 'react-native-blob-util';
import { Image } from 'react-native';

import { env } from '@/config/env';
import {
  WAVESPEED_MEDIA_UPLOAD_ENDPOINT,
  WAVESPEED_POLL_INTERVAL_MS,
  WAVESPEED_PREDICTIONS_BASE_URL,
  WAVESPEED_REQUEST_TIMEOUT_MS,
  WAVESPEED_STS_ENDPOINT,
} from '@/services/audio/aiEffects/waveSpeed/waveSpeedConfig';
import {
  AUDIO_IMPORTS_DIR,
  normalizePathForBlobUtil,
} from '@/services/audio/audioStorage';
import { throwIfAborted } from '@/services/audio/processingErrors';
import { logger } from '@/utils/logger';

const LOG_SCOPE = 'WaveSpeedSts';

export type WaveSpeedSpeechToSpeechInput = {
  sourceUri?: string;
  audioBase64?: string;
  sourceExtension?: string;
  sourceMime?: string;
  /** Public URL for the target voice sample (skips reference upload). */
  referenceAudioUrl?: string;
  /** Bundled asset module id from require() — uploaded when URL is missing. */
  referenceAudioAsset?: number;
  signal?: AbortSignal;
};

export type WaveSpeedSpeechToSpeechResult = {
  mp3Path: string;
};

export class WaveSpeedStsError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'WaveSpeedStsError';
    this.status = status;
  }
}

function guessMimeType(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.wav')) {
    return 'audio/wav';
  }
  if (lower.endsWith('.m4a') || lower.endsWith('.aac')) {
    return 'audio/mp4';
  }
  if (lower.endsWith('.ogg')) {
    return 'audio/ogg';
  }
  return 'audio/mpeg';
}

function guessExtension(path: string): string {
  const match = path.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? 'wav';
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error('Aborted'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason ?? new Error('Aborted'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

type BlobResponse = {
  info: () => { status: number };
  json: () => unknown;
  base64: () => string;
  text: () => string;
};

type CancellableFetch = Promise<BlobResponse> & {
  cancel: () => void;
};

type UploadResponse = {
  code?: number;
  message?: string;
  data?: {
    download_url?: string;
  };
};

type PredictionEnvelope = {
  code?: number;
  message?: string;
  data?: PredictionTask;
} & PredictionTask;

type PredictionTask = {
  id?: string;
  status?: string;
  outputs?: unknown;
  error?: string;
  urls?: { get?: string };
};

function unwrapTask(body: PredictionEnvelope): PredictionTask {
  return body.data ?? body;
}

function firstOutputUrl(outputs: unknown): string | null {
  if (!Array.isArray(outputs) || outputs.length === 0) {
    return null;
  }
  const first = outputs[0];
  if (typeof first === 'string' && first.startsWith('http')) {
    return first;
  }
  if (first && typeof first === 'object' && 'url' in first) {
    const url = (first as { url?: unknown }).url;
    if (typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
  }
  return null;
}

async function resolveSourceAudio(
  input: WaveSpeedSpeechToSpeechInput,
): Promise<{ audioBase64: string; extension: string; mime: string }> {
  let audioBase64 = input.audioBase64;
  let extension = input.sourceExtension ?? 'wav';
  let mime = input.sourceMime ?? guessMimeType(`source.${extension}`);

  if (!audioBase64) {
    if (!input.sourceUri) {
      throw new WaveSpeedStsError('STS requires sourceUri or audioBase64');
    }

    const sourcePath = normalizePathForBlobUtil(input.sourceUri);
    const exists = await ReactNativeBlobUtil.fs.exists(sourcePath);
    if (!exists) {
      throw new WaveSpeedStsError('Source audio file not found');
    }

    extension = guessExtension(sourcePath);
    mime = guessMimeType(sourcePath);
    audioBase64 = await ReactNativeBlobUtil.fs.readFile(sourcePath, 'base64');
  }

  if (!audioBase64 || audioBase64.length < 32) {
    throw new WaveSpeedStsError('Source audio file is empty or unreadable');
  }

  return { audioBase64, extension, mime };
}

async function uploadAudioBinary(
  apiKey: string,
  audioBase64: string,
  extension: string,
  mime: string,
  signal?: AbortSignal,
  filenamePrefix = 'source',
): Promise<string> {
  throwIfAborted(signal);

  const task = ReactNativeBlobUtil.config({
    timeout: WAVESPEED_REQUEST_TIMEOUT_MS,
  }).fetch(
    'POST',
    WAVESPEED_MEDIA_UPLOAD_ENDPOINT,
    {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'multipart/form-data',
    },
    [
      {
        name: 'file',
        filename: `${filenamePrefix}.${extension}`,
        type: mime,
        data: audioBase64,
      },
    ],
  ) as CancellableFetch;

  const onAbort = () => {
    try {
      task.cancel();
    } catch {
      // ignore cancel races
    }
  };
  signal?.addEventListener('abort', onAbort);

  try {
    const response = await task;
    throwIfAborted(signal);
    const status = response.info().status;
    if (status < 200 || status >= 300) {
      let detail = '';
      try {
        detail = String(response.text()).slice(0, 400);
      } catch {
        detail = '';
      }
      throw new WaveSpeedStsError(
        detail
          ? `WaveSpeed upload failed (${status}): ${detail}`
          : `WaveSpeed upload failed (${status})`,
        status,
      );
    }

    const body = response.json() as UploadResponse;
    const downloadUrl = body.data?.download_url;
    if (!downloadUrl) {
      throw new WaveSpeedStsError('WaveSpeed upload returned no download_url');
    }
    return downloadUrl;
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}

async function submitPrediction(
  apiKey: string,
  audioUrl: string,
  referenceAudioUrl: string,
  signal?: AbortSignal,
): Promise<{ predictionId: string; resultUrl: string }> {
  throwIfAborted(signal);

  const task = ReactNativeBlobUtil.config({
    timeout: WAVESPEED_REQUEST_TIMEOUT_MS,
  }).fetch(
    'POST',
    WAVESPEED_STS_ENDPOINT,
    {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    JSON.stringify({
      audio: audioUrl,
      reference_audio: referenceAudioUrl,
    }),
  ) as CancellableFetch;

  const onAbort = () => {
    try {
      task.cancel();
    } catch {
      // ignore cancel races
    }
  };
  signal?.addEventListener('abort', onAbort);

  try {
    const response = await task;
    throwIfAborted(signal);
    const status = response.info().status;
    if (status < 200 || status >= 300) {
      let detail = '';
      try {
        detail = String(response.text()).slice(0, 400);
      } catch {
        detail = '';
      }
      throw new WaveSpeedStsError(
        detail
          ? `WaveSpeed STS submit failed (${status}): ${detail}`
          : `WaveSpeed STS submit failed (${status})`,
        status,
      );
    }

    const body = response.json() as PredictionEnvelope;
    const prediction = unwrapTask(body);
    if (!prediction.id) {
      throw new WaveSpeedStsError(
        'WaveSpeed STS submission did not contain a prediction id',
      );
    }

    const resultUrl =
      prediction.urls?.get ||
      `${WAVESPEED_PREDICTIONS_BASE_URL}/${prediction.id}/result`;

    return { predictionId: prediction.id, resultUrl };
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}

async function pollUntilComplete(
  apiKey: string,
  resultUrl: string,
  signal?: AbortSignal,
): Promise<string> {
  while (true) {
    throwIfAborted(signal);

    const task = ReactNativeBlobUtil.config({
      timeout: WAVESPEED_REQUEST_TIMEOUT_MS,
    }).fetch('GET', resultUrl, {
      Authorization: `Bearer ${apiKey}`,
    }) as CancellableFetch;

    const onAbort = () => {
      try {
        task.cancel();
      } catch {
        // ignore cancel races
      }
    };
    signal?.addEventListener('abort', onAbort);

    let status = '';
    let outputs: unknown;
    let errorDetail = '';

    try {
      const response = await task;
      throwIfAborted(signal);
      const httpStatus = response.info().status;
      if (httpStatus < 200 || httpStatus >= 300) {
        let detail = '';
        try {
          detail = String(response.text()).slice(0, 400);
        } catch {
          detail = '';
        }
        throw new WaveSpeedStsError(
          detail
            ? `WaveSpeed STS poll failed (${httpStatus}): ${detail}`
            : `WaveSpeed STS poll failed (${httpStatus})`,
          httpStatus,
        );
      }

      const body = response.json() as PredictionEnvelope;
      const result = unwrapTask(body);
      status = result.status ?? '';
      outputs = result.outputs;
      errorDetail = result.error ?? '';
    } finally {
      signal?.removeEventListener('abort', onAbort);
    }

    if (status === 'completed') {
      const outputUrl = firstOutputUrl(outputs);
      if (!outputUrl) {
        throw new WaveSpeedStsError('WaveSpeed STS completed with empty outputs');
      }
      return outputUrl;
    }

    if (status === 'failed' || status === 'cancelled' || status === 'timeout') {
      throw new WaveSpeedStsError(
        errorDetail
          ? `WaveSpeed STS ${status}: ${errorDetail}`
          : `WaveSpeed STS ${status}`,
      );
    }

    if (status !== 'created' && status !== 'processing') {
      throw new WaveSpeedStsError(`Unexpected WaveSpeed status: ${status}`);
    }

    await sleep(WAVESPEED_POLL_INTERVAL_MS, signal);
  }
}

async function downloadOutputMp3(
  apiKey: string,
  outputUrl: string,
  signal?: AbortSignal,
): Promise<string> {
  throwIfAborted(signal);

  const task = ReactNativeBlobUtil.config({
    timeout: WAVESPEED_REQUEST_TIMEOUT_MS,
  }).fetch('GET', outputUrl, {
    Authorization: `Bearer ${apiKey}`,
  }) as CancellableFetch;

  const onAbort = () => {
    try {
      task.cancel();
    } catch {
      // ignore cancel races
    }
  };
  signal?.addEventListener('abort', onAbort);

  try {
    const response = await task;
    throwIfAborted(signal);
    const status = response.info().status;
    if (status < 200 || status >= 300) {
      throw new WaveSpeedStsError(
        `WaveSpeed output download failed (${status})`,
        status,
      );
    }

    const responseBase64 = response.base64();
    if (!responseBase64 || responseBase64.length < 32) {
      throw new WaveSpeedStsError('WaveSpeed STS returned empty audio');
    }

    const mp3Path = `${AUDIO_IMPORTS_DIR}/wavespeed-sts-${Date.now()}.mp3`;
    await ReactNativeBlobUtil.fs.writeFile(mp3Path, responseBase64, 'base64');
    throwIfAborted(signal);
    return mp3Path;
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}

async function resolveReferenceAudioUrl(
  apiKey: string,
  input: WaveSpeedSpeechToSpeechInput,
): Promise<string> {
  if (input.referenceAudioUrl?.trim()) {
    return input.referenceAudioUrl.trim();
  }

  if (input.referenceAudioAsset == null) {
    throw new WaveSpeedStsError(
      'WaveSpeed STS requires referenceAudioUrl or referenceAudioAsset',
    );
  }

  throwIfAborted(input.signal);

  const resolved = Image.resolveAssetSource(input.referenceAudioAsset);
  if (!resolved?.uri) {
    throw new WaveSpeedStsError('Could not resolve bundled reference audio asset');
  }

  const assetUri = resolved.uri;
  let audioBase64: string;

  // Metro serves bundled assets over HTTP in dev; release builds use file URIs.
  if (assetUri.startsWith('http://') || assetUri.startsWith('https://')) {
    const response = (await ReactNativeBlobUtil.config({
      timeout: WAVESPEED_REQUEST_TIMEOUT_MS,
    }).fetch('GET', assetUri)) as BlobResponse;
    const status = response.info().status;
    if (status < 200 || status >= 300) {
      throw new WaveSpeedStsError(
        `Failed to load bundled reference audio (${status})`,
        status,
      );
    }
    audioBase64 = response.base64();
  } else {
    const sourcePath = normalizePathForBlobUtil(assetUri);
    const exists = await ReactNativeBlobUtil.fs.exists(sourcePath);
    if (!exists) {
      throw new WaveSpeedStsError('Bundled reference audio file not found');
    }
    audioBase64 = await ReactNativeBlobUtil.fs.readFile(sourcePath, 'base64');
  }

  if (!audioBase64 || audioBase64.length < 32) {
    throw new WaveSpeedStsError('Bundled reference audio is empty or unreadable');
  }

  logger.info(LOG_SCOPE, 'reference upload start', {
    audioBase64Chars: audioBase64.length,
  });

  return uploadAudioBinary(
    apiKey,
    audioBase64,
    'mp3',
    'audio/mpeg',
    input.signal,
    'reference',
  );
}

/**
 * WaveSpeed Chatterbox speech-to-speech:
 * upload source → submit prediction → poll → download MP3.
 */
export async function convertSpeechToSpeechWithWaveSpeed(
  input: WaveSpeedSpeechToSpeechInput,
): Promise<WaveSpeedSpeechToSpeechResult> {
  const apiKey = env.waveSpeedApiKey;
  if (!apiKey) {
    throw new WaveSpeedStsError('WaveSpeed API key is not configured');
  }

  throwIfAborted(input.signal);
  const { audioBase64, extension, mime } = await resolveSourceAudio(input);
  throwIfAborted(input.signal);

  logger.info(LOG_SCOPE, 'upload start', {
    mime,
    audioBase64Chars: audioBase64.length,
  });

  const audioUrl = await uploadAudioBinary(
    apiKey,
    audioBase64,
    extension,
    mime,
    input.signal,
  );

  const referenceAudioUrl = await resolveReferenceAudioUrl(apiKey, input);

  logger.info(LOG_SCOPE, 'submit start', {
    hasReference: Boolean(referenceAudioUrl),
  });

  const { predictionId, resultUrl } = await submitPrediction(
    apiKey,
    audioUrl,
    referenceAudioUrl,
    input.signal,
  );

  logger.info(LOG_SCOPE, 'poll start', { predictionId });
  const outputUrl = await pollUntilComplete(apiKey, resultUrl, input.signal);
  logger.info(LOG_SCOPE, 'download start', { outputUrlHost: safeHost(outputUrl) });

  const mp3Path = await downloadOutputMp3(apiKey, outputUrl, input.signal);
  return { mp3Path };
}

function safeHost(url: string): string | undefined {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}
