import { CooperativeYield, yieldToEventLoop } from '@/utils/asyncYield';

describe('CooperativeYield', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('yields immediately when forced', async () => {
    const scheduler = new CooperativeYield(1_000);
    const promise = scheduler.maybeYield(true);

    jest.runAllTimers();
    await expect(promise).resolves.toBeUndefined();
  });

  it('skips back-to-back yields inside the interval', async () => {
    const scheduler = new CooperativeYield(500);

    const first = scheduler.maybeYield(true);
    jest.runAllTimers();
    await first;

    const second = scheduler.maybeYield();
    await expect(second).resolves.toBeUndefined();
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe('yieldToEventLoop', () => {
  it('resolves on the next tick', async () => {
    jest.useFakeTimers();
    const promise = yieldToEventLoop();
    jest.runAllTimers();
    await expect(promise).resolves.toBeUndefined();
    jest.useRealTimers();
  });
});
