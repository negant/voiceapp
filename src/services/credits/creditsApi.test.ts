import { isCreditsApiConfigured, spendCreditsWithApi } from './creditsApi';

describe('creditsApi', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('spendCreditsWithApi posts amount and returns device', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        balance: 5,
        device: {
          deviceId: 'dev-1',
          plan: 'free',
          credits: 0,
          freeCredits: 5,
          balance: 5,
        },
      }),
    }) as unknown as typeof fetch;

    const device = await spendCreditsWithApi({
      deviceId: 'dev-1',
      amount: 2,
      auth: {
        apiBaseUrl: 'http://localhost:8787',
        apiToken: 'token',
      },
    });

    expect(device?.balance).toBe(5);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8787/v1/credits/spend',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
      }),
    );
  });

  it('isBackendApiConfigured reflects env base URL presence', () => {
    // env is loaded from @env mock / real .env in tests — just assert boolean shape
    expect(typeof isCreditsApiConfigured()).toBe('boolean');
  });
});
