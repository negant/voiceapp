import { env } from '@/config/env';

const PREFIX = '[VoiceApp]';

function formatPayload(data: unknown): unknown {
  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message,
      stack: data.stack,
    };
  }
  return data;
}

export const logger = {
  debug(scope: string, message: string, data?: unknown): void {
    if (!env.debugMode) {
      return;
    }
    if (data !== undefined) {
      console.log(`${PREFIX}[${scope}] ${message}`, formatPayload(data));
      return;
    }
    console.log(`${PREFIX}[${scope}] ${message}`);
  },

  /** Operational logs (e.g. DSP path) — always visible in dev tools. */
  info(scope: string, message: string, data?: unknown): void {
    if (data !== undefined) {
      console.log(`${PREFIX}[${scope}] ${message}`, formatPayload(data));
      return;
    }
    console.log(`${PREFIX}[${scope}] ${message}`);
  },

  warn(scope: string, message: string, data?: unknown): void {
    if (data !== undefined) {
      console.warn(`${PREFIX}[${scope}] ${message}`, formatPayload(data));
      return;
    }
    console.warn(`${PREFIX}[${scope}] ${message}`);
  },

  error(scope: string, message: string, data?: unknown): void {
    if (data !== undefined) {
      console.error(`${PREFIX}[${scope}] ${message}`, formatPayload(data));
      return;
    }
    console.error(`${PREFIX}[${scope}] ${message}`);
  },
};
