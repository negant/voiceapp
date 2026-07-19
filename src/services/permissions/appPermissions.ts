import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

import {
  getPermissionStatus,
  setPermissionStatus,
} from '@/services/database/permissionRepository';
import type { PermissionKind, PermissionStatus } from '@/types/permissions';

export type PermissionRequestResult = {
  granted: boolean;
  status: PermissionStatus;
};

async function requestAndroidStoragePermission(): Promise<PermissionRequestResult> {
  if (Platform.OS !== 'android') {
    return { granted: true, status: 'granted' };
  }

  const apiLevel = Platform.Version;
  const permission =
    typeof apiLevel === 'number' && apiLevel >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  const alreadyGranted = await PermissionsAndroid.check(permission);
  if (alreadyGranted) {
    await setPermissionStatus('storage', 'granted');
    return { granted: true, status: 'granted' };
  }

  const result = await PermissionsAndroid.request(permission);
  const granted = result === PermissionsAndroid.RESULTS.GRANTED;
  const status: PermissionStatus = granted ? 'granted' : 'denied';
  await setPermissionStatus('storage', status);
  return { granted, status };
}

async function requestAndroidMicrophonePermission(): Promise<PermissionRequestResult> {
  if (Platform.OS !== 'android') {
    return { granted: true, status: 'granted' };
  }

  const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
  const alreadyGranted = await PermissionsAndroid.check(permission);
  if (alreadyGranted) {
    await setPermissionStatus('microphone', 'granted');
    return { granted: true, status: 'granted' };
  }

  const result = await PermissionsAndroid.request(permission);
  const granted = result === PermissionsAndroid.RESULTS.GRANTED;
  const status: PermissionStatus = granted ? 'granted' : 'denied';
  await setPermissionStatus('microphone', status);
  return { granted, status };
}

export async function ensurePermission(
  kind: PermissionKind,
): Promise<PermissionRequestResult> {
  const stored = await getPermissionStatus(kind);
  if (stored === 'granted') {
    return { granted: true, status: 'granted' };
  }

  if (kind === 'storage') {
    return requestAndroidStoragePermission();
  }

  return requestAndroidMicrophonePermission();
}

export async function hasPermission(kind: PermissionKind): Promise<boolean> {
  const stored = await getPermissionStatus(kind);
  if (stored === 'granted') {
    return true;
  }

  if (Platform.OS === 'android') {
    const permission =
      kind === 'storage'
        ? typeof Platform.Version === 'number' && Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        : PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;

    const granted = await PermissionsAndroid.check(permission);
    if (granted) {
      await setPermissionStatus(kind, 'granted');
    }
    return granted;
  }

  // iOS document picker and MediaStore export do not need storage runtime permission.
  return kind === 'storage';
}

export function showPermissionDeniedAlert(
  title: string,
  message: string,
): void {
  Alert.alert(title, message, [
    { text: 'OK', style: 'cancel' },
    {
      text: 'Settings',
      onPress: () => {
        Linking.openSettings().catch(() => undefined);
      },
    },
  ]);
}
