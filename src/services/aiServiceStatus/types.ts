/**
 * Public WaveSpeed status page summary
 * (https://api.wavespeed.ai/public/v3/summary.json — Instatus-compatible).
 */
export type WaveSpeedStatusSummary = {
  page?: {
    name?: string;
    url?: string;
    /** Typically UP | HASISSUES | UNDERMAINTENANCE */
    status?: string;
  };
  activeIncidents?: unknown[];
  activeMaintenances?: unknown[];
};

/** Traffic-light severity used in Settings + Voice Studio. */
export type AiServiceStatusSeverity =
  | 'ok'
  | 'degraded'
  | 'outage'
  | 'unknown';

export type AiServiceStatusColor = 'green' | 'yellow' | 'red' | 'gray';

export type AiServiceStatusSnapshot = {
  severity: AiServiceStatusSeverity;
  color: AiServiceStatusColor;
  pageStatus: string | null;
  activeIncidentsCount: number;
  activeMaintenancesCount: number;
  fetchedAt: number;
  source: 'network' | 'cache' | 'fallback';
};
