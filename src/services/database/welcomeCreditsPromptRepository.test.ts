import {
  clearPendingWelcomeCreditsPrompt,
  getPendingWelcomeCreditsPrompt,
  setPendingWelcomeCreditsPrompt,
} from '@/services/database/welcomeCreditsPromptRepository';
import { SETTING_KEYS } from '@/services/database/constants';
import { getSetting, setSetting } from '@/services/database/settingsRepository';

jest.mock('@/services/database/settingsRepository', () => ({
  getSetting: jest.fn(),
  setSetting: jest.fn(),
}));

describe('welcomeCreditsPromptRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads a pending prompt amount', async () => {
    (getSetting as jest.Mock).mockResolvedValue('10');
    await expect(getPendingWelcomeCreditsPrompt()).resolves.toBe(10);
  });

  it('returns null when cleared or invalid', async () => {
    (getSetting as jest.Mock).mockResolvedValue('0');
    await expect(getPendingWelcomeCreditsPrompt()).resolves.toBeNull();

    (getSetting as jest.Mock).mockResolvedValue(null);
    await expect(getPendingWelcomeCreditsPrompt()).resolves.toBeNull();
  });

  it('persists a pending prompt amount', async () => {
    await setPendingWelcomeCreditsPrompt(10);
    expect(setSetting).toHaveBeenCalledWith(
      SETTING_KEYS.WELCOME_CREDITS_PROMPT,
      '10',
    );
  });

  it('clears the pending prompt', async () => {
    await clearPendingWelcomeCreditsPrompt();
    expect(setSetting).toHaveBeenCalledWith(
      SETTING_KEYS.WELCOME_CREDITS_PROMPT,
      '0',
    );
  });
});
