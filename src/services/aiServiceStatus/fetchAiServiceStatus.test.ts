import {
  DEFAULT_AI_SERVICE_STATUS_URL,
  fetchAiServiceStatus,
  resolveAiServiceStatusUrl,
} from './fetchAiServiceStatus';

jest.mock('@/config/env', () => ({
  env: {
    aiEffectsApiStatusUrl: 'https://api.wavespeed.ai/public/v3/summary.json',
  },
}));

describe('resolveAiServiceStatusUrl', () => {
  it('uses env status URL by default', () => {
    expect(resolveAiServiceStatusUrl()).toBe(
      'https://api.wavespeed.ai/public/v3/summary.json',
    );
  });

  it('allows an explicit override', () => {
    expect(
      resolveAiServiceStatusUrl('https://status.example/summary.json/'),
    ).toBe('https://status.example/summary.json');
  });

  it('exposes the WaveSpeed default constant', () => {
    expect(DEFAULT_AI_SERVICE_STATUS_URL).toBe(
      'https://api.wavespeed.ai/public/v3/summary.json',
    );
  });
});

describe('fetchAiServiceStatus', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('returns ok snapshot for healthy summary', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        page: { status: 'UP' },
        activeIncidents: [],
        activeMaintenances: [],
      }),
    });

    const snapshot = await fetchAiServiceStatus(
      'https://api.wavespeed.ai/public/v3/summary.json',
    );

    expect(snapshot.severity).toBe('ok');
    expect(snapshot.color).toBe('green');
    expect(snapshot.source).toBe('network');
  });

  it('returns unknown when the request fails', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const snapshot = await fetchAiServiceStatus(
      'https://api.wavespeed.ai/public/v3/summary.json',
    );

    expect(snapshot.severity).toBe('unknown');
    expect(snapshot.color).toBe('gray');
    expect(snapshot.source).toBe('fallback');
  });
});
