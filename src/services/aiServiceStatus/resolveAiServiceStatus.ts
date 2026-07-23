import type {
  AiServiceStatusColor,
  AiServiceStatusSeverity,
  AiServiceStatusSnapshot,
  WaveSpeedStatusSummary,
} from './types';

export function severityToColor(
  severity: AiServiceStatusSeverity,
): AiServiceStatusColor {
  switch (severity) {
    case 'ok':
      return 'green';
    case 'degraded':
      return 'yellow';
    case 'outage':
      return 'red';
    case 'unknown':
    default:
      return 'gray';
  }
}

/**
 * Map WaveSpeed public summary → green / yellow / red.
 * Green only when the page is UP and both incident/maintenance lists are empty.
 */
export function resolveAiServiceStatusSeverity(
  summary: WaveSpeedStatusSummary,
): AiServiceStatusSeverity {
  const pageStatus = (summary.page?.status ?? '').trim().toUpperCase();
  const incidents = Array.isArray(summary.activeIncidents)
    ? summary.activeIncidents.length
    : 0;
  const maintenances = Array.isArray(summary.activeMaintenances)
    ? summary.activeMaintenances.length
    : 0;

  if (
    incidents > 0 ||
    pageStatus === 'HASISSUES' ||
    pageStatus === 'DOWN'
  ) {
    return 'outage';
  }

  if (maintenances > 0 || pageStatus === 'UNDERMAINTENANCE') {
    return 'degraded';
  }

  if (pageStatus === 'UP') {
    return 'ok';
  }

  return 'unknown';
}

export function buildAiServiceStatusSnapshot(
  summary: WaveSpeedStatusSummary,
  source: AiServiceStatusSnapshot['source'],
  fetchedAt: number = Date.now(),
): AiServiceStatusSnapshot {
  const severity = resolveAiServiceStatusSeverity(summary);
  return {
    severity,
    color: severityToColor(severity),
    pageStatus: summary.page?.status?.trim() || null,
    activeIncidentsCount: Array.isArray(summary.activeIncidents)
      ? summary.activeIncidents.length
      : 0,
    activeMaintenancesCount: Array.isArray(summary.activeMaintenances)
      ? summary.activeMaintenances.length
      : 0,
    fetchedAt,
    source,
  };
}

export function unknownAiServiceStatusSnapshot(
  source: AiServiceStatusSnapshot['source'] = 'fallback',
): AiServiceStatusSnapshot {
  return {
    severity: 'unknown',
    color: 'gray',
    pageStatus: null,
    activeIncidentsCount: 0,
    activeMaintenancesCount: 0,
    fetchedAt: Date.now(),
    source,
  };
}
