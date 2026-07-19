import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { config } from './config.js';

const logsDir = join(process.cwd(), 'logs');

export const fileLoggingEnabled = config.nodeEnv === 'development';

function todayStamp(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Append one JSON line to server/logs/api-YYYY-MM-DD.log (dev only). */
export function appendDevLogLine(payload: Record<string, unknown>): void {
  if (!fileLoggingEnabled) {
    return;
  }
  mkdirSync(logsDir, { recursive: true });
  const line = `${JSON.stringify({ time: new Date().toISOString(), ...payload })}\n`;
  appendFileSync(join(logsDir, `api-${todayStamp()}.log`), line, 'utf8');
}

export function ensureDevLogsDir(): string {
  mkdirSync(logsDir, { recursive: true });
  return join(logsDir, `api-${todayStamp()}.log`);
}
