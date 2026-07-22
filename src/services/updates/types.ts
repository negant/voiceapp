export type AppUpdateStatus =
  | { state: 'checking' }
  | { state: 'current' }
  | {
      state: 'available';
      version: string;
      storeUrlAndroid?: string;
      storeUrlIos?: string;
    }
  | {
      state: 'required';
      version: string;
      storeUrlAndroid?: string;
      storeUrlIos?: string;
    }
  | { state: 'unknown' };
