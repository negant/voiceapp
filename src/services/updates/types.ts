export type AppUpdateStatus =
  | { state: 'checking' }
  | { state: 'current' }
  | { state: 'available'; version: string }
  | { state: 'unknown' };
