import { DEFAULT_STARTING_CREDITS } from '@/config/credits';
import {
  CREDITS_SEED_VERSION_FREE_WELCOME,
  ensureInitialCreditsBalance,
  getCreditsBalance,
  parseCreditsBalance,
  resolveWelcomeCredits,
  setCreditsBalance,
} from '@/services/database/creditsRepository';
import { SETTING_KEYS } from '@/services/database/constants';
import { getSetting, setSetting } from '@/services/database/settingsRepository';

jest.mock('@/services/database/settingsRepository', () => ({
  getSetting: jest.fn(),
  setSetting: jest.fn(),
}));

describe('parseCreditsBalance', () => {
  it('returns null for invalid values', () => {
    expect(parseCreditsBalance(null)).toBeNull();
    expect(parseCreditsBalance('')).toBeNull();
    expect(parseCreditsBalance('abc')).toBeNull();
    expect(parseCreditsBalance('-5')).toBeNull();
  });

  it('parses non-negative integers', () => {
    expect(parseCreditsBalance('1000')).toBe(1000);
    expect(parseCreditsBalance('0')).toBe(0);
  });
});

describe('resolveWelcomeCredits', () => {
  it('returns the free-plan default welcome grant', () => {
    expect(resolveWelcomeCredits()).toBe(DEFAULT_STARTING_CREDITS);
    expect(resolveWelcomeCredits()).toBe(10);
  });
});

describe('creditsRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('seeds welcome credits when balance is missing', async () => {
    (getSetting as jest.Mock).mockResolvedValue(null);

    const balance = await ensureInitialCreditsBalance();

    expect(balance).toBe(10);
    expect(setSetting).toHaveBeenCalledWith(
      SETTING_KEYS.CREDITS_BALANCE,
      '10',
    );
    expect(setSetting).toHaveBeenCalledWith(
      SETTING_KEYS.CREDITS_SEED_VERSION,
      CREDITS_SEED_VERSION_FREE_WELCOME,
    );
  });

  it('resets legacy full welcome balance (250) to current grant', async () => {
    (getSetting as jest.Mock).mockImplementation(async (key: string) => {
      if (key === SETTING_KEYS.CREDITS_SEED_VERSION) {
        return 'free-welcome-250';
      }
      if (key === SETTING_KEYS.CREDITS_BALANCE) {
        return '250';
      }
      return null;
    });

    const balance = await ensureInitialCreditsBalance();

    expect(balance).toBe(10);
    expect(setSetting).toHaveBeenCalledWith(SETTING_KEYS.CREDITS_BALANCE, '10');
  });

  it('upgrades zero balance to welcome credits once', async () => {
    (getSetting as jest.Mock).mockImplementation(async (key: string) => {
      if (key === SETTING_KEYS.CREDITS_SEED_VERSION) {
        return null;
      }
      if (key === SETTING_KEYS.CREDITS_BALANCE) {
        return '0';
      }
      return null;
    });

    const balance = await ensureInitialCreditsBalance();

    expect(balance).toBe(10);
  });

  it('keeps spent zero balance after current seed is marked', async () => {
    (getSetting as jest.Mock).mockImplementation(async (key: string) => {
      if (key === SETTING_KEYS.CREDITS_SEED_VERSION) {
        return CREDITS_SEED_VERSION_FREE_WELCOME;
      }
      if (key === SETTING_KEYS.CREDITS_BALANCE) {
        return '0';
      }
      return null;
    });

    const balance = await ensureInitialCreditsBalance();

    expect(balance).toBe(0);
    expect(setSetting).not.toHaveBeenCalled();
  });

  it('returns stored balance without re-seeding', async () => {
    (getSetting as jest.Mock).mockImplementation(async (key: string) => {
      if (key === SETTING_KEYS.CREDITS_SEED_VERSION) {
        return CREDITS_SEED_VERSION_FREE_WELCOME;
      }
      if (key === SETTING_KEYS.CREDITS_BALANCE) {
        return '7';
      }
      return null;
    });

    const balance = await ensureInitialCreditsBalance();

    expect(balance).toBe(7);
    expect(setSetting).not.toHaveBeenCalled();
  });

  it('falls back to welcome credits when read value is invalid', async () => {
    (getSetting as jest.Mock).mockResolvedValue('not-a-number');

    const balance = await getCreditsBalance();

    expect(balance).toBe(10);
  });

  it('persists updated balance', async () => {
    await setCreditsBalance(420);

    expect(setSetting).toHaveBeenCalledWith(SETTING_KEYS.CREDITS_BALANCE, '420');
  });

  it('rejects invalid balance updates', async () => {
    await expect(setCreditsBalance(-1)).rejects.toThrow('Invalid credits balance');
  });
});
