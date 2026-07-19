import {
  createDeviceId,
  isValidDeviceId,
} from '@/services/device/deviceId';

describe('deviceId', () => {
  it('creates a valid UUID v4 shape', () => {
    const id = createDeviceId();
    expect(isValidDeviceId(id)).toBe(true);
  });

  it('rejects empty / short ids', () => {
    expect(isValidDeviceId('')).toBe(false);
    expect(isValidDeviceId('abc')).toBe(false);
    expect(isValidDeviceId(null)).toBe(false);
  });
});
