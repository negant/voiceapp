import {
  clearDegradedAiServiceStatus,
  getCachedDegradedAiServiceStatus,
  persistDegradedAiServiceStatus,
} from './aiServiceStatusRepository';
import { getSetting, setSetting } from '@/services/database/settingsRepository';
import type { AiServiceStatusSnapshot } from '@/services/aiServiceStatus';

jest.mock('@/services/database/settingsRepository', () => ({
  getSetting: jest.fn(),
  setSetting: jest.fn(),
}));

const getSettingMock = getSetting as jest.MockedFunction<typeof getSetting>;
const setSettingMock = setSetting as jest.MockedFunction<typeof setSetting>;

describe('aiServiceStatusRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists yellow/red snapshots', async () => {
    const snapshot: AiServiceStatusSnapshot = {
      severity: 'degraded',
      color: 'yellow',
      pageStatus: 'UNDERMAINTENANCE',
      activeIncidentsCount: 0,
      activeMaintenancesCount: 1,
      fetchedAt: 123,
      source: 'network',
    };

    await persistDegradedAiServiceStatus(snapshot);

    expect(setSettingMock).toHaveBeenCalledWith(
      'ai_service_status_degraded',
      JSON.stringify({
        severity: 'degraded',
        color: 'yellow',
        pageStatus: 'UNDERMAINTENANCE',
        activeIncidentsCount: 0,
        activeMaintenancesCount: 1,
        fetchedAt: 123,
      }),
    );
  });

  it('clears storage for ok snapshots', async () => {
    await persistDegradedAiServiceStatus({
      severity: 'ok',
      color: 'green',
      pageStatus: 'UP',
      activeIncidentsCount: 0,
      activeMaintenancesCount: 0,
      fetchedAt: 1,
      source: 'network',
    });

    expect(setSettingMock).toHaveBeenCalledWith(
      'ai_service_status_degraded',
      '',
    );
  });

  it('reads cached degraded status', async () => {
    getSettingMock.mockResolvedValue(
      JSON.stringify({
        severity: 'outage',
        color: 'red',
        pageStatus: 'HASISSUES',
        activeIncidentsCount: 2,
        activeMaintenancesCount: 0,
        fetchedAt: 99,
      }),
    );

    await expect(getCachedDegradedAiServiceStatus()).resolves.toEqual({
      severity: 'outage',
      color: 'red',
      pageStatus: 'HASISSUES',
      activeIncidentsCount: 2,
      activeMaintenancesCount: 0,
      fetchedAt: 99,
      source: 'cache',
    });
  });

  it('clearDegradedAiServiceStatus writes empty value', async () => {
    await clearDegradedAiServiceStatus();
    expect(setSettingMock).toHaveBeenCalledWith(
      'ai_service_status_degraded',
      '',
    );
  });
});
