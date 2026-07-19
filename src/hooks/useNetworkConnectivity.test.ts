jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(() =>
      Promise.resolve({ isConnected: true, isInternetReachable: true }),
    ),
  },
}));

import { isNetInfoOnline } from '@/hooks/useNetworkConnectivity';

describe('isNetInfoOnline', () => {
  it('treats null state as online', () => {
    expect(isNetInfoOnline(null)).toBe(true);
  });

  it('returns false when disconnected', () => {
    expect(
      isNetInfoOnline({ isConnected: false, isInternetReachable: null }),
    ).toBe(false);
  });

  it('returns false when internet is explicitly unreachable', () => {
    expect(
      isNetInfoOnline({ isConnected: true, isInternetReachable: false }),
    ).toBe(false);
  });

  it('returns true when connected and reachable or unknown', () => {
    expect(
      isNetInfoOnline({ isConnected: true, isInternetReachable: true }),
    ).toBe(true);
    expect(
      isNetInfoOnline({ isConnected: true, isInternetReachable: null }),
    ).toBe(true);
  });
});
