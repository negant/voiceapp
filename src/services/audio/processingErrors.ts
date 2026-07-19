export class ProcessingAbortedError extends Error {
  constructor() {
    super('Audio processing was cancelled');
    this.name = 'ProcessingAbortedError';
  }
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new ProcessingAbortedError();
  }
}

export function rethrowIfAborted(error: unknown): never {
  if (
    error instanceof ProcessingAbortedError ||
    (error instanceof DOMException && error.name === 'AbortError')
  ) {
    throw new ProcessingAbortedError();
  }
  throw error;
}
