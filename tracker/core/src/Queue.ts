/**
 * Our Queue generic interface.
 */
export interface Queue<T> {
  /**
   * Adds an Item to the Queue
   */
  enqueue(item: T): void;

  /**
   * Retrieves the oldest available Item(s) from the Queue
   */
  dequeue(batchSize?: number): T[];
}

/**
 * Configuration object for the queue runner.
 */
export type QueueRunnerConfig = {
  /**
   * How many items to dequeue at the same time
   */
  batchSize?: number;

  /**
   * How often to re-run and dequeue again
   */
  batchDelayMs?: number;
};

/**
 * Our QueueRunner generic interface.
 */
export interface QueueRunner<T> {
  /**
   * How many items to dequeue at the same time.
   */
  readonly batchSize: number;

  /**
   * How often to re-run and dequeue again.
   */
  readonly batchDelayMs: number;

  /**
   * Queue runner function. Simply executes the given `runFunction` with the dequeued items.
   */
  run(runFunction: (items: T[]) => Promise<void>): void;
}

/**
 * A very simple Memory Queue generic implementation based on a JavaScript array.
 * It uses setInterval for a continuously consuming runner.
 */
export class MemoryQueue<T> implements Queue<T>, QueueRunner<T> {
  items: T[] = [];
  readonly batchSize: number;
  readonly batchDelayMs: number;

  /**
   * Initializes batching configuration with some sensible values.
   */
  constructor(config?: QueueRunnerConfig) {
    this.batchSize = config?.batchSize ?? 10;
    this.batchDelayMs = config?.batchDelayMs ?? 250;
  }

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(batchSize = 1): T[] {
    return this.items.splice(0, batchSize);
  }

  // TODO this is way too simplistic, if the batch fails we just lost it. Need to add more complexity, retry, etc
  run(runFunction: (items: T[]) => Promise<void>): void {
    setInterval(async () => {
      const eventsBatch = this.dequeue(this.batchSize);
      if (eventsBatch.length) {
        await runFunction(eventsBatch);
      }
    }, this.batchDelayMs);
  }
}
