import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/** True when the device reports an internet-capable connection. */
export function isNetInfoOnline(
  state: {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
  } | null,
): boolean {
  if (!state) {
    return true;
  }

  if (state.isConnected === false) {
    return false;
  }

  // null = unknown (e.g. some Android builds) — treat as online until proven offline
  if (state.isInternetReachable === false) {
    return false;
  }

  return true;
}

/** Subscribes to NetInfo and exposes a simple online flag for cloud AI effects. */
export function useNetworkConnectivity(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(isNetInfoOnline(state));
    });

    NetInfo.fetch()
      .then(state => {
        setIsOnline(isNetInfoOnline(state));
      })
      .catch(() => {
        setIsOnline(true);
      });

    return unsubscribe;
  }, []);

  return { isOnline };
}
