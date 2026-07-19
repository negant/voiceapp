import { canCompleteLaunch } from './launch';

describe('canCompleteLaunch', () => {
  it('waits for app readiness and minimum duration', () => {
    expect(canCompleteLaunch(false, false)).toBe(false);
    expect(canCompleteLaunch(true, false)).toBe(false);
    expect(canCompleteLaunch(false, true)).toBe(false);
    expect(canCompleteLaunch(true, true)).toBe(true);
  });
});
