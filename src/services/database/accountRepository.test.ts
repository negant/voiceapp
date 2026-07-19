import {
  ensureInitialAccountPlan,
  isPremiumAccountPlan,
  parseAccountPlan,
  setAccountPlan,
} from '@/services/database/accountRepository';
import { getSetting, setSetting } from '@/services/database/settingsRepository';

jest.mock('@/services/database/settingsRepository', () => ({
  getSetting: jest.fn(),
  setSetting: jest.fn(),
}));

describe('accountRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parses known account plans', () => {
    expect(parseAccountPlan('free')).toBe('free');
    expect(parseAccountPlan('premium')).toBe('premium');
    expect(parseAccountPlan('unknown')).toBeNull();
  });

  it('seeds the default free plan on first read', async () => {
    (getSetting as jest.Mock).mockResolvedValue(null);

    await expect(ensureInitialAccountPlan()).resolves.toBe('free');
    expect(setSetting).toHaveBeenCalledWith('account_plan', 'free');
  });

  it('persists premium plan updates', async () => {
    await setAccountPlan('premium');
    expect(setSetting).toHaveBeenCalledWith('account_plan', 'premium');
    expect(isPremiumAccountPlan('premium')).toBe(true);
    expect(isPremiumAccountPlan('free')).toBe(false);
  });
});
