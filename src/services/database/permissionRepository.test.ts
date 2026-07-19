import {
  parsePermissionStatus,
} from '@/services/database/permissionRepository';

describe('permissionRepository', () => {
  it('parses stored permission statuses', () => {
    expect(parsePermissionStatus('granted')).toBe('granted');
    expect(parsePermissionStatus('denied')).toBe('denied');
    expect(parsePermissionStatus('unknown')).toBe('unknown');
    expect(parsePermissionStatus('invalid')).toBeNull();
  });
});
