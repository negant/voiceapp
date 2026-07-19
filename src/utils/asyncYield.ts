/** Minimum gap between cooperative yields while processing heavy audio work. */
export const COOPERATIVE_YIELD_INTERVAL_MS = 150;

/** Sample frames processed per batch before yielding to the event loop. */
export const COOPERATIVE_FRAME_BATCH = 32_768;

export function yieldToEventLoop(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}

/** Yields to the event loop at most once per interval — keeps UI responsive without per-batch cost. */
export class CooperativeYield {
  private lastYieldAt = 0;

  constructor(
    private readonly intervalMs: number = COOPERATIVE_YIELD_INTERVAL_MS,
  ) {}

  async maybeYield(force = false): Promise<void> {
    const now = Date.now();
    if (force || now - this.lastYieldAt >= this.intervalMs) {
      await yieldToEventLoop();
      this.lastYieldAt = Date.now();
    }
  }

  reset(): void {
    this.lastYieldAt = 0;
  }
}
