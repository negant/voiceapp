import {
  ensureInitialCreditsEconomy,
  getCreditsPerAi10Sec,
  setCreditsPerAi10Sec,
} from '@/services/database/creditsEconomyRepository';
import { getSetting, setSetting } from '@/services/database/settingsRepository';

jest.mock('@/services/database/settingsRepository', () => ({
  getSetting: jest.fn(),
  setSetting: jest.fn(),
}));

describe('creditsEconomyRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('seeds the default legacy credits_per_ai_10_sec rate (1)', async () => {
    (getSetting as jest.Mock).mockResolvedValue(null);

    await expect(ensureInitialCreditsEconomy()).resolves.toEqual({
      creditsPerAi10Sec: 1,
    });
    expect(setSetting).toHaveBeenCalledWith('credits_per_ai_10_sec', '1');
  });

  it('reads a persisted rate', async () => {
    (getSetting as jest.Mock).mockResolvedValue('150');

    await expect(getCreditsPerAi10Sec()).resolves.toBe(150);
  });

  it('persists rate updates for future API sync', async () => {
    await setCreditsPerAi10Sec(120);
    expect(setSetting).toHaveBeenCalledWith('credits_per_ai_10_sec', '120');
  });
});
