import { SETTING_KEYS } from '@/services/database/constants';
import { getSetting, setSetting } from '@/services/database/settingsRepository';
import type {
  AiServiceStatusColor,
  AiServiceStatusSeverity,
  AiServiceStatusSnapshot,
} from '@/services/aiServiceStatus';

type PersistedDegradedStatus = {
  severity: Exclude<AiServiceStatusSeverity, 'ok' | 'unknown'>;
  color: Extract<AiServiceStatusColor, 'yellow' | 'red'>;
  pageStatus: string | null;
  activeIncidentsCount: number;
  activeMaintenancesCount: number;
  fetchedAt: number;
};

function isPersistedDegradedStatus(
  value: unknown,
): value is PersistedDegradedStatus {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const row = value as PersistedDegradedStatus;
  return (
    (row.severity === 'degraded' || row.severity === 'outage') &&
    (row.color === 'yellow' || row.color === 'red') &&
    typeof row.fetchedAt === 'number' &&
    typeof row.activeIncidentsCount === 'number' &&
    typeof row.activeMaintenancesCount === 'number'
  );
}

/** Persist yellow/red snapshots so Studio can show last known issues offline. */
export async function persistDegradedAiServiceStatus(
  snapshot: AiServiceStatusSnapshot,
): Promise<void> {
  if (snapshot.severity !== 'degraded' && snapshot.severity !== 'outage') {
    await clearDegradedAiServiceStatus();
    return;
  }

  const payload: PersistedDegradedStatus = {
    severity: snapshot.severity,
    color: snapshot.color === 'yellow' ? 'yellow' : 'red',
    pageStatus: snapshot.pageStatus,
    activeIncidentsCount: snapshot.activeIncidentsCount,
    activeMaintenancesCount: snapshot.activeMaintenancesCount,
    fetchedAt: snapshot.fetchedAt,
  };

  await setSetting(
    SETTING_KEYS.AI_SERVICE_STATUS_DEGRADED,
    JSON.stringify(payload),
  );
}

export async function clearDegradedAiServiceStatus(): Promise<void> {
  await setSetting(SETTING_KEYS.AI_SERVICE_STATUS_DEGRADED, '');
}

export async function getCachedDegradedAiServiceStatus(): Promise<AiServiceStatusSnapshot | null> {
  const raw = await getSetting(SETTING_KEYS.AI_SERVICE_STATUS_DEGRADED);
  if (!raw?.trim()) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedDegradedStatus(parsed)) {
      return null;
    }
    return {
      ...parsed,
      source: 'cache',
    };
  } catch {
    return null;
  }
}
